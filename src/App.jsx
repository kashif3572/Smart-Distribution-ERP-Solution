import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Purchases from './pages/Purchases'
import Delivery from './pages/Delivery'
import SalesDashboard from './pages/sales-dashboard'
import RiderDashboard from './pages/rider-dashboard'
import OrderPage from "./pages/Orders";
import AddProduct from './pages/AddProduct'
import SalesOrder from './pages/SalesOrder'  // <-- Add this import

import { AuthProvider, useAuth } from './auth/AuthContext'
import AdminLayout from "./layouts/AdminLayout";   // <--- correct import

function Protected({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to='/login' replace />

  const role = localStorage.getItem("role")
  if (allowedRoles && !allowedRoles.includes(role))
    return <div className="p-8 text-red-600 font-bold text-xl">🚫 Access Denied</div>

  return children
}

export default function App(){
  return (
    <AuthProvider>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* ================== ADMIN AREA WRAPPED IN LAYOUT ================== */}
        <Route path="/" element={
          <Protected allowedRoles={["admin"]}>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </Protected>
        } />

        <Route path="/orders" element={
          <Protected allowedRoles={["admin","sales"]}>
            <AdminLayout>
              <OrderPage />
            </AdminLayout>
          </Protected>
        } />

        <Route path="/customers" element={
          <Protected allowedRoles={['admin','sales']}>
            <AdminLayout>
              <Customers />
            </AdminLayout>
          </Protected>
        } />

        <Route path="/purchases" element={
          <Protected allowedRoles={['admin']}>
            <AdminLayout>
              <Purchases />
            </AdminLayout>
          </Protected>
        } />

        <Route path="/delivery" element={
          <Protected allowedRoles={['admin','rider']}>
            <AdminLayout>
              <Delivery />
            </AdminLayout>
          </Protected>
        } />

        <Route path="/add-product" element={
          <Protected allowedRoles={["admin"]}>
            <AdminLayout>
              <AddProduct />
            </AdminLayout>
          </Protected>
        } />

        {/* ================== SALES ORDER PAGE ================== */}
        <Route path="/sales-order" element={
          <Protected allowedRoles={["sales"]}>
            <SalesOrder />
          </Protected>
        } />

        {/* ================== NON-ADMIN USER ROUTES ================== */}
        <Route path="/sales-dashboard" element={
          <Protected allowedRoles={["sales"]}>
            <SalesDashboard />
          </Protected>
        } />

        <Route path="/rider-dashboard" element={
          <Protected allowedRoles={["rider"]}>
            <RiderDashboard />
          </Protected>
        } />

        {/* DEFAULT REDIRECT */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
