import React, { useEffect, useState } from 'react'

export default function Customers() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch("https://n8n.edutechpulse.online/webhook/Today-Customer", {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const json = await response.json()
      
      // Validate data structure
      if (!json || typeof json !== 'object') {
        throw new Error('Invalid data received from server')
      }
      
      setData(json)
      setError('')
    } catch (err) {
      console.error("Error fetching customer data:", err)
      
      // Handle different error types
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        setError('Request timeout: Server is taking too long to respond.')
      } else if (err.name === 'TypeError') {
        setError('Network error: Unable to connect to server.')
      } else {
        setError(`Failed to load customer data: ${err.message}`)
      }
      
      // Set empty data structure for fallback UI
      setData({
        summary: {
          totalShops: 0,
          recentlyVisited: 0,
          withOutstanding: 0,
          requiresFollowUp: 0
        },
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [retryCount])

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' && typeof amount !== 'string') return 'Rs 0'
    
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount
    
    if (isNaN(num)) return amount || 'Rs 0'
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Customer Data...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching latest customer information</p>
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
            <h1 className="text-3xl font-bold text-gray-800">🧾 Customer Dashboard</h1>
            <p className="text-gray-600 mt-2">Shop management and customer insights</p>
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Data loading incomplete</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}</p>
                  <p className="mt-1">Showing cached data or empty state</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setRetryCount(prev => prev + 1)}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline flex items-center gap-1"
                  >
                    Try loading again
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Box 
          label="Total Shops" 
          value={data?.summary?.totalShops || 0} 
          isLoading={loading && !error}
        />
        <Box 
          label="Visited Recently" 
          value={data?.summary?.recentlyVisited || 0} 
          isLoading={loading && !error}
        />
        <Box 
          label="Outstanding Accounts" 
          value={data?.summary?.withOutstanding || 0} 
          isLoading={loading && !error}
          warning={data?.summary?.withOutstanding > 0}
        />
        <Box 
          label="Follow-up Required" 
          value={data?.summary?.requiresFollowUp || 0} 
          isLoading={loading && !error}
          warning={data?.summary?.requiresFollowUp > 0}
        />
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Shop Activity</h2>
            <p className="text-gray-600 text-sm">Latest customer interactions and updates</p>
          </div>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            {data?.recentActivity?.length || 0} shops • Updated today
          </div>
        </div>
        
        {data?.recentActivity?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop ID</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Limit</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {data.recentActivity.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-4 font-medium text-gray-900">{c.shopId || 'N/A'}</td>
                    <td className="p-4 text-gray-700">{c.name || 'N/A'}</td>
                    <td className="p-4 text-gray-700">{c.owner || 'N/A'}</td>
                    <td className="p-4 text-gray-700">{c.contact || 'N/A'}</td>
                    <td className="p-4 text-gray-700">{c.area || 'N/A'}</td>
                    <td className="p-4 font-bold text-red-600">
                      {formatCurrency(c.financials?.balance || 0)}
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      {formatCurrency(c.financials?.available || 0)}
                    </td>
                    <td className="p-4 text-gray-700">{c.lastVisit || 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600">
              {error ? 'Unable to load customer data' : 'No recent shop activity'}
            </h3>
            <p className="text-gray-500 mt-1">
              {error 
                ? 'Please check your connection and try refreshing.'
                : 'Customer activity will appear here as shops are visited.'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}
        
        {data?.recentActivity?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {Math.min(10, data.recentActivity.length)} of {data.recentActivity.length} recent activities
              </div>
              <div className="mt-2 md:mt-0">
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2">
                  View All Customers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Box({ label, value, isLoading = false, warning = false }) {
  return (
    <div className={`bg-white rounded-xl shadow p-6 text-center transition-all duration-200 hover:shadow-md ${
      warning ? 'border-l-4 border-red-500' : ''
    }`}>
      <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
      {isLoading ? (
        <div className="h-10 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded h-8 w-1/2"></div>
        </div>
      ) : (
        <p className={`text-2xl font-bold ${warning ? 'text-red-600' : 'text-gray-800'}`}>
          {value}
        </p>
      )}
      {warning && !isLoading && (
        <p className="text-red-500 text-xs mt-2">Requires attention</p>
      )}
    </div>
  )
}