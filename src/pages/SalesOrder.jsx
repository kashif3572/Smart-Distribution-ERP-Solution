import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Static product data
const products = [
  { id: "P001", name: "Coca-Cola 330ml", price: 102 },
  { id: "P002", name: "Lays Chips 50g", price: 36 },
  { id: "P003", name: "Mineral Water 500ml", price: 26.4 },
  { id: "P004", name: "Bread Loaf", price: 66 },
  { id: "P005", name: "Milk 1L", price: 168 },
  { id: "P006", name: "Chocolate Bar", price: 90 },
  { id: "P007", name: "Instant Noodles", price: 54 },
  { id: "P008", name: "Toothpaste", price: 144 },
  { id: "P009", name: "Shampoo 250ml", price: 216 },
  { id: "P010", name: "Soap Bar", price: 78 },
  { id: "P011", name: "Cooking Oil 1L", price: 336 },
  { id: "P012", name: "Sugar 1kg", price: 132 },
  { id: "P013", name: "Tea Bags 100pcs", price: 420 },
  { id: "P014", name: "Flour 5kg", price: 312 },
  { id: "P015", name: "Rice Basmati 5kg", price: 900 },
  { id: "P016", name: "Salt 800g", price: 36 },
  { id: "P017", name: "Detergent Powder 1kg", price: 216 },
  { id: "P018", name: "Dishwashing Liquid 500ml", price: 108 },
  { id: "P019", name: "Match Box", price: 12 },
  { id: "P020", name: "Biscuit Pack 100g", price: 24 },
  { id: "P021", name: "Hand Wash 250ml", price: 108 },
  { id: "P022", name: "Tissue Box", price: 144 },
  { id: "P023", name: "Battery AA (2pcs)", price: 72 },
  { id: "P024", name: "Black Pepper 100g", price: 96 },
  { id: "P025", name: "Red Chili Powder 250g", price: 144 },
  { id: "P026", name: "Corn Flakes 250g", price: 216 },
  { id: "P027", name: "Laundry Soap Bar", price: 42 },
  { id: "P028", name: "Shaving Foam", price: 240 },
  { id: "P029", name: "Toilet Cleaner 500ml", price: 132 },
  { id: "P030", name: "Fruit Juice 1L", price: 168 },
];

// Static shop data
const shops = [
  { id: "SHP-001", name: "City Supermarket", owner: "Waqas Ali", area: "Downtown" },
  { id: "SHP-002", name: "Corner Store", owner: "Ali Raza", area: "Market Road" },
  { id: "SHP-003", name: "Mega Mart", owner: "Sarah Khan", area: "Shopping Mall" },
  { id: "SHP-004", name: "Daily Needs", owner: "Ahmed Hassan", area: "Residential Area" },
  { id: "SHP-005", name: "Super Value", owner: "Fatima Noor", area: "Commercial Street" },
  { id: "SHP-006", name: "Quick Mart", owner: "Usman Tariq", area: "Main Bazaar" },
  { id: "SHP-007", name: "Family Store", owner: "Hassan Ahmed", area: "Gulberg" },
  { id: "SHP-008", name: "24/7 Mart", owner: "Rehan Siddiqui", area: "Cantt" },
  { id: "SHP-009", name: "Fresh Foods", owner: "Ayesha Malik", area: "Model Town" },
  { id: "SHP-010", name: "Super Save", owner: "Adnan Sharif", area: "Liberty" },
  { id: "SHP-011", name: "Value Plus", owner: "Maria Iqbal", area: "Johar Town" },
  { id: "SHP-012", name: "City Center", owner: "Hamza Ali", area: "Faisal Town" },
  { id: "SHP-013", name: "Mega Value", owner: "Sana Javed", area: "Wapda Town" },
  { id: "SHP-014", name: "Daily Mart", owner: "Salman Khan", area: "Garden Town" },
  { id: "SHP-015", name: "Super Market", owner: "John Doe", area: "Defence" },
];

export default function SalesOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orderItems, setOrderItems] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Redirect if user is not logged in or not a salesman
  useEffect(() => {
    if (!user || user.role !== 'sales') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Get current shop details
  const currentShop = shops.find(shop => shop.id === selectedShop) || {};

  // Filter products based on search
  useEffect(() => {
    if (searchProduct.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.id.toLowerCase().includes(searchProduct.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchProduct]);

  // Group products by first letter for browse section
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const firstLetter = product.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(product);
    return acc;
  }, {});

  // Add item to order
  const addItemToOrder = () => {
    if (!selectedProduct) {
      setMessage({ text: "Please select a product", type: "error" });
      return;
    }

    if (quantity < 1) {
      setMessage({ text: "Quantity must be at least 1", type: "error" });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].lineTotal = updatedItems[existingItemIndex].quantity * product.price;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        lineTotal: product.price * quantity
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Reset form
    setSelectedProduct("");
    setQuantity(1);
    setSearchProduct("");
    setMessage({ text: "Product added to order", type: "success" });
  };

  // Remove item from order
  const removeItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  // Calculate total amount
  const totalAmount = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

  // Handle order submission - UPDATED (No auto logout)
  const handleSubmitOrder = async () => {
    if (!selectedShop) {
      setMessage({ text: "Please select a shop", type: "error" });
      return;
    }

    if (orderItems.length === 0) {
      setMessage({ text: "Please add at least one product", type: "error" });
      return;
    }

    if (!user) {
      setMessage({ text: "User not authenticated", type: "error" });
      return;
    }

    const orderData = {
      Shop_ID: currentShop.id,
      Salesman_ID: user.id,
      Salesman_name: user.name,
      Shop_Owner_Name: currentShop.owner,
      Total_Amount: totalAmount,
      Items: orderItems.map(item => ({
        Product_ID: item.productId,
        Qty: item.quantity
      }))
    };

    setSubmitting(true);
    setMessage({ text: "Submitting order...", type: "info" });

    try {
      const response = await fetch("https://n8n.edutechpulse.online/webhook/order-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setMessage({ 
          text: "✅ Order submitted successfully! You can create another order or go back to dashboard.", 
          type: "success" 
        });
        
        // Reset form but stay on the page
        setTimeout(() => {
          setOrderItems([]);
          setSelectedShop("");
          setSelectedProduct("");
          setSearchProduct("");
          setQuantity(1);
        }, 2000);
        
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      setMessage({ 
        text: "❌ Failed to submit order. Please try again.", 
        type: "error" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/sales-dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loading while checking authentication
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors flex items-center gap-2"
                title="Go Back to Dashboard"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden md:inline text-sm font-medium">Dashboard</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 text-white p-2 rounded-lg font-bold">
                  SD
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Create New Order</h1>
                  <p className="text-gray-600 text-sm">Salesman: {user?.name} ({user?.id})</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Back
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b">Create New Order</h2>
              
              {/* Message Display */}
              {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${
                  message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
                  message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
                  'bg-blue-50 border border-blue-200 text-blue-700'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {message.type === 'success' ? '✅' :
                       message.type === 'error' ? '❌' : 'ℹ️'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{message.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Salesman Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Salesman Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Salesman ID</label>
                    <input
                      type="text"
                      value={user.id}
                      readOnly
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Salesman Name</label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Shop Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Shop Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Select Shop *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedShop ? currentShop.name : ""}
                        onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                        readOnly
                        placeholder="Click to select shop from dropdown"
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ▼
                      </div>
                      {isShopDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {shops.map(shop => (
                            <div
                              key={shop.id}
                              onClick={() => {
                                setSelectedShop(shop.id);
                                setIsShopDropdownOpen(false);
                              }}
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-800">{shop.name}</div>
                              <div className="text-sm text-gray-600">ID: {shop.id} • Owner: {shop.owner}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Shop ID (Auto-filled)</label>
                      <input
                        type="text"
                        value={selectedShop ? currentShop.id : ""}
                        readOnly
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Shop Owner (Auto-filled)</label>
                      <input
                        type="text"
                        value={selectedShop ? currentShop.owner : ""}
                        readOnly
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Add Products</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Search Products</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      placeholder="Type product name or ID..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                    {isProductDropdownOpen && filteredProducts.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setSearchProduct(product.name);
                              setIsProductDropdownOpen(false);
                            }}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-800">{product.name}</div>
                            <div className="text-sm text-gray-600">ID: {product.id} • Price: {formatCurrency(product.price)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Product Form */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Add New Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Product</label>
                      <div className="p-3 bg-white border border-gray-300 rounded text-gray-700 min-h-[44px]">
                        {selectedProduct ? (
                          products.find(p => p.id === selectedProduct)?.name || "Select product"
                        ) : "Select product"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addItemToOrder}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add to Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items List */}
            {orderItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Items ({orderItems.length})</h3>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="font-medium text-gray-800">{item.productName}</div>
                          <div className="text-sm text-gray-600">ID: {item.productId} • Price: {formatCurrency(item.price)} per unit</div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="font-medium text-gray-700">Quantity: {item.quantity}</div>
                            <div className="text-lg font-bold text-green-600">{formatCurrency(item.lineTotal)}</div>
                          </div>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                            title="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">Order Summary</h3>
              
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-600">No items added yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Add products to see order summary</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-700">{item.productName}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} × {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="font-medium text-gray-800">{formatCurrency(item.lineTotal)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-lg font-bold text-gray-800">Subtotal</div>
                      <div className="text-lg font-bold text-gray-800">{formatCurrency(totalAmount)}</div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 text-gray-600">
                      <div>Tax (0%)</div>
                      <div>{formatCurrency(0)}</div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 pt-4 border-t">
                      <div className="text-xl font-bold text-gray-800">Grand Total</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
                    </div>
                    
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting || orderItems.length === 0 || !selectedShop}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 shadow-md ${
                        submitting || orderItems.length === 0 || !selectedShop
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                      }`}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting Order...
                        </span>
                      ) : (
                        'Submit Order'
                      )}
                    </button>
                    
                    <button
                      onClick={handleBackToDashboard}
                      className="w-full mt-3 py-3 px-4 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      ← Go Back to Dashboard
                    </button>
                  </div>
                </>
              )}

              {/* Shop Summary */}
              {selectedShop && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-700 mb-2">Selected Shop</h4>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-800">{currentShop.name}</div>
                    <div className="text-sm text-gray-600">ID: {currentShop.id}</div>
                    <div className="text-sm text-gray-600">Owner: {currentShop.owner}</div>
                    <div className="text-sm text-gray-600">Area: {currentShop.area}</div>
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-700 mb-2">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span className="font-medium">
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Products:</span>
                    <span className="font-medium">
                      {new Set(orderItems.map(item => item.productId)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-800 font-semibold">Smart Distribution</p>
              <p className="text-gray-500 text-sm">Order Management System</p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                Salesman: <span className="font-semibold">{user?.name}</span> ({user?.id})
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {orderItems.length > 0 
                  ? `${orderItems.length} items in cart • ${formatCurrency(totalAmount)} total`
                  : 'Ready to create new order'
                }
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}