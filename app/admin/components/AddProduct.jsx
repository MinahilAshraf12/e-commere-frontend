import React, { useCallback, useState } from 'react'
import { Package, DollarSign, ImageIcon, Upload, Star, X, Globe, Settings, Save,
  AlertCircle, Check, Loader, FileSpreadsheet, Download, FileUp } from 'lucide-react';


 // Add Product Page Component
  const AddProductPage = () => { 
    const categories = ['Dresses', 'Tops', 'Bottoms', 'Accessories', 'Shoes', 'Outerwear', 'Activewear', 'Swimwear'];
  
  // Enhanced Add Product States
  const [uploadProgress, setUploadProgress] = useState({});
  const [saving, setSaving] = useState(false);  
  const [activeTab, setActiveTab] = useState('dashboard'); 
  
  // Bulk Upload States
  const [bulkUploadMode, setBulkUploadMode] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadResults, setBulkUploadResults] = useState(null);
    
  // Enhanced Product Data Structure
  const [newProduct, setNewProduct] = useState({
    // Basic Information
    name: '',
    category: 'Dresses',
    new_price: '',
    old_price: '',
    brand: '',
    sku: '',
    description: '',
    short_description: '',
    available: true,
    featured: false,
    
    // Product Images
    images: [],
    image: '', // Main image for backward compatibility
    
    // Features & Details
    features: [''],
    specifications: [{ key: '', value: '' }],
    materials: '',
    care_instructions: '',
    size_chart: '',
    colors: [''],
    sizes: [''],
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    
    // Inventory
    stock_quantity: '',
    low_stock_threshold: '',
    
    // SEO & Meta Data
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    slug: '',
    
    // Pricing & Promotions
    discount_type: 'percentage', // percentage or fixed
    discount_value: '',
    sale_start_date: '',
    sale_end_date: '',
    
    // Additional
    tags: [''],
    related_products: [],
    shipping_class: 'standard',
    status: 'draft' // draft, published, archived
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // Bulk Upload Handler
  const handleBulkFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setBulkFile(file);
      setBulkUploadResults(null);
    } else {
      alert('Please upload a CSV or Excel file');
    }
  }, []);

  // Download Template
  const downloadTemplate = useCallback(() => {
    const template = `name,category,new_price,old_price,brand,sku,description,short_description,stock_quantity,available,featured
"Example Dress","Dresses","99.99","149.99","Brand Name","SKU-001","Full description","Short description","100","true","false"
"Another Product","Tops","49.99","79.99","Brand","SKU-002","Description here","Short desc","50","true","true"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, []);

  // Bulk Upload Submit
  const handleBulkUpload = useCallback(async () => {
    if (!bulkFile) {
      alert('Please select a file first');
      return;
    }

    setBulkUploading(true);
    setBulkUploadResults(null);

    try {
      const formData = new FormData();
      formData.append('file', bulkFile);

      const response = await fetch(`${API_BASE}/products/bulk-upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setBulkUploadResults({
          success: true,
          message: data.message,
          added: data.added || 0,
          failed: data.failed || 0,
          errors: data.errors || []
        });
        setBulkFile(null);
      } else {
        setBulkUploadResults({
          success: false,
          message: data.message || 'Upload failed',
          errors: data.errors || []
        });
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      setBulkUploadResults({
        success: false,
        message: 'Error uploading file. Please check your file format.',
        errors: [error.message]
      });
    } finally {
      setBulkUploading(false);
    }
  }, [bulkFile, API_BASE]);

  // Enhanced Image Upload with Progress
  const handleImageUpload = useCallback(async (files) => {
    const uploadedImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('product', file);
      
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData
        });
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        const data = await response.json();
        if (data.image_url) {
          uploadedImages.push(data.image_url);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    }
    
    return uploadedImages;
  }, [API_BASE]);

  // Generate slug from product name
  const generateSlug = useCallback((name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Auto-generate meta title if empty
  const generateMetaTitle = useCallback((name, category) => {
    return `${name} - ${category} | Your Store`;
  }, []);

  // Helper function to update newProduct
  const updateProductField = useCallback((field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Helper function to update nested fields
  const updateNestedField = useCallback((parentField, childField, value) => {
    setNewProduct(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  }, []);

  // Helper function to add array items
  const addArrayItem = useCallback((field, defaultValue = '') => {
    setNewProduct(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  }, []);

  // Helper function to remove array items
  const removeArrayItem = useCallback((field, index) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  // Helper function to update array items
  const updateArrayItem = useCallback((field, index, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  }, []);

  // Enhanced Add Product Handler
  const handleAddProduct = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Auto-generate fields if empty
      const productData = {
        ...newProduct,
        slug: newProduct.slug || generateSlug(newProduct.name),
        meta_title: newProduct.meta_title || generateMetaTitle(newProduct.name, newProduct.category),
        image: newProduct.images.length > 0 ? newProduct.images[0] : newProduct.image
      };

      const response = await fetch(`${API_BASE}/addproduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setNewProduct({
          name: '',
          category: 'Dresses',
          new_price: '',
          old_price: '',
          brand: '',
          sku: '',
          description: '',
          short_description: '',
          available: true,
          featured: false,
          images: [],
          image: '',
          features: [''],
          specifications: [{ key: '', value: '' }],
          materials: '',
          care_instructions: '',
          size_chart: '',
          colors: [''],
          sizes: [''],
          weight: '',
          dimensions: { length: '', width: '', height: '' },
          stock_quantity: '',
          low_stock_threshold: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          slug: '',
          discount_type: 'percentage',
          discount_value: '',
          sale_start_date: '',
          sale_end_date: '',
          tags: [''],
          related_products: [],
          shipping_class: 'standard',
          status: 'draft'
        });
        setUploadProgress({});
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [newProduct, generateSlug, generateMetaTitle, API_BASE]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/20 to-rose-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Mode Toggle */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-pink-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
                Add Products
              </h1>
              <p className="text-gray-600">Create new products or upload in bulk</p>
            </div>
            
            {/* Mode Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBulkUploadMode(false);
                  setBulkUploadResults(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md ${
                  !bulkUploadMode
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-pink-50 border border-pink-200'
                }`}
              >
                <Package className="w-4 h-4" />
                Single Product
              </button>
              <button
                onClick={() => {
                  setBulkUploadMode(true);
                  setBulkUploadResults(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md ${
                  bulkUploadMode
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-pink-50 border border-pink-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Bulk Upload
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Upload Mode */}
        {bulkUploadMode ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-pink-100">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full mb-4">
                  <FileUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                  Bulk Product Upload
                </h2>
                <p className="text-gray-600">Upload multiple products at once using CSV or Excel file</p>
              </div>

              {/* Download Template Button */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 mb-6 border border-pink-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Download className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">First time uploading?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Download our CSV template to ensure your file has the correct format
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-8 text-center mb-6 bg-white">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleBulkFileSelect}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-pink-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {bulkFile ? bulkFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">CSV or Excel files only</p>
                  </div>
                </label>
              </div>

              {/* Upload Button */}
              {bulkFile && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleBulkUpload}
                    disabled={bulkUploading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {bulkUploading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Upload Products</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Upload Results */}
              {bulkUploadResults && (
                <div className={`rounded-xl p-6 ${
                  bulkUploadResults.success
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {bulkUploadResults.success ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 ${
                        bulkUploadResults.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {bulkUploadResults.message}
                      </h3>
                      {bulkUploadResults.success && (
                        <div className="text-sm text-green-700">
                          <p>✓ Successfully added: {bulkUploadResults.added} products</p>
                          {bulkUploadResults.failed > 0 && (
                            <p>✗ Failed: {bulkUploadResults.failed} products</p>
                          )}
                        </div>
                      )}
                      {bulkUploadResults.errors && bulkUploadResults.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {bulkUploadResults.errors.slice(0, 5).map((error, idx) => (
                              <li key={idx}>• {error}</li>
                            ))}
                            {bulkUploadResults.errors.length > 5 && (
                              <li>... and {bulkUploadResults.errors.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-3">📋 File Format Requirements:</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• File must be in CSV or Excel format (.csv, .xlsx, .xls)</li>
                  <li>• First row should contain column headers</li>
                  <li>• Required columns: name, category, new_price</li>
                  <li>• Optional columns: old_price, brand, sku, description, stock_quantity, etc.</li>
                  <li>• Use "true" or "false" for boolean fields (available, featured)</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Single Product Form - Keeping existing form with pink theme */
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-pink-600" />
                    Basic Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProduct.name}
                        onChange={(e) => updateProductField('name', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => updateProductField('category', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={newProduct.brand}
                          onChange={(e) => updateProductField('brand', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="Brand name"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-pink-600" />
                          New Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newProduct.new_price}
                          onChange={(e) => updateProductField('new_price', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                          Old Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.old_price}
                          onChange={(e) => updateProductField('old_price', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={newProduct.sku}
                        onChange={(e) => updateProductField('sku', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Product SKU"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                      </label>
                      <textarea
                        value={newProduct.short_description}
                        onChange={(e) => updateProductField('short_description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Brief product description (150 chars max)"
                        maxLength={150}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Description
                      </label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => updateProductField('description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Detailed product description"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6 flex items-center">
                    <ImageIcon className="w-6 h-6 mr-2 text-pink-600" />
                    Product Images
                  </h2>
                  
                  <div className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center bg-gradient-to-br from-pink-50/50 to-rose-50/50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files.length > 0) {
                          const urls = await handleImageUpload(files);
                          updateProductField('images', [...newProduct.images, ...urls]);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-pink-600" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each</p>
                    </label>
                  </div>
                  
                  {newProduct.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                      {newProduct.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-pink-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateProductField('images', newProduct.images.filter((_, i) => i !== idx));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(uploadProgress).map(([name, progress]) => (
                        <div key={name} className="flex items-center space-x-2">
                          <div className="flex-1 bg-pink-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-2 text-pink-600" />
                    Product Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features
                      </label>
                      {newProduct.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateArrayItem('features', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                            placeholder="Product feature"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('features', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('features')}
                        className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                      >
                        + Add Feature
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Colors Available
                      </label>
                      {newProduct.colors.map((color, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => updateArrayItem('colors', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                            placeholder="Color name"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('colors', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('colors')}
                        className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                      >
                        + Add Color
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sizes Available
                      </label>
                      {newProduct.sizes.map((size, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={size}
                            onChange={(e) => updateArrayItem('sizes', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                            placeholder="Size (e.g., S, M, L, XL)"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('sizes', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('sizes')}
                        className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                      >
                        + Add Size
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materials
                      </label>
                      <input
                        type="text"
                        value={newProduct.materials}
                        onChange={(e) => updateProductField('materials', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="e.g., 100% Cotton, Polyester blend"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Care Instructions
                      </label>
                      <textarea
                        value={newProduct.care_instructions}
                        onChange={(e) => updateProductField('care_instructions', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Washing and care instructions"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO & Metadata */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6 flex items-center">
                    <Globe className="w-6 h-6 mr-2 text-pink-600" />
                    SEO & Metadata
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={newProduct.meta_title}
                        onChange={(e) => updateProductField('meta_title', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="SEO title (auto-generated if empty)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={newProduct.meta_description}
                        onChange={(e) => updateProductField('meta_description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Brief description for search engine results"
                        maxLength={160}
                      />
                      <div className="text-right text-sm text-gray-500 mt-1">
                        {newProduct.meta_description.length}/160
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={newProduct.meta_keywords}
                        onChange={(e) => updateProductField('meta_keywords', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                      <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      {newProduct.tags.map((tag, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                            placeholder="Product tag"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('tags', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('tags')}
                        className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - 1 column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Inventory */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
                    Inventory
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={newProduct.stock_quantity}
                        onChange={(e) => updateProductField('stock_quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        value={newProduct.low_stock_threshold}
                        onChange={(e) => updateProductField('low_stock_threshold', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-pink-600" />
                    Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Class
                      </label>
                      <select
                        value={newProduct.shipping_class}
                        onChange={(e) => updateProductField('shipping_class', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      >
                        <option value="standard">Standard Shipping</option>
                        <option value="express">Express Shipping</option>
                        <option value="overnight">Overnight Shipping</option>
                        <option value="free">Free Shipping</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.weight}
                        onChange={(e) => updateProductField('weight', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="1.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.discount_value}
                        onChange={(e) => updateProductField('discount_value', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="10"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3 py-2">
                      <input
                        type="checkbox"
                        id="available"
                        checked={newProduct.available}
                        onChange={(e) => updateProductField('available', e.target.checked)}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-pink-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="available" className="text-sm font-medium text-gray-700">
                        Available for sale
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3 py-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={newProduct.featured}
                        onChange={(e) => updateProductField('featured', e.target.checked)}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-pink-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                        Featured product
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Status
                      </label>
                      <select
                        value={newProduct.status}
                        onChange={(e) => updateProductField('status', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-6 py-3 border border-pink-300 text-gray-700 rounded-lg hover:bg-pink-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !newProduct.name || !newProduct.new_price}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Create Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
  }

export default AddProductPage
