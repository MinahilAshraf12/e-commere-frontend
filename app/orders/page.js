'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Search,
  Filter,
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Loader,
  AlertCircle,
  X,
  Star,
  MessageCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API functions for orders
const ordersApi = {
  // Get user orders
  getOrders: async (page = 1, limit = 10, status = '', search = '') => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    return response.json();
  },

  // Get single order details
  getOrderById: async (orderId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

    
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }
    
    return response.json();
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/cancel`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

    
    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }
    
    return response.json();
  },

  // Get user stats for header
  getUserStats: async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) return { cart: 0, wishlist: 0 };
    
    try {
  const [cartResponse, wishlistResponse] = await Promise.all([
    fetch(`${API_URL}/cart/summary/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch(`${API_URL}/wishlist/summary/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  ]);
      
      const cartData = cartResponse.ok ? await cartResponse.json() : { totalItems: 0 };
      const wishlistData = wishlistResponse.ok ? await wishlistResponse.json() : { totalItems: 0 };
      
      return {
        cart: cartData.totalItems || 0,
        wishlist: wishlistData.totalItems || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { cart: 0, wishlist: 0 };
    }
  }
};

// Order status configuration
const orderStatusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Order is being processed'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'Order has been confirmed'
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
    description: 'Order is being prepared'
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
    description: 'Order is on the way'
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Order has been cancelled'
  }
};

// Notification Component
const Notification = ({ message, type, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white max-w-md`}
      >
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="ml-2 hover:bg-white/20 p-1 rounded">
          <X size={16} />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
  const config = orderStatusConfig[status] || orderStatusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={14} className="mr-1" />
      {config.label}
    </span>
  );
};

// Order Card Component
const OrderCard = ({ order, onViewDetails, onCancelOrder }) => {
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await onCancelOrder(order.id);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order Items Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-2">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                  <Package size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                +{order.items.length - 3}
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="font-semibold text-gray-800">${order.totalAmount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Payment Method</p>
          <p className="font-medium text-gray-700">{order.paymentMethod}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => onViewDetails(order.id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
        >
          <Eye size={16} />
          <span>View Details</span>
        </button>
        
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ orderId, isOpen, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrderById(orderId);
      if (response.success) {
        setOrder(response.order);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Order Details {order && `#${order.orderNumber}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Status & Info */}
              <div className="flex items-center justify-between">
                <OrderStatusBadge status={order.status} />
                <p className="text-sm text-gray-500">
                  Ordered on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                            <Package size={20} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">${item.price}</p>
                        <p className="text-sm text-gray-500">
                          Total: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPin className="text-gray-400 mt-1" size={16} />
                      <div>
                        <p className="font-medium">{order.shippingAddress.name}</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.city}, {order.shippingAddress.country}
                        </p>
                        <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CreditCard className="text-gray-400 mt-1" size={16} />
                      <div>
                        <p className="font-medium">{order.paymentMethod}</p>
                        <p className="text-sm text-gray-600">Status: {order.paymentStatus}</p>
                        <p className="font-semibold text-lg mt-2">
                          Total: ${order.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              {order.timeline && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                  <div className="space-y-3">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          event.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-800">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.description}</p>
                          {event.date && (
                            <p className="text-xs text-gray-400">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load order details</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Main Orders Page Component
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ cart: 0, wishlist: 0 });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  }, []);

  // Load orders
  const loadOrders = useCallback(async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrders(page, 10, status, search);
      
      if (response.success) {
        setOrders(response.orders);
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
      } else {
        setOrders([]);
        showNotification('No orders found', 'error');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.message.includes('token') || error.message.includes('401')) {
        router.push('/auth/login');
      } else {
        showNotification('Failed to load orders', 'error');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [router, showNotification]);

  // Load user stats for header
  const loadUserStats = useCallback(async () => {
    try {
      const userStats = await ordersApi.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, []);

  // Handle order cancellation
  const handleCancelOrder = useCallback(async (orderId) => {
    try {
      const response = await ordersApi.cancelOrder(orderId);
      if (response.success) {
        showNotification('Order cancelled successfully');
        loadOrders(currentPage, searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotification('Failed to cancel order', 'error');
    }
  }, [currentPage, searchTerm, statusFilter, loadOrders, showNotification]);

  // Handle view order details
  const handleViewDetails = useCallback((orderId) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  }, []);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    loadOrders(1, term, statusFilter);
  }, [statusFilter, loadOrders]);

  // Handle status filter
  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    loadOrders(1, searchTerm, status);
  }, [searchTerm, loadOrders]);

  // Initialize page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Load initial data
    loadOrders();
    loadUserStats();

    // Set mock user data (in real app, get from auth context or API)
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUser({ id: userId });
    }
  }, [router, loadOrders, loadUserStats]);

  return (
    <>
      <Head>
        <title>My Orders - Pink Dreams</title>
        <meta name="description" content="View and manage your Pink Dreams orders" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: '' })} 
        />

        {/* Header Component */}
        <Header userOverride={user} statsOverride={stats} />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your Pink Dreams orders</p>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders by order number..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-pink-500 mr-3" />
              <span className="text-gray-600">Loading your orders...</span>
            </div>
          ) : orders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {orders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={handleViewDetails}
                    onCancelOrder={handleCancelOrder}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  className="flex items-center justify-center space-x-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => loadOrders(currentPage - 1, searchTerm, statusFilter)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => loadOrders(currentPage + 1, searchTerm, statusFilter)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter 
                  ? "No orders match your search criteria" 
                  : "You haven't placed any orders yet"
                }
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
              >
                <span>Start Shopping</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Footer Component */}
        <Footer />

        {/* Order Details Modal */}
        <OrderDetailsModal
          orderId={selectedOrderId}
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
        />
      </div>
    </>
  );
};

export default OrdersPage;