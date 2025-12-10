
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Sidebar(){
  const { user, logout } = useAuth()
  const loc = useLocation()
  const menu = {
    admin: [
      { to: '/', label: 'Dashboard' },
      { to: '/orders', label: 'Orders' },
      { to: '/customers', label: 'Customers' },
      { to: '/purchases', label: 'Purchases' },
      { to: '/delivery', label: 'Delivery' },
    ],
    sales: [
      { to: '/', label: 'Dashboard' },
      { to: '/orders', label: 'Orders' },
      { to: '/customers', label: 'Customers' },
    ],
    rider: [
      { to: '/', label: 'Dashboard' },
      { to: '/delivery', label: 'Delivery' },
    ]
  }

  const items = menu[user?.role] || []

  return (
    <aside className="w-64 bg-blue-700 text-white p-4 h-screen sticky top-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold">SMART ERP</h2>
        <div className="text-sm mt-1">Welcome, {user?.name}</div>
      </div>
      <nav className="space-y-2">
        {items.map(item => (
          <Link key={item.to} to={item.to} className={'block px-3 py-2 rounded ' + (loc.pathname === item.to ? 'bg-blue-500' : 'hover:bg-blue-600')}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">
        <button onClick={logout} className="w-full bg-red-600 px-3 py-2 rounded">Logout</button>
      </div>
    </aside>
  )
}
