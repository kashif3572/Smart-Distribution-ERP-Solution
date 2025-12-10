import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ensure only Admin can access
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/no-access");
  }, [navigate]);

  // Fetch stats from webhook
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("https://n8n.edutechpulse.online/webhook/dashboard", {
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
        
        setData(json);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        
        // Set default empty data structure
        setData({
          daily_summary: {
            total_sale: 0,
            total_profits: 0,
            orders_count: 0
          },
          monthly_summary: {
            monthly_sales: 0,
            monthly_profit: 0,
            total_orders: 0,
            monthly_profit_margin: 0
          },
          summary_counts: {
            total_customers: 0,
            total_orders: 0,
            total_products: 0
          },
          top_performers: {
            top_area_sales: { area: "No data", sales: 0, profit: 0, orders: 0 },
            top_vendor_profit: { vendor_id: "No data", sales: 0, profit: 0, profit_margin: 0 },
            top_staff_sales: { staff_name: "No data", total_sales: 0, total_profit: 0, order_count: 0 },
            top_staff_profit: { staff_name: "No data", total_profit: 0, total_sales: 0, avg_profit_per_order: 0 }
          },
          key_metrics: {
            daily_profit_margin: 0,
            monthly_growth: 0,
            average_order_value: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Default values for when data is null
  const defaultData = {
    daily_summary: {
      total_sale: 0,
      total_profits: 0,
      orders_count: 0
    },
    monthly_summary: {
      monthly_sales: 0,
      monthly_profit: 0,
      total_orders: 0,
      monthly_profit_margin: 0
    },
    summary_counts: {
      total_customers: 0,
      total_orders: 0,
      total_products: 0
    },
    top_performers: {
      top_area_sales: { area: "No data", sales: 0, profit: 0, orders: 0 },
      top_vendor_profit: { vendor_id: "No data", sales: 0, profit: 0, profit_margin: 0 },
      top_staff_sales: { staff_name: "No data", total_sales: 0, total_profit: 0, order_count: 0 },
      top_staff_profit: { staff_name: "No data", total_profit: 0, total_sales: 0, avg_profit_per_order: 0 }
    },
    key_metrics: {
      daily_profit_margin: 0,
      monthly_growth: 0,
      average_order_value: 0
    }
  };

  const displayData = data || defaultData;
  const { daily_summary, monthly_summary, summary_counts, top_performers, key_metrics } = displayData;

  const chartDaily = [
    { name: "Sale", value: daily_summary.total_sale || 0 },
    { name: "Profit", value: daily_summary.total_profits || 0 },
  ];

  const chartMonthly = [
    { name: "Sale", value: monthly_summary.monthly_sales || 0 },
    { name: "Profit", value: monthly_summary.monthly_profit || 0 },
  ];

  // Pie chart data for orders distribution
  const orderDistribution = [
    { name: "Today", value: daily_summary.orders_count || 0 },
    { name: "Month", value: monthly_summary.total_orders || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  const quickStats = [
    { 
      title: "Today Sale", 
      value: `₨ ${(daily_summary.total_sale || 0).toLocaleString()}`,
      icon: "💰",
      description: daily_summary.total_sale > 0 ? "Sales today" : "No sales today"
    },
    { 
      title: "Today Profit", 
      value: `₨ ${(daily_summary.total_profits || 0).toLocaleString()}`,
      icon: "📈",
      description: daily_summary.total_profits > 0 ? "Profit today" : "No profit today"
    },
    { 
      title: "Today's Orders", 
      value: daily_summary.orders_count || 0,
      icon: "📦",
      description: daily_summary.orders_count > 0 ? "Orders placed" : "No orders today"
    },
    { 
      title: "Daily Profit Margin", 
      value: ((key_metrics.daily_profit_margin || 0) * 100).toFixed(2) + "%",
      icon: "📊",
      description: "Profit percentage"
    },
    { 
      title: "Monthly Sales", 
      value: `₨ ${(monthly_summary.monthly_sales || 0).toLocaleString()}`,
      icon: "📅",
      description: "This month"
    },
    { 
      title: "Monthly Profit", 
      value: `₨ ${(monthly_summary.monthly_profit || 0).toLocaleString()}`,
      icon: "💹",
      description: "This month"
    },
    { 
      title: "Orders This Month", 
      value: monthly_summary.total_orders || 0,
      icon: "🛒",
      description: "Monthly orders"
    },
    { 
      title: "Monthly Profit Margin", 
      value: ((monthly_summary.monthly_profit_margin || 0) * 100).toFixed(2) + "%",
      icon: "🎯",
      description: "Monthly profit %"
    },
  ];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-700">Loading Dashboard...</h2>
        <p className="text-gray-500 mt-2">Fetching business insights</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">📊 Dashboard</h1>
          <p className="text-gray-600 mt-1">Live business insights & analytics</p>
          {error && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
              ⚠️ Using cached data: {error}
            </div>
          )}
        </div>

        {/* Quick buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
            onClick={() => navigate("/add-order")}
          >
            <span>👨‍💼</span>
            Add Employee
          </button>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm flex items-center gap-2"
            onClick={() => navigate("/add-product")}
          >
            <span>📦</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Business Overview</h2>
            <p className="text-gray-600 text-sm">
              {daily_summary.orders_count > 0 
                ? `${daily_summary.orders_count} orders today • ₨${(daily_summary.total_sale || 0).toLocaleString()} sales`
                : "No orders placed today"}
            </p>
          </div>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>

      {/* Error/No Data Message */}
      {daily_summary.orders_count === 0 && monthly_summary.total_orders === 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📭</div>
            <div>
              <h3 className="font-bold text-gray-800">No Orders Data Available</h3>
              <p className="text-gray-600 text-sm">
                No orders have been placed today or this month. Start by creating sales orders to see analytics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${item.title.includes('Today') && parseInt(item.value) === 0 ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                {item.title.includes('Today') ? 'Today' : 'Month'}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">{item.title}</p>
            <h2 className="text-2xl font-bold mt-2 text-gray-800">{item.value}</h2>
            <p className="text-gray-400 text-xs mt-2">{item.description}</p>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">📈 Analytics Overview</h2>
          <div className="text-sm text-gray-500">
            {daily_summary.total_sale > 0 || monthly_summary.monthly_sales > 0 
              ? "Showing available data" 
              : "Waiting for sales data"}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Sales Chart */}
          <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">📅 Daily Sale vs Profit</h3>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </div>
            </div>
            {daily_summary.total_sale > 0 || daily_summary.total_profits > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" stroke="#666"/>
                  <YAxis stroke="#666"/>
                  <Tooltip 
                    formatter={(value) => [`₨ ${value.toLocaleString()}`, 'Amount']}
                    labelStyle={{ color: '#333' }}
                  />
                  <Bar dataKey="value" fill="#34D399" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-lg font-medium">No sales data for today</p>
                <p className="text-sm mt-1">Sales will appear here when orders are placed</p>
              </div>
            )}
          </div>

          {/* Order Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-4">📊 Order Distribution</h3>
            {orderDistribution.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={orderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-lg font-medium">No orders placed</p>
                <p className="text-sm mt-1">Orders will appear here</p>
              </div>
            )}
            <div className="mt-4 flex justify-center space-x-4">
              {orderDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">📅 Monthly Sale vs Profit</h3>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          {monthly_summary.monthly_sales > 0 || monthly_summary.monthly_profit > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" stroke="#666"/>
                <YAxis stroke="#666"/>
                <Tooltip 
                  formatter={(value) => [`₨ ${value.toLocaleString()}`, 'Amount']}
                  labelStyle={{ color: '#333' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-lg font-medium">No monthly data available</p>
              <p className="text-sm mt-1">Monthly analytics will appear here</p>
            </div>
          )}
        </div>

        {/* Business Summary */}
<div className="bg-white rounded-xl shadow p-4">
  <h3 className="font-semibold text-gray-700 mb-4">📋 Business Summary</h3>
  <div className="space-y-4">
    {/* Today's Orders */}
    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <span className="text-blue-600">📅</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Today's Orders</p>
          <p className="text-2xl font-bold text-gray-800">{daily_summary.orders_count || 0}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Value</p>
        <p className="text-lg font-bold text-green-600">₨ {(daily_summary.total_sale || 0).toLocaleString()}</p>
      </div>
    </div>
    
    {/* Monthly Orders */}
    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
          <span className="text-green-600">📈</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Monthly Orders</p>
          <p className="text-2xl font-bold text-gray-800">{monthly_summary.total_orders || 0}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Value</p>
        <p className="text-lg font-bold text-green-600">₨ {(monthly_summary.monthly_sales || 0).toLocaleString()}</p>
      </div>
    </div>
    
    {/* Average Order Value - Calculated */}
    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <span className="text-purple-600">💰</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-800">
            ₨ {monthly_summary.total_orders > 0 
              ? Math.round(monthly_summary.monthly_sales / monthly_summary.total_orders).toLocaleString()
              : '0'}
          </p>
        </div>
      </div>
    </div>
    
    {/* Profit Margin */}
    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
          <span className="text-yellow-600">📊</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Monthly Profit Margin</p>
          <p className="text-2xl font-bold text-gray-800">
            {((monthly_summary.monthly_profit_margin || 0) * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>

      {/* TOP PERFORMERS */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🔥 Top Performers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformerCard 
          title="Top Area by Sales" 
          data={top_performers.top_area_sales} 
          fields={["area","sales","profit","orders"]}
          isEmpty={top_performers.top_area_sales.area === "No data"}
        />
        <PerformerCard 
          title="Top Vendor (Profit)" 
          data={top_performers.top_vendor_profit} 
          fields={["vendor_id","sales","profit","profit_margin"]}
          isEmpty={top_performers.top_vendor_profit.vendor_id === "No data"}
        />
        <PerformerCard 
          title="Top Staff by Sales" 
          data={top_performers.top_staff_sales} 
          fields={["staff_name","total_sales","total_profit","order_count"]}
          isEmpty={top_performers.top_staff_sales.staff_name === "No data"}
        />
        <PerformerCard 
          title="Top Staff by Profit" 
          data={top_performers.top_staff_profit} 
          fields={["staff_name","total_profit","total_sales","avg_profit_per_order"]}
          isEmpty={top_performers.top_staff_profit.staff_name === "No data"}
        />
      </div>
    </main>
  );
}

/* Reusable component */
function PerformerCard({ title, data, fields, isEmpty }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">{title}</h3>
        {isEmpty && (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">No data</span>
        )}
      </div>
      {isEmpty ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-3xl mb-2">📭</div>
          <p>No performance data available</p>
          <p className="text-sm mt-1">Data will appear when sales are made</p>
        </div>
      ) : (
        fields.map((f, i) => (
          <div key={i} className="flex justify-between items-center border-b py-3 last:border-b-0">
            <span className="text-gray-600 capitalize">{f.replace("_", " ")}</span>
            <span className="font-semibold text-gray-800">
              {typeof data[f] === "number" 
                ? f.includes("profit") || f.includes("sales") 
                  ? `₨ ${data[f].toLocaleString()}` 
                  : f.includes("margin")
                    ? `${(data[f] * 100).toFixed(2)}%`
                    : data[f].toLocaleString()
                : data[f] || "N/A"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}