import React, { useEffect, useState } from 'react'

export default function Purchases() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch("https://n8n.edutechpulse.online/webhook/Purchase-data", {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const json = await response.json()
      
      if (!json || typeof json !== 'object') {
        throw new Error('Invalid data received from server')
      }
      
      setData(json)
      setError('')
    } catch (err) {
      console.error("Error fetching purchase data:", err)
      
      // Check if it's a network error or server error
      if (err.name === 'TimeoutError' || err.name === 'TypeError') {
        setError('Network error: Unable to connect to server. Please check your internet connection.')
      } else if (err.message.includes('Invalid data')) {
        setError('Server returned invalid data format. Please try again later.')
      } else {
        setError(`Failed to load purchase data: ${err.message}`)
      }
      
      // Set empty data structure for fallback UI
      setData({
        summary: {
          totalPurchases: 0,
          recentPurchases: 0,
          totalInventoryValue: 0,
          totalUnitsPurchased: 0,
          averageUnitCost: 0
        },
        productAnalysis: [],
        vendorPerformance: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [retryCount])

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'Rs 0'
    
    // For amounts less than 1 crore, show with 2 decimal places
    if (amount < 10000000) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
    
    // For larger amounts, show without decimal places
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num, decimals = 0) => {
    if (typeof num !== 'number') return '0'
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  const formatAverageCost = (cost) => {
    if (typeof cost !== 'number') return 'Rs 0.00'
    return `Rs ${cost.toFixed(2)}`
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Purchase Data...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching latest inventory information</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 Purchases Dashboard</h1>
            <p className="text-gray-600 mt-2">Inventory management and purchase analysis</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Unable to load data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setRetryCount(prev => prev + 1)}
                    className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    Try again →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Box 
          label="Total Purchases" 
          value={data?.summary?.totalPurchases || 0} 
          isLoading={loading && !error}
        />
        <Box 
          label="Recent Purchases" 
          value={data?.summary?.recentPurchases || 0} 
          isLoading={loading && !error}
        />
        <Box 
          label="Inventory Value" 
          value={formatCurrency(data?.summary?.totalInventoryValue || 0)} 
          isLoading={loading && !error}
        />
        <Box 
          label="Units Purchased" 
          value={formatNumber(data?.summary?.totalUnitsPurchased || 0)} 
          isLoading={loading && !error}
        />
        <Box 
          label="Avg Cost" 
          value={formatAverageCost(data?.summary?.averageUnitCost || 0)} 
          isLoading={loading && !error}
        />
      </div>

      {/* Product Analysis Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Product Analysis</h2>
            <p className="text-gray-600 text-sm">Inventory and purchase insights by product</p>
          </div>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            {data?.productAnalysis?.length || 0} products analyzed
          </div>
        </div>
        
        {data?.productAnalysis?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Avg</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Last</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Vendors</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Days</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {data.productAnalysis.map((p,i)=>(
                  <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-3 font-medium text-gray-900">{p.productId || 'N/A'}</td>
                    <td className="p-3 text-gray-700">{formatNumber(p.totalQuantity || 0)}</td>
                    <td className="p-3 font-semibold text-green-700">{formatCurrency(p.totalCost || 0)}</td>
                    <td className="p-3 text-gray-700">{formatCurrency(p.averageUnitCost || 0)}</td>
                    <td className="p-3 text-gray-700">{p.lastPurchaseDate || 'N/A'}</td>
                    <td className="p-3 text-gray-700">{p.vendorCount || 0}</td>
                    <td className="p-3 text-gray-700">{p.daysSinceLastPurchase || 0}</td>
                    <td className={`p-3 font-bold ${(p.reorderPriority || '').toLowerCase() === "high"?"text-red-600":"text-green-600"}`}>
                      {p.reorderPriority || 'Low'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600">No product data available</h3>
            <p className="text-gray-500 mt-1">
              {error ? 'Unable to fetch product analysis data' : 'No purchase records found'}
            </p>
          </div>
        )}
      </div>

      {/* Vendor Performance Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Vendor Performance</h2>
            <p className="text-gray-600 text-sm">Purchase analysis by vendor</p>
          </div>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            {data?.vendorPerformance?.length || 0} vendors
          </div>
        </div>
        
        {data?.vendorPerformance?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Products</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {data.vendorPerformance.map((v,i)=>(
                  <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-3 font-medium text-gray-900">{v.vendor || 'N/A'}</td>
                    <td className="p-3 font-bold text-green-700">{formatCurrency(v.totalSpent || 0)}</td>
                    <td className="p-3 text-gray-700">{v.productCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600">No vendor data available</h3>
            <p className="text-gray-500 mt-1">
              {error ? 'Unable to fetch vendor performance data' : 'No vendor records found'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

function Box({ label, value, isLoading = false }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center transition-all duration-200 hover:shadow-md">
      <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
      {isLoading ? (
        <div className="h-8 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded h-6 w-3/4"></div>
        </div>
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  )
}