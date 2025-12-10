import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Delivery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    partialReturn: 0,
    fullyReturned: 0,
    failed: 0,
    totalCash: 0,
    returnsCount: 0
  });
  
  const [filters, setFilters] = useState({
    status: "all",
    riderId: "all",
    dateFrom: "",
    dateTo: "",
    shopId: ""
  });
  
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchDeliveries();
    }
  }, [user, navigate]);

  // Fetch all deliveries
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://n8n.edutechpulse.online/webhook/all-delivery");
      
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries || []);
        calculateStats(data.deliveries || []);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      // Sample data for demo
      const sampleData = getSampleData();
      setDeliveries(sampleData);
      calculateStats(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const delivered = data.filter(d => d.status === "Delivered").length;
    const partialReturn = data.filter(d => d.status === "Partial Return").length;
    const fullyReturned = data.filter(d => d.status === "Fully Returned").length;
    const failed = data.filter(d => d.status === "Failed").length;
    const totalCash = data.reduce((sum, d) => sum + (d.cash_received || 0), 0);
    const returnsCount = data.reduce((sum, d) => sum + (d.return_items?.length || 0), 0);
    
    setStats({
      total,
      delivered,
      partialReturn,
      fullyReturned,
      failed,
      totalCash,
      returnsCount
    });
  };

  // Get unique riders for filter
  const uniqueRiders = [...new Set(deliveries.map(d => d.rider_id))];

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(delivery => {
    if (filters.status !== "all" && delivery.status !== filters.status) return false;
    if (filters.riderId !== "all" && delivery.rider_id !== filters.riderId) return false;
    if (filters.shopId && !delivery.shop_id.includes(filters.shopId)) return false;
    
    if (filters.dateFrom || filters.dateTo) {
      const deliveryDate = new Date(delivery.timestamp);
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (deliveryDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (deliveryDate > toDate) return false;
      }
    }
    
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Partial Return': return 'bg-yellow-100 text-yellow-800';
      case 'Fully Returned': return 'bg-red-100 text-red-800';
      case 'Failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      riderId: "all",
      dateFrom: "",
      dateTo: "",
      shopId: ""
    });
  };

  const viewDeliveryDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetails(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order ID', 'Shop ID', 'Rider', 'Cash Received', 'Status', 'Date', 'Return Items'];
    const csvData = filteredDeliveries.map(d => [
      d.order_id,
      d.shop_id,
      d.rider_name,
      d.cash_received,
      d.status,
      formatDateTime(d.timestamp),
      d.return_items?.length || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deliveries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Delivery Dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching delivery data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">📦 Delivery Management</h1>
                <p className="text-gray-600 text-sm">Track and manage all deliveries</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDeliveries}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              
              <button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-gray-500 text-sm font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-gray-400 text-xs mt-1">Deliveries</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-gray-400 text-xs mt-1">{stats.total > 0 ? `${((stats.delivered/stats.total)*100).toFixed(1)}%` : '0%'}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Partial Return</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.partialReturn}</p>
            <p className="text-gray-400 text-xs mt-1">Items returned</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-red-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Fully Returned</p>
            <p className="text-2xl font-bold text-red-600">{stats.fullyReturned}</p>
            <p className="text-gray-400 text-xs mt-1">Complete returns</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-gray-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Failed</p>
            <p className="text-2xl font-bold text-gray-600">{stats.failed}</p>
            <p className="text-gray-400 text-xs mt-1">Not delivered</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Cash</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalCash)}</p>
            <p className="text-gray-400 text-xs mt-1">Collected</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm font-medium mb-1">Return Items</p>
            <p className="text-2xl font-bold text-purple-600">{stats.returnsCount}</p>
            <p className="text-gray-400 text-xs mt-1">Total items returned</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 md:mt-0"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="Delivered">Delivered</option>
                <option value="Partial Return">Partial Return</option>
                <option value="Fully Returned">Fully Returned</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Rider</label>
              <select
                value={filters.riderId}
                onChange={(e) => setFilters({...filters, riderId: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Riders</option>
                {uniqueRiders.map(rider => (
                  <option key={rider} value={rider}>{rider}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Shop ID</label>
              <input
                type="text"
                value={filters.shopId}
                onChange={(e) => setFilters({...filters, shopId: e.target.value})}
                placeholder="Enter Shop ID"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredDeliveries.length} of {deliveries.length} deliveries
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">All Deliveries</h2>
                <p className="text-gray-600 text-sm">Delivery records with status and cash collection</p>
              </div>
              <div className="mt-2 md:mt-0 text-sm text-gray-500">
                Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
          
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-600">No deliveries found</h3>
              <p className="mt-1 text-gray-500">
                {deliveries.length === 0 
                  ? 'No delivery records yet. Deliveries will appear here once riders update status.' 
                  : 'No deliveries match your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{delivery.order_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-700">{delivery.shop_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{delivery.rider_name}</div>
                          <div className="text-xs text-gray-500">{delivery.rider_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-green-600">{formatCurrency(delivery.cash_received)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-700 text-sm">{formatDateTime(delivery.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-center px-2 py-1 rounded ${delivery.return_items?.length > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                          {delivery.return_items?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => viewDeliveryDetails(delivery)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredDeliveries.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page 1 of 1 • Showing {filteredDeliveries.length} deliveries
                </div>
                <div className="mt-2 md:mt-0">
                  <button
                    onClick={() => window.print()}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delivery Details Modal */}
      {showDetails && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Delivery Details</h3>
                  <p className="text-gray-600">Complete information for this delivery</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Order Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{selectedDelivery.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shop ID:</span>
                      <span className="font-medium">{selectedDelivery.shop_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}>
                        {selectedDelivery.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Rider Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rider Name:</span>
                      <span className="font-medium">{selectedDelivery.rider_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rider ID:</span>
                      <span className="font-medium">{selectedDelivery.rider_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Time:</span>
                      <span className="font-medium">{formatDateTime(selectedDelivery.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Financial Information</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Cash Received</div>
                      <div className="text-2xl font-bold text-green-700">{formatCurrency(selectedDelivery.cash_received)}</div>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>
              </div>
              
              {selectedDelivery.return_items && selectedDelivery.return_items.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Return Items ({selectedDelivery.return_items.length})</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedDelivery.return_items.map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-gray-500">Product ID</div>
                              <div className="font-medium">{item.product_id}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Quantity</div>
                              <div className="font-medium">{item.qty}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Reason</div>
                              <div className="font-medium">{item.reason}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Action</div>
                              <div className="font-medium">{item.action}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Add print functionality
                      window.print();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Print Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 bg-white border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  📦
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Delivery Management System</p>
                  <p className="text-gray-500 text-sm">Smart Distribution Admin</p>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                Logged in as: <span className="font-semibold">{user?.name}</span> (Admin)
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sample data for demo
function getSampleData() {
  return [
    {
      id: 1,
      order_id: "ORD-1765301472935",
      shop_id: "SHP-010",
      cash_received: 1500,
      status: "Delivered",
      timestamp: "2025-12-09T00:10:00.000Z",
      rider_id: "rider1",
      rider_name: "Ali",
      return_items: []
    },
    {
      id: 2,
      order_id: "ORD-1764790139358",
      shop_id: "SHP-003",
      cash_received: 11376,
      status: "Delivered",
      timestamp: "2025-12-10T00:17:00.000Z",
      rider_id: "rider1",
      rider_name: "Ali",
      return_items: []
    },
    {
      id: 3,
      order_id: "ORD-1764950314067",
      shop_id: "SHP-021",
      cash_received: 183960,
      status: "Partial Return",
      timestamp: "2025-12-05T14:30:00.000Z",
      rider_id: "rider2",
      rider_name: "Ahmed",
      return_items: [
        {
          product_id: "P012",
          qty: 5,
          reason: "Expired",
          action: "Restock"
        }
      ]
    },
    {
      id: 4,
      order_id: "ORD-1764950314068",
      shop_id: "SHP-015",
      cash_received: 0,
      status: "Fully Returned",
      timestamp: "2025-12-08T11:15:00.000Z",
      rider_id: "rider3",
      rider_name: "Usman",
      return_items: [
        {
          product_id: "P011",
          qty: 2,
          reason: "Damaged",
          action: "Dispose"
        },
        {
          product_id: "P014",
          qty: 3,
          reason: "Shop Rejected",
          action: "Return to Vendor"
        }
      ]
    },
    {
      id: 5,
      order_id: "ORD-1764950314069",
      shop_id: "SHP-008",
      cash_received: 5400,
      status: "Failed",
      timestamp: "2025-12-07T09:45:00.000Z",
      rider_id: "rider1",
      rider_name: "Ali",
      return_items: []
    }
  ];
}