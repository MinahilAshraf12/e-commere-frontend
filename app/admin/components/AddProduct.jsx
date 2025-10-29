import React, { useCallback, useState, useEffect } from 'react'
import { Package, DollarSign, ImageIcon, Upload, Star, X, Globe, Settings, Save,
  AlertCircle, Check, Loader, FileSpreadsheet, Download, FileUp, RefreshCw } from 'lucide-react';


 // Add Product Page Component with Dynamic + Static Categories
  const AddProductPage = () => { 
    // Static categories (fallback/default)
    const staticCategories = ['Dresses', 'Tops', 'Bottoms', 'Accessories', 'Shoes', 'Outerwear', 'Activewear', 'Swimwear'];
    
    // Dynamic categories from backend
    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    
    // Combined categories (dynamic + static)
    const [allCategories, setAllCategories] = useState([]);
  
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
    category: '',
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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Fetch active categories from backend and merge with static
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${API_BASE}/categories?active=true`);
        const data = await response.json();
        
        if (data.success && data.categories && data.categories.length > 0) {
          // Sort dynamic categories by order and name
          const sortedDynamicCategories = data.categories.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return a.name.localeCompare(b.name);
          });
          
          setDynamicCategories(sortedDynamicCategories);
          
          // Extract category names from dynamic categories
          const dynamicCategoryNames = sortedDynamicCategories.map(cat => cat.name);
          
          // Filter static categories to avoid duplicates
          const uniqueStaticCategories = staticCategories.filter(
            staticCat => !dynamicCategoryNames.includes(staticCat)
          );
          
          // Combine: Dynamic categories first, then unique static categories
          const combined = [
            ...dynamicCategoryNames,
            ...uniqueStaticCategories
          ];
          
          setAllCategories(combined);
          
          // Set first category as default if product category is empty
          if (!newProduct.category && combined.length > 0) {
            setNewProduct(prev => ({
              ...prev,
              category: combined[0]
            }));
          }
        } else {
          // If no dynamic categories, use only static categories
          console.warn('No active categories found from backend, using static categories');
          setAllCategories(staticCategories);
          setDynamicCategories([]);
          
          if (!newProduct.category) {
            setNewProduct(prev => ({
              ...prev,
              category: staticCategories[0]
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // On error, fallback to static categories
        console.log('Using static categories as fallback');
        setAllCategories(staticCategories);
        setDynamicCategories([]);
        
        if (!newProduct.category) {
          setNewProduct(prev => ({
            ...prev,
            category: staticCategories[0]
          }));
        }
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [API_BASE]);

  // Refresh categories function
  const refreshCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`${API_BASE}/categories?active=true`);
      const data = await response.json();
      
      if (data.success && data.categories) {
        const sortedDynamicCategories = data.categories.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.name.localeCompare(b.name);
        });
        
        setDynamicCategories(sortedDynamicCategories);
        
        const dynamicCategoryNames = sortedDynamicCategories.map(cat => cat.name);
        const uniqueStaticCategories = staticCategories.filter(
          staticCat => !dynamicCategoryNames.includes(staticCat)
        );
        
        const combined = [...dynamicCategoryNames, ...uniqueStaticCategories];
        setAllCategories(combined);
        
        alert('Categories refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
      alert('Failed to refresh categories. Using cached categories.');
    } finally {
      setLoadingCategories(false);
    }
  };

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
    const categoryNames = allCategories.join(', ');
    const template = `name,category,new_price,old_price,brand,sku,description,short_description,stock_quantity,available,featured
"Example Dress","${allCategories[0] || 'Dresses'}","99.99","149.99","Brand Name","SKU-001","Full description","Short description","100","true","false"
"Another Product","${allCategories[1] || 'Tops'}","49.99","79.99","Brand","SKU-002","Description here","Short desc","50","true","true"

Available Categories: ${categoryNames}`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [allCategories]);

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
    setNewProduct(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when name changes
      if (field === 'name' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      
      // Auto-generate meta title when name or category changes
      if ((field === 'name' || field === 'category') && !prev.meta_title) {
        updated.meta_title = generateMetaTitle(
          field === 'name' ? value : prev.name,
          field === 'category' ? value : prev.category
        );
      }
      
      return updated;
    });
  }, [generateSlug, generateMetaTitle]);

  // Update array items
  const updateArrayItem = useCallback((field, index, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  }, []);

  const addArrayItem = useCallback((field) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  }, []);

  const removeArrayItem = useCallback((field, index) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  // Update specifications
  const updateSpecification = useCallback((index, key, value) => {
    setNewProduct(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [key]: value } : spec
      )
    }));
  }, []);

  const addSpecification = useCallback(() => {
    setNewProduct(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  }, []);

  const removeSpecification = useCallback((index) => {
    setNewProduct(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newProduct.name || !newProduct.new_price) {
      alert('Please fill in all required fields (Name and Price)');
      return;
    }

    if (!newProduct.category) {
      alert('Please select a category');
      return;
    }
    
    setSaving(true);
    
    try {
      // Clean up empty array items
      const cleanedProduct = {
        ...newProduct,
        features: newProduct.features.filter(f => f.trim()),
        colors: newProduct.colors.filter(c => c.trim()),
        sizes: newProduct.sizes.filter(s => s.trim()),
        tags: newProduct.tags.filter(t => t.trim()),
        specifications: newProduct.specifications.filter(s => s.key && s.value),
        
        // Ensure image is set (use first image from images array if available)
        image: newProduct.image || (newProduct.images && newProduct.images[0]) || '',
        
        // Parse numeric values
        new_price: parseFloat(newProduct.new_price),
        old_price: newProduct.old_price ? parseFloat(newProduct.old_price) : parseFloat(newProduct.new_price),
        stock_quantity: newProduct.stock_quantity ? parseInt(newProduct.stock_quantity) : 0,
        low_stock_threshold: newProduct.low_stock_threshold ? parseInt(newProduct.low_stock_threshold) : 5,
        discount_value: newProduct.discount_value ? parseFloat(newProduct.discount_value) : 0,
        weight: newProduct.weight ? parseFloat(newProduct.weight) : 0
      };
      
      const response = await fetch(`${API_BASE}/addproduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedProduct)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Product added successfully!');
        // Reset form
        setNewProduct({
          name: '',
          category: allCategories.length > 0 ? allCategories[0] : '',
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
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [newProduct, API_BASE, allCategories]);

  // Handle image selection
  const handleImageSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const uploadedUrls = await handleImageUpload(files);
    
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
      image: prev.image || uploadedUrls[0] // Set first image as main if not set
    }));
  }, [handleImageUpload]);

  // Remove image from array
  const removeImage = useCallback((indexToRemove) => {
    setNewProduct(prev => {
      const newImages = prev.images.filter((_, index) => index !== indexToRemove);
      return {
        ...prev,
        images: newImages,
        image: prev.image === prev.images[indexToRemove] ? (newImages[0] || '') : prev.image
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Bulk Upload Toggle */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center">
                <Package className="w-8 h-8 mr-3 text-pink-600" />
                {bulkUploadMode ? 'Bulk Product Upload' : 'Add New Product'}
              </h1>
              <p className="text-gray-600 mt-1">
                {bulkUploadMode ? 'Upload multiple products at once' : 'Create a new product listing'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setBulkUploadMode(!bulkUploadMode)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all shadow-lg ${
                  bulkUploadMode
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                    : 'bg-white border-2 border-pink-300 text-gray-700 hover:bg-pink-50'
                }`}
              >
                <FileUp className="w-5 h-5" />
                <span>{bulkUploadMode ? 'Single Upload' : 'Bulk Upload'}</span>
              </button>
            </div>
          </div>
          
          {/* Categories Info */}
          {!loadingCategories && (
            <div className="mt-4 flex flex-wrap gap-2 items-center text-sm text-gray-600">
              <span className="font-medium">Available Categories:</span>
              {dynamicCategories.length > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {dynamicCategories.length} Dynamic
                </span>
              )}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {staticCategories.length} Static
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                Total: {allCategories.length}
              </span>
            </div>
          )}
        </div>

        {/* Bulk Upload Interface */}
        {bulkUploadMode ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-pink-100">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <FileSpreadsheet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Product Upload</h2>
                <p className="text-gray-600">Upload multiple products at once using CSV or Excel files</p>
              </div>

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Download Template First</h3>
                    <p className="text-blue-800 text-sm mb-3">
                      Download our template file to see the correct format and all available categories (dynamic + static)
                    </p>
                    <button
                      onClick={downloadTemplate}
                      disabled={allCategories.length === 0}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download CSV Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-8 text-center mb-6 hover:border-pink-500 transition-all">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleBulkFileSelect}
                  className="hidden"
                  id="bulk-file-input"
                />
                <label
                  htmlFor="bulk-file-input"
                  className="cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {bulkFile ? bulkFile.name : 'Click to upload CSV or Excel file'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .csv, .xlsx, and .xls files (max 10MB)
                  </p>
                </label>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleBulkUpload}
                disabled={!bulkFile || bulkUploading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg font-medium"
              >
                {bulkUploading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-6 h-6" />
                    <span>Upload Products</span>
                  </>
                )}
              </button>

              {/* Upload Results */}
              {bulkUploadResults && (
                <div className={`mt-6 rounded-xl p-6 border-2 ${
                  bulkUploadResults.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {bulkUploadResults.success ? (
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 ${
                        bulkUploadResults.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {bulkUploadResults.message}
                      </h3>
                      
                      {bulkUploadResults.success && (
                        <div className="space-y-1 text-sm text-green-800">
                          <p>✅ Successfully added: {bulkUploadResults.added} products</p>
                          {bulkUploadResults.failed > 0 && (
                            <p>❌ Failed: {bulkUploadResults.failed} products</p>
                          )}
                        </div>
                      )}
                      
                      {bulkUploadResults.errors && bulkUploadResults.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-sm mb-2">Errors:</p>
                          <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                            {bulkUploadResults.errors.map((error, index) => (
                              <li key={index} className="text-red-700">• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          
          /* Single Product Form */
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Information */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
                    Basic Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => updateProductField('name', e.target.value)}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                        <span>
                          Category <span className="text-red-500">*</span>
                        </span>
                        <button
                          type="button"
                          onClick={refreshCategories}
                          disabled={loadingCategories}
                          className="text-xs flex items-center space-x-1 text-pink-600 hover:text-pink-800 disabled:opacity-50"
                          title="Refresh categories"
                        >
                          <RefreshCw className={`w-3 h-3 ${loadingCategories ? 'animate-spin' : ''}`} />
                          <span>Refresh</span>
                        </button>
                      </label>
                      
                      {loadingCategories ? (
                        <div className="w-full px-4 py-3 border border-pink-200 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Loader className="w-5 h-5 animate-spin text-pink-600 mr-2" />
                          <span className="text-gray-600">Loading categories...</span>
                        </div>
                      ) : (
                        <select
                          value={newProduct.category}
                          onChange={(e) => updateProductField('category', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          required
                        >
                          <option value="">Select a category</option>
                          
                          {/* Dynamic Categories */}
                          {dynamicCategories.length > 0 && (
                            <optgroup label="📱 Dynamic Categories (from Backend)">
                              {dynamicCategories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          
                          {/* Static Categories (excluding duplicates) */}
                          {staticCategories.filter(
                            staticCat => !dynamicCategories.some(dynCat => dynCat.name === staticCat)
                          ).length > 0 && (
                            <optgroup label="📦 Static Categories">
                              {staticCategories
                                .filter(staticCat => !dynamicCategories.some(dynCat => dynCat.name === staticCat))
                                .map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                            </optgroup>
                          )}
                        </select>
                      )}
                      
                      {!loadingCategories && (
                        <p className="text-xs text-gray-500 mt-1">
                          {dynamicCategories.length > 0 && (
                            <span className="text-green-600 font-medium">{dynamicCategories.length} dynamic</span>
                          )}
                          {dynamicCategories.length > 0 && staticCategories.filter(s => !dynamicCategories.some(d => d.name === s)).length > 0 && ' + '}
                          {staticCategories.filter(s => !dynamicCategories.some(d => d.name === s)).length > 0 && (
                            <span className="text-blue-600 font-medium">
                              {staticCategories.filter(s => !dynamicCategories.some(d => d.name === s)).length} static
                            </span>
                          )}
                          {' '}= {allCategories.length} total categories available
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.new_price}
                          onChange={(e) => updateProductField('new_price', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="99.99"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Old Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.old_price}
                          onChange={(e) => updateProductField('old_price', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="149.99"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={newProduct.sku}
                          onChange={(e) => updateProductField('sku', e.target.value)}
                          className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          placeholder="SKU-001"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                      </label>
                      <textarea
                        value={newProduct.short_description}
                        onChange={(e) => updateProductField('short_description', e.target.value)}
                        rows="2"
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Brief product description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Description
                      </label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => updateProductField('description', e.target.value)}
                        rows="5"
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Detailed product description"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-pink-600" />
                    Product Images
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center hover:border-pink-500 transition-all">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-10 h-10 text-pink-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>

                    {newProduct.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {newProduct.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-pink-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Variants */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
                    Product Variants
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Colors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Colors
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

                    {/* Sizes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Sizes
                      </label>
                      {newProduct.sizes.map((size, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={size}
                            onChange={(e) => updateArrayItem('sizes', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                            placeholder="Size"
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

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Features
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

                    {/* Materials */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materials
                      </label>
                      <input
                        type="text"
                        value={newProduct.materials}
                        onChange={(e) => updateProductField('materials', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="e.g., 100% Cotton"
                      />
                    </div>

                    {/* Care Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Care Instructions
                      </label>
                      <textarea
                        value={newProduct.care_instructions}
                        onChange={(e) => updateProductField('care_instructions', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="Washing and care instructions"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-pink-600" />
                    SEO & Meta Data
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={newProduct.slug}
                        onChange={(e) => updateProductField('slug', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="product-url-slug"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={newProduct.meta_title}
                        onChange={(e) => updateProductField('meta_title', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="SEO title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={newProduct.meta_description}
                        onChange={(e) => updateProductField('meta_description', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="SEO description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={newProduct.meta_keywords}
                        onChange={(e) => updateProductField('meta_keywords', e.target.value)}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Tags
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
                disabled={saving || !newProduct.name || !newProduct.new_price || !newProduct.category}
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
