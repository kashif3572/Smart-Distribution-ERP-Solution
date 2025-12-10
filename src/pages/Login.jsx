
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaBuilding, 
  FaTruck, 
  FaShoppingCart,
  FaChartLine
} from 'react-icons/fa'

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = auth.login({ id, password })
      
      if (!res.ok) {
        throw new Error(res.message || 'Invalid credentials')
      }

      // Get the user object from the auth response
      const user = res.user
      
      // Store user data in localStorage
      localStorage.setItem("userId", user.id)
      localStorage.setItem("role", user.role)
      localStorage.setItem("userName", user.name)

      // 🚀 Redirect based on role with smooth transition
      setTimeout(() => {
        if (user.role === "admin") {
          nav("/")
        } else if (user.role === "sales") {
          nav("/sales-dashboard")
        } else if (user.role === "rider") {
          nav("/rider-dashboard")
        } else {
          nav("/")
        }
      }, 300)

    } catch (err) {
      setError(err.message)
      // Add shake animation effect
      const form = e.target
      form.classList.add('shake')
      setTimeout(() => form.classList.remove('shake'), 500)
    } finally {
      setIsLoading(false)
    }
  }

  // Demo account selection
  const demoAccounts = [
    { id: 'admin', password: '1234', role: 'admin', icon: <FaChartLine />, name: 'Admin User', color: 'from-purple-600 to-pink-600' },
    { id: 'BK-101', password: 'John101', role: 'sales', icon: <FaShoppingCart />, name: 'John Doe', color: 'from-blue-600 to-cyan-500' },
    { id: 'BK-102', password: 'Sarah102', role: 'sales', icon: <FaShoppingCart />, name: 'Sarah Khan', color: 'from-emerald-600 to-teal-500' },
    { id: 'rider1', password: '1234', role: 'rider', icon: <FaTruck />, name: 'Delivery Rider', color: 'from-orange-600 to-red-500' },
  ]

  const handleDemoAccount = (account) => {
    setId(account.id)
    setPassword(account.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
        {/* Left Side - Branding & Info */}
        <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-blue-900/90 to-purple-900/90 text-white">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/20 p-3 rounded-xl">
                <FaBuilding className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Smart Distribution</h1>
                <p className="text-blue-200 text-sm">Enterprise Resource Planning</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Welcome Back</h2>
            <p className="text-blue-100 mb-6">
              Streamline your distribution operations with our comprehensive ERP solution. 
              Manage orders, track deliveries, and optimize your supply chain from one platform.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <FaChartLine className="text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Real-time Analytics</h4>
                  <p className="text-sm text-blue-200">Monitor performance with live dashboards</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <FaShoppingCart className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Order Management</h4>
                  <p className="text-sm text-blue-200">Streamline sales and order processing</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <FaTruck className="text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Delivery Tracking</h4>
                  <p className="text-sm text-blue-200">Monitor deliveries in real-time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-blue-200">
              Need help? Contact support at 
              <span className="font-semibold ml-1">support@smartdistribution.com</span>
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-3/5 p-8 lg:p-12 bg-white">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In to Your Account</h2>
              <p className="text-gray-600">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {/* User ID Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FaUser className="mr-2 text-gray-400" />
                  User ID
                </label>
                <div className="relative">
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="Enter your ID (e.g., BK-101)"
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                  />
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FaLock className="mr-2 text-gray-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    required
                  />
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-pulse">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Quick Demo Accounts */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Quick Demo Access</h3>
                <div className="grid grid-cols-2 gap-3">
                  {demoAccounts.map((account, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDemoAccount(account)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${account.color.replace('from-', 'bg-gradient-to-r ')} text-white`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {account.icon}
                        <span className="text-xs font-semibold uppercase">{account.role}</span>
                      </div>
                      <div className="text-sm font-medium truncate">{account.name}</div>
                      <div className="text-xs opacity-80 truncate">ID: {account.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Instructions */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  For sales team: Use your BK-xxx ID with corresponding password
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Example: BK-101 / John101 • BK-102 / Sarah102 • etc.
                </p>
              </div>
            </form>

            {/* System Status */}
            <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">System Status: Operational</span>
                </div>
                <span className="text-xs text-gray-500">Last updated: Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {transform: translateX(0);}
          10%, 30%, 50%, 70%, 90% {transform: translateX(-5px);}
          20%, 40%, 60%, 80% {transform: translateX(5px);}
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}