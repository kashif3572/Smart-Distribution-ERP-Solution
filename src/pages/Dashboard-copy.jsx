import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  // Ensure only Admin can access
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/no-access");
  }, []);

  // Fetch stats from webhook
  useEffect(() => {
    fetch("https://n8n.edutechpulse.online/webhook/dashboard")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err));
  }, []);

  if (!data) 
    return (
      <div className="flex items-center justify-center w-full text-2xl font-bold">
        Loading Dashboard...
      </div>
    );

  const { daily_summary, monthly_summary, summary_counts, top_performers, key_metrics } = data;

  const chartDaily = [
    { name: "Sale", value: daily_summary.total_sale },
    { name: "Profit", value: daily_summary.total_profits },
  ];

  const chartMonthly = [
    { name: "Sale", value: monthly_summary.monthly_sales },
    { name: "Profit", value: monthly_summary.monthly_profit },
  ];

  const quickStats = [
    { title: "Today Sale", value: `₨ ${daily_summary.total_sale.toLocaleString()}` },
    { title: "Today Profit", value: `₨ ${daily_summary.total_profits.toLocaleString()}` },
    { title: "Today's Orders", value: daily_summary.orders_count },
    { title: "Daily Profit Margin", value: (key_metrics.daily_profit_margin*100).toFixed(2) + "%" },
    { title: "Monthly Sales", value: `₨ ${monthly_summary.monthly_sales.toLocaleString()}` },
    { title: "Monthly Profit", value: `₨ ${monthly_summary.monthly_profit.toLocaleString()}` },
    { title: "Orders This Month", value: monthly_summary.total_orders },
    { title: "Monthly Profit Margin", value: (monthly_summary.monthly_profit_margin*100).toFixed(2)+"%" },
  ];

  return (
    <main className="flex-1 p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">📊 Dashboard</h1>
          <p className="text-gray-600">Live business insights & analytics</p>
        </div>

        {/* Quick buttons */}
        <div className="flex gap-3">
		 <button className="px-4 py-2 bg-green-600 text-white rounded hover:scale-105 transition"
            onClick={() => navigate("/add-order")}
          >Add Employee</button>
		  {/*
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:scale-105 transition"
            onClick={() => navigate("/add-vendor")}
          >Add vender</button>
		  */}
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:scale-105 transition"
            onClick={() => navigate("/add-product")}
          >Add Product Into Inventry </button>
        </div>
      </div>


      {/* TOP CARDS */}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
        {quickStats.map((item,i)=>(
          <div key={i} className="bg-white p-5 rounded-xl shadow hover:scale-105 transition-all">
            <p className="text-gray-500 text-sm">{item.title}</p>
            <h2 className="text-2xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <h2 className="text-2xl font-bold mt-10">📈 Analytics Overview</h2>
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-4">📅 Daily Sale vs Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartDaily}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="value" fill="#34D399"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-4">📅 Monthly Sale vs Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartMonthly}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP PERFORMERS */}
      <h2 className="text-2xl font-bold mt-12">🔥 Top Performers</h2>
      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <PerformerCard title="Top Area by Sales" data={top_performers.top_area_sales} fields={["area","sales","profit","orders"]}/>
        <PerformerCard title="Top Vendor (Profit)" data={top_performers.top_vendor_profit} fields={["vendor_id","sales","profit","profit_margin"]}/>
        <PerformerCard title="Top Staff by Sales" data={top_performers.top_staff_sales} fields={["staff_name","total_sales","total_profit","order_count"]}/>
        <PerformerCard title="Top Staff by Profit" data={top_performers.top_staff_profit} fields={["staff_name","total_profit","total_sales","avg_profit_per_order"]}/>
      </div>
    </main>
  );
}

/* Reusable component */
function PerformerCard({ title, data, fields }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold mb-3">{title}</h3>
      {fields.map((f,i)=>(
        <div key={i} className="flex justify-between border-b py-2">
          <span className="text-gray-500 capitalize">{f.replace("_"," ")}</span>
          <span className="font-semibold">
            {typeof data[f] === "number" ? data[f].toLocaleString() : data[f]}
          </span>
        </div>
      ))}
    </div>
  );
}
