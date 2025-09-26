'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Package,
  ShoppingBag,
  TrendingUp,
  Eye,
  EyeOff,
  Menu,
  X,
  Home,
  Settings,
  Upload,
  DollarSign,
  BarChart3,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Store,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Tag,
  FileText,
  Star,
  Globe,
  Save,
  AlertCircle,
  Check,
  Loader,
  LogOut,
  Shield
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import AddProductPage from './components/AddProduct';
import EditProductPage from './components/EditProduct';
import ViewProducts from './components/ViewProducts';
import ProductDetailsPage from './components/ProductDetails';
import AdminOrders from './components/AdminOrders';
import AdminLogin from './components/AdminLogin';

const AdminPanel = () => {
  // ALL STATES FIRST - Before any conditional logic
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Existing states
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [ecommerceOpen, setEcommerceOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);

  // Analytics States
  const [salesData, setSalesData] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [revenueMetrics, setRevenueMetrics] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('monthly');
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [analyticsMonth, setAnalyticsMonth] = useState(new Date().getMonth() + 1);

  // Constants
  const periods = ['daily', 'weekly', 'monthly', 'yearly'];
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // ALL CALLBACKS AND FUNCTIONS - Before useEffect hooks
  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_BASE]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Sales Overview
      const salesResponse = await fetch(`${API_BASE}/analytics/sales-overview?period=${analyticsPeriod}&year=${analyticsYear}`, { headers });
      const salesData = await salesResponse.json();
      if (salesData.success) {
        setSalesData(salesData.data);
      }

      // Product Performance
      const productResponse = await fetch(`${API_BASE}/analytics/product-performance?year=${analyticsYear}&month=${analyticsMonth}`, { headers });
      const productData = await productResponse.json();
      if (productData.success) {
        setProductPerformance(productData.data);
      }

      // Category Performance
      const categoryResponse = await fetch(`${API_BASE}/analytics/category-performance?year=${analyticsYear}`, { headers });
      const categoryData = await categoryResponse.json();
      if (categoryData.success) {
        setCategoryPerformance(categoryData.data);
      }

      // Revenue Metrics
      const revenueResponse = await fetch(`${API_BASE}/analytics/revenue-metrics`, { headers });
      const revenueData = await revenueResponse.json();
      if (revenueData.success) {
        setRevenueMetrics(revenueData.metrics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [API_BASE, analyticsPeriod, analyticsYear, analyticsMonth]);

  // Generate sample data
  const generateSampleData = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/generate-sample-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Generated ${data.salesGenerated} sample sales records`);
        fetchAnalytics();
      } else {
        alert('Error generating sample data:' + data.message);
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
      alert('Error generating sample data');
    }
  }, [API_BASE, fetchAnalytics]);

  // Check if admin is authenticated
  const checkAuthStatus = useCallback(async () => {
    setAuthLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const storedAdminData = localStorage.getItem('adminData');

      if (token && storedAdminData) {
        // Verify token with server
        const response = await fetch(`${API_BASE}/admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setIsAuthenticated(true);
          setAdminData(data.admin);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          setIsAuthenticated(false);
          setAdminData(null);
        }
      } else {
        setIsAuthenticated(false);
        setAdminData(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setAdminData(null);
    } finally {
      setAuthLoading(false);
    }
  }, [API_BASE]);

  // Handle successful login
  const handleLoginSuccess = useCallback((admin) => {
    setIsAuthenticated(true);
    setAdminData(admin);
    setActiveTab('dashboard');
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setIsAuthenticated(false);
      setAdminData(null);
      setActiveTab('dashboard');
    }
  }, []);

  // Image utility functions
  const getImageSrc = useCallback((imageSrc, fallback = 'https://placehold.co/400x400/FFB6C1/FFFFFF?text=Pink+Dreams') => {
    if (!imageSrc) return fallback
    
    const baseURL = API_BASE || 'http://localhost:4000'
    
    // Handle old Railway URLs
    if (imageSrc.includes('railway.app')) {
      const filename = imageSrc.split('/images/')[1]
      if (filename) {
        return `${baseURL}/images/${filename}`
      }
    }
    
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return imageSrc
    }
    
    if (imageSrc.startsWith('/images/')) {
      return `${baseURL}${imageSrc}`
    }
    
    if (!imageSrc.includes('/') && /\.(jpg|jpeg|png|gif|webp)$/i.test(imageSrc)) {
      return `${baseURL}/images/${imageSrc}`
    }
    
    if (imageSrc.startsWith('images/')) {
      return `${baseURL}/${imageSrc}`
    }
    
    return `${baseURL}/${imageSrc}`
  }, [API_BASE]);

  const handleImageError = useCallback((e) => {
    if (e.target.src !== 'https://placehold.co/400x400/FFB6C1/FFFFFF?text=No+Image') {
      e.target.onerror = null
      e.target.src = 'https://placehold.co/400x400/FFB6C1/FFFFFF?text=No+Image'
    }
  }, []);

  // Handle edit product navigation
  const handleEditProduct = useCallback((product) => {
    setSelectedProductForEdit(product);
    setActiveTab('edit-product');
    setSidebarOpen(false);
  }, []);

  // Handle view product details navigation
  const handleViewProduct = useCallback((product) => {
    setSelectedProductForDetails(product);
    setActiveTab('product-details');
    setSidebarOpen(false);
  }, []);

  // Handle delete product
  const handleDeleteProduct = useCallback(async (product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE}/products/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert('Product deleted successfully');
          if (activeTab === 'products') {
            window.location.reload();
          } else if (activeTab === 'product-details') {
            setActiveTab('products');
            setSelectedProductForDetails(null);
          }
        } else {
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  }, [API_BASE, activeTab]);

  // Handle back navigation from product details
  const handleBackFromDetails = useCallback(() => {
    setSelectedProductForDetails(null);
    setActiveTab('products');
  }, []);

  // Handle edit from product details
  const handleEditFromDetails = useCallback((product) => {
    const productToEdit = product || selectedProductForDetails;
    setSelectedProductForEdit(productToEdit);
    setActiveTab('edit-product');
  }, [selectedProductForDetails]);

  const formatChartData = useCallback((data) => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      let label;
      if (analyticsPeriod === 'daily') {
        label = new Date(item._id).toLocaleDateString();
      } else if (analyticsPeriod === 'weekly') {
        label = `Week ${item._id.week}, ${item._id.year}`;
      } else if (analyticsPeriod === 'monthly') {
        label = months.find(m => m.value === item._id)?.label || `Month ${item._id}`;
      } else if (analyticsPeriod === 'yearly') {
        label = item._id.toString();
      }
      
      return {
        name: label,
        sales: item.total_sales,
        orders: item.total_orders,
        quantity: item.total_quantity
      };
    });
  }, [analyticsPeriod, months]);

  // ALL useEffect HOOKS AFTER ALL CALLBACKS
  // Authentication check on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Effects
  useEffect(() => {
    if (activeTab === 'dashboard' && isAuthenticated) {
      fetchStats();
    }
  }, [activeTab, fetchStats, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'analytics' && isAuthenticated) {
      fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics, isAuthenticated]);

  // CONDITIONAL RENDERING - All hooks must be called before this point
  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Analytics Component
  const Analytics = () => {
    const chartData = formatChartData(salesData);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    return (
      <div className="space-y-6">
        {/* Analytics Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period} value={period}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={analyticsYear}
                onChange={(e) => setAnalyticsYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select
                value={analyticsMonth}
                onChange={(e) => setAnalyticsMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={fetchAnalytics}
                disabled={analyticsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={generateSampleData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Generate Sample Data
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today Revenue</p>
                <p className="text-2xl font-bold text-green-600">${revenueMetrics.today || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">${revenueMetrics.month || 0}</p>
                <p className="text-xs text-gray-500">
                  {revenueMetrics.monthGrowth >= 0 ? '+' : ''}{revenueMetrics.monthGrowth || 0}% from last month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yearly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${revenueMetrics.year || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${((revenueMetrics.month || 0) / Math.max(salesData.reduce((acc, item) => acc + (item.total_orders || 0), 0), 1)).toFixed(2)}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Component with fixed image handling
  const Dashboard = () => {
    const ProductImageDisplay = ({ product }) => {
      let images = [];
      
      if (product.images && Array.isArray(product.images)) {
        images = product.images.filter(img => img && img.trim() !== '');
      } else if (product.image) {
        images = [product.image];
      }

      if (images.length === 0) {
        return (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
        );
      }

      return (
        <div className="flex items-center mr-3">
          <img 
            src={getImageSrc(images[0])}
            alt={product.name} 
            className="w-10 h-10 rounded object-cover"
            onError={handleImageError}
          />
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts || 0}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold">{stats.activeProducts || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Products</p>
                <p className="text-2xl font-bold">{stats.inactiveProducts || 0}</p>
              </div>
              <EyeOff className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{stats.categoryStats?.length || 0}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Products by Category</h3>
            <div className="space-y-3">
              {stats.categoryStats?.map((cat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{cat._id}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Products</h3>
            <div className="space-y-3">
              {stats.recentProducts?.map((product, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <ProductImageDisplay product={product} />
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">${product.new_price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MAIN JSX RETURN
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Enhanced Sidebar with E-commerce Module */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            {adminData && (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-600">{adminData.role}</span>
              </div>
            )}
          </div>
          {adminData && (
            <p className="text-sm text-gray-600 mt-1">Welcome, {adminData.name}</p>
          )}
        </div>
        
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>

            {/* E-commerce Module with Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setEcommerceOpen(!ecommerceOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                  ['add-product', 'products', 'product-details', 'edit-product'].includes(activeTab)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5" />
                  E-commerce
                </div>
                {ecommerceOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* E-commerce Dropdown */}
              <div className={`ml-4 space-y-1 transition-all duration-200 ${ecommerceOpen ? 'block' : 'hidden'}`}>
                <button
                  onClick={() => {
                    setActiveTab('add-product');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'add-product' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'products' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  View Products
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('product-details');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'product-details' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Product Details
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('edit-product');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'edit-product' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Product
                </button>
              </div>
            </div>

            {/* Orders Section */}
            <button
              onClick={() => {
                setActiveTab('orders');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Orders
            </button>

            <button
              onClick={() => {
                setActiveTab('analytics');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
          </div>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800 capitalize">
                {activeTab === 'add-product' ? 'Add Product' : 
                 activeTab === 'product-details' ? 'Product Details' :
                 activeTab === 'edit-product' ? 'Edit Product' : activeTab}
              </h2>
              <div className="flex items-center gap-4">
                {(activeTab === 'products' || activeTab === 'add-product' || 
                  activeTab === 'product-details' || activeTab === 'edit-product') && (
                  <button
                    onClick={() => setActiveTab('add-product')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                )}
                {adminData && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {adminData.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600">
                      {adminData.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          
          {activeTab === 'products' && (
            <ViewProducts 
              onEditProduct={handleEditProduct}
              onViewProduct={handleViewProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
          
          {activeTab === 'add-product' && <AddProductPage />}
          
          {activeTab === 'orders' && <AdminOrders />}
          
          {activeTab === 'analytics' && <Analytics />}
          
          {activeTab === 'product-details' && (
            selectedProductForDetails ? (
              <ProductDetailsPage 
                productId={selectedProductForDetails.id || selectedProductForDetails._id}
                onEdit={handleEditFromDetails}
                onDelete={() => handleDeleteProduct(selectedProductForDetails)}
                onBack={handleBackFromDetails}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <p className="text-gray-600 mb-4">
                  Select a product from the products list to view detailed information.
                </p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Go to Products List
                </button>
              </div>
            )
          )}
          
          {activeTab === 'edit-product' && (
            selectedProductForEdit ? (
              <EditProductPage 
                product={selectedProductForEdit}
                onSave={() => {
                  setActiveTab('products');
                  setSelectedProductForEdit(null);
                }}
                onCancel={() => {
                  setActiveTab('products');
                  setSelectedProductForEdit(null);
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
                <p className="text-gray-600 mb-4">
                  Select a product from the products list to edit.
                </p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Go to Products List
                </button>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;