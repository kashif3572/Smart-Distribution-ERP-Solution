import React, { useEffect, useState } from "react";

export default function Orders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("https://n8n.edutechpulse.online/webhook/Today-Order", {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      // Validate data structure
      if (!json || typeof json !== 'object') {
        throw new Error('Invalid data received from server');
      }
      
      // Check if data has expected structure
      if (!json.summary && !json.orders) {
        // Handle different response format
        if (Array.isArray(json)) {
          setData({
            summary: {
              totalOrders: json.length,
              totalRevenue: json.reduce((sum, order) => sum + (order.TotalAmount || 0), 0),
              uniqueShops: new Set(json.map(order => order.ShopID || order.shopId)).size,
              uniqueStaffMembers: new Set(json.map(order => order.StaffID || order.staffId)).size
            },
            orders: json.map(order => ({
              orderId: order.OrderID || order.orderId,
              orderDate: order.Date || order.orderDate,
              shopId: order.ShopID || order.shopId,
              staffId: order.StaffID || order.staffId,
              totalAmount: order.TotalAmount || order.totalAmount,
              status: order.Status || order.status,
              proofLink: order.ProofLink || order.proofLink
            }))
          });
        } else {
          throw new Error('Unexpected data format');
        }
      } else {
        setData(json);
      }
      
    } catch (err) {
      console.error("Error fetching orders:", err);
      
      // Handle different error types
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        setError('Request timeout: Server is taking too long to respond.');
      } else if (err.name === 'TypeError') {
        setError('Network error: Unable to connect to server. Please check your internet connection.');
      } else {
        setError(`Failed to load orders: ${err.message}`);
      }
      
      // Set empty data structure for fallback UI
      setData({
        summary: {
          totalOrders: 0,
          totalRevenue: 0,
          uniqueShops: 0,
          uniqueStaffMembers: 0
        },
        orders: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [retryCount]);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'Rs 0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Today's Orders...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching order data from server</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📦 Today's Orders</h1>
            <p className="text-gray-600 mt-2">Orders placed today - {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Unable to load latest data</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}</p>
                  <p className="mt-1">Showing cached data or empty state</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          label="Total Orders" 
          value={data?.summary?.totalOrders || 0} 
          isLoading={loading && !error}
        />
        <Card 
          label="Revenue" 
          value={formatCurrency(data?.summary?.totalRevenue || 0)} 
          isLoading={loading && !error}
        />
        <Card 
          label="Shops" 
          value={data?.summary?.uniqueShops || 0} 
          isLoading={loading && !error}
        />
        <Card 
          label="Staff" 
          value={data?.summary?.uniqueStaffMembers || 0} 
          isLoading={loading && !error}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <p className="text-gray-600 text-sm">All orders placed today</p>
            </div>
            <div className="mt-2 md:mt-0 text-sm text-gray-500">
              {data?.orders?.length || 0} orders • Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>
        
        {data?.orders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop ID</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {data.orders.map((o,i)=>(
                  <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-4 font-medium text-gray-900">{o.orderId || `ORD-${Date.now() + i}`}</td>
                    <td className="p-4 text-gray-600">{formatDate(o.orderDate)}</td>
                    <td className="p-4 font-medium text-gray-700">{o.shopId || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{o.staffId || 'N/A'}</td>
                    <td className="p-4 font-bold text-green-600">{formatCurrency(o.totalAmount || 0)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (o.status || '').toLowerCase() === "delivered" || (o.status || '').toLowerCase() === "completed" 
                          ? 'bg-green-100 text-green-800' 
                          : (o.status || '').toLowerCase() === "pending"
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {o.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      {o.proofLink ? (
                        <a 
                          href={o.proofLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No proof</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600">No orders today</h3>
            <p className="text-gray-500 mt-1">
              {error 
                ? 'Unable to fetch orders. Please check your connection and try again.'
                : 'No orders have been placed yet today.'
              }
            </p>
            <div className="mt-6">
              <p className="text-gray-400 text-sm">
                Orders will appear here as soon as they are placed
              </p>
            </div>
          </div>
        )}
        
        {data?.orders?.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {data.orders.length} orders for today
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
  );
}

function Card({ label, value, isLoading = false }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center transition-all duration-200 hover:shadow-md">
      <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
      {isLoading ? (
        <div className="h-10 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded h-8 w-1/2"></div>
        </div>
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  );
}