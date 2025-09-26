import React, { useCallback, useState } from 'react'
import { Package } from 'lucide-react';
import { DollarSign } from 'lucide-react';
import { ImageIcon } from 'lucide-react';
import { Upload, Star, X, Globe, Settings,  Save,
  AlertCircle,
  Check,
  Loader } from 'lucide-react';


 // Add Product Page Component
  const AddProductPage = () => { 
    const categories = ['Dresses', 'Tops', 'Bottoms', 'Accessories', 'Shoes', 'Outerwear', 'Activewear', 'Swimwear'];
  // Enhanced Add Product States
  const [uploadProgress, setUploadProgress] = useState({});
  const [saving, setSaving] = useState(false);  
   const [activeTab, setActiveTab] = useState('dashboard'); 
    
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
  // FIXED: Enhanced Image Upload with Progress - wrapped with useCallback
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

  // FIXED: Generate slug from product name - wrapped with useCallback
  const generateSlug = useCallback((name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // FIXED: Auto-generate meta title if empty - wrapped with useCallback
  const generateMetaTitle = useCallback((name, category) => {
    return `${name} - ${category} | Your Store`;
  }, []);

  // FIXED: Helper function to update newProduct without re-rendering issues
  const updateProductField = useCallback((field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // FIXED: Helper function to update nested fields
  const updateNestedField = useCallback((parentField, childField, value) => {
    setNewProduct(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  }, []);

  // FIXED: Helper function to add array items
  const addArrayItem = useCallback((field, defaultValue = '') => {
    setNewProduct(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  }, []);

  // FIXED: Helper function to remove array items
  const removeArrayItem = useCallback((field, index) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  // FIXED: Helper function to update array items
  const updateArrayItem = useCallback((field, index, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  }, []);


// FIXED: Enhanced Add Product Handler - wrapped with useCallback
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
        setActiveTab('products');
        alert('Product added successfully!');
      } else {
        alert('Error adding product:' + data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product:' + error.message);
    } finally {
      setSaving(false);
    }
  }, [newProduct, generateSlug, generateMetaTitle, API_BASE]);

  
  
return ( 
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Add New Product</h1>
          <p className="text-blue-100 mt-1">Fill in the details below to create a new product</p>
        </div>

        <form onSubmit={handleAddProduct} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => updateProductField('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => updateProductField('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter brand name"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Product SKU"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Regular Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.new_price}
                        onChange={(e) => updateProductField('new_price', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      value={newProduct.short_description}
                      onChange={(e) => updateProductField('short_description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Brief product description for listings"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => updateProductField('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Detailed product description"
                    />
                  </div>
                </div>
              </div>

              {/* Product Images Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Product Images
                </h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      const uploadedUrls = await handleImageUpload(files);
                      setNewProduct(prev => ({
                        ...prev,
                        images: [...prev.images, ...uploadedUrls],
                        image: prev.images.length === 0 && uploadedUrls.length > 0 ? uploadedUrls[0] : prev.image
                      }));
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          Click to upload images
                        </span>
                        <p className="text-sm text-gray-500">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                  </label>
                </div>
                
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Upload Progress</h4>
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                      <div key={filename} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 flex-1 truncate">{filename}</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${progress === -1 ? 'bg-red-500' : progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.max(0, progress)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12">
                          {progress === -1 ? 'Error' : `${progress}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {newProduct.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {newProduct.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewProduct(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Features & Details Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-600" />
                  Features & Details
                </h2>
                
                <div className="space-y-6">
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter product feature"
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
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Feature
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specifications
                    </label>
                    {newProduct.specifications.map((spec, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => updateArrayItem('specifications', index, { ...spec, key: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Specification name"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => updateArrayItem('specifications', index, { ...spec, value: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Value"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('specifications', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                                       <button
                      type="button"
                      onClick={() => addArrayItem('specifications', { key: '', value: '' })}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Specification
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add Color
                      </button>
                    </div>
                    
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add Size
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materials
                      </label>
                      <textarea
                        value={newProduct.materials}
                        onChange={(e) => updateProductField('materials', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Product materials and composition"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Care and washing instructions"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-8">
              {/* Pricing & Sales */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Pricing & Sales
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compare at Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.old_price}
                        onChange={(e) => updateProductField('old_price', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="100"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="product-url-slug"
                    />
                    <p className="text-sm text-gray-500 mt-1">URL: yourstore.com/products/{newProduct.slug || 'product-name'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={newProduct.meta_title}
                      onChange={(e) => updateProductField('meta_title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="SEO title for search engines"
                      maxLength={60}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {newProduct.meta_title.length}/60
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={newProduct.meta_description}
                      onChange={(e) => updateProductField('meta_description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Advanced Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Class
                    </label>
                    <select
                      value={newProduct.shipping_class}
                      onChange={(e) => updateProductField('shipping_class', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="standard">Standard Shipping</option>
                      <option value="express">Express Shipping</option>
                      <option value="overnight">Overnight Shipping</option>
                      <option value="free">Free Shipping</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProduct.weight}
                        onChange={(e) => updateProductField('weight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Product Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="available"
                      checked={newProduct.available}
                      onChange={(e) => updateProductField('available', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="available" className="text-sm font-medium text-gray-700">
                      Available for sale
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newProduct.featured}
                      onChange={(e) => updateProductField('featured', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newProduct.name || !newProduct.new_price}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  }

export default AddProductPage
