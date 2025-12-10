import React, { useState, useEffect } from "react";

// Vendor data (static)
const vendors = [
  { id: "V001", name: "Coca Cola Beverages Ltd", category: "Soft Drinks / Juices" },
  { id: "V002", name: "PepsiCo Foods", category: "Snacks / Chips" },
  { id: "V003", name: "Nestlé Pakistan", category: "Dairy / Cereals / Baby Food" },
  { id: "V004", name: "National Foods Pvt Ltd", category: "Grocery / Spices / Cooking Items" },
  { id: "V005", name: "Unilever Pakistan", category: "Home & Personal Care" },
];

export default function AddProduct() {
  const [productId, setProductId] = useState(""); 
  const [productName, setProductName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [unit, setUnit] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingId, setLoadingId] = useState(true);
  const [idError, setIdError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function fetchWithTimeout(url, opts = {}, timeout = 8000) {
    return Promise.race([
      fetch(url, opts),
      new Promise((_, rej) => setTimeout(() => rej(new Error("Request timed out")), timeout)),
    ]);
  }

  const loadProductId = async () => {
    setLoadingId(true);
    setIdError(null);
    try {
      const res = await fetchWithTimeout("https://n8n.edutechpulse.online/webhook/Product-id");
      if (!res.ok) throw new Error("Failed To Fetch ID");
      const data = await res.json();
      if (data && data.newProductId) setProductId(data.newProductId);
    } catch (err) {
      setIdError(err.message);
    } finally {
      setLoadingId(false);
    }
  };

  useEffect(() => { loadProductId(); }, []);

  useEffect(() => {
    const vendor = vendors.find(v => v.name === vendorName);
    setVendorId(vendor ? vendor.id : "");
  }, [vendorName]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");

    if(!productId || !productName || !vendorName || !costPrice || !salePrice || !stockQty || !unit){
      alert("All fields required");
      return setSubmitting(false);
    }

    const productData = {
      Product_ID: productId,
      Name: productName,
      Vendor_ID: vendorId,
      Vendor_Name: vendorName,
      Cost_Price: Number(costPrice),
      Sale_Price: Number(salePrice),
      Current_Stock_Qty: Number(stockQty),
      Unit: unit
    };

    try {
      const res = await fetch("https://n8n.edutechpulse.online/webhook/Add-product",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(productData)
      });

      if(!res.ok) throw new Error("Error uploading product");

      setSuccess("✔ Product Added Successfully!");
      setProductName(""); setVendorName(""); setVendorId("");
      setCostPrice(""); setSalePrice(""); setStockQty(""); setUnit("");

      await loadProductId();

    } catch (err) {
      alert("Failed: " + err.message);
    }
    setSubmitting(false);
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">➕ Add Product</h1>
          <div className="text-sm">
            { loadingId ? "Getting ID..." :
              idError ? <span className="text-red-600">Error — Manual Mode</span> :
              <span className="text-green-600">Next: <b>{productId}</b></span>
            }
          </div>
        </div>

        {success && <p className="p-3 bg-green-200 rounded">{success}</p>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">

          <div>
            <label>Product ID</label>
            <input type="text" value={productId} onChange={e=>setProductId(e.target.value)}
              readOnly={!idError} className="w-full p-2 border rounded mt-1 bg-gray-100"/>
          </div>

          <Input label="Product Name" value={productName} set={setProductName}/>
          <SelectVendor vendors={vendors} vendorName={vendorName} setVendorName={setVendorName}/>
          <ReadOnly label="Vendor ID" value={vendorId}/>
          <Input label="Cost Price" value={costPrice} set={setCostPrice} type="number"/>
          <Input label="Sale Price" value={salePrice} set={setSalePrice} type="number"/>
          <Input label="Stock Qty" value={stockQty} set={setStockQty} type="number"/>
          <Input label="Unit" value={unit} set={setUnit} placeholder="Bottle / Pack / Kg"/>

          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
            {submitting ? "Saving..." : "Add Product"}
          </button>

        </form>
      </div>
    </main>
  );
}

function Input({label, value, set, type="text", placeholder=""}){
  return(<div><label>{label}</label>
    <input type={type} value={value} onChange={e=>set(e.target.value)}
    placeholder={placeholder} className="w-full mt-1 p-2 border rounded"/></div>);
}

function SelectVendor({vendors, vendorName, setVendorName}){
  return(<div><label>Vendor Name</label>
    <select value={vendorName} onChange={e=>setVendorName(e.target.value)}
    className="w-full mt-1 p-2 border rounded">
      <option value="">Select</option>
      {vendors.map(v=><option value={v.name} key={v.id}>{v.name}</option>)}
    </select></div>);
}

function ReadOnly({label,value}){
  return(<div><label>{label}</label>
    <input type="text" value={value} readOnly className="w-full p-2 border bg-gray-100 rounded mt-1"/></div>);
}
