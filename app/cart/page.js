// pages/cart/page.js
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, Lock, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext' // Import from CartContext
import { toast } from 'react-toastify'

export default function CartPage() {
  const { 
    cart, 
    isLoading,
    error,
    removeFromCart, 
    updateQuantity, 
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalItems, 
    getTotalPrice,
    loadCart
  } = useCart()

  const [promoCode, setPromoCode] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const [editingQuantity, setEditingQuantity] = useState({}) // Track which items are being edited
  const [tempQuantity, setTempQuantity] = useState({}) // Store temporary quantity values

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const shipping = getTotalPrice() > 75 ? 0 : 9.99 // Free shipping over $75
  const tax = getTotalPrice() * 0.08 // 8% tax
  const subtotal = getTotalPrice()
  const finalTotal = subtotal + shipping + tax - promoDiscount

  // Handle quantity input editing
  const handleQuantityClick = (itemId, currentQuantity) => {
    setEditingQuantity(prev => ({ ...prev, [itemId]: true }))
    setTempQuantity(prev => ({ ...prev, [itemId]: currentQuantity.toString() }))
  }

  const handleQuantityChange = (itemId, value) => {
    // Only allow positive integers
    const sanitizedValue = value.replace(/[^0-9]/g, '')
    setTempQuantity(prev => ({ ...prev, [itemId]: sanitizedValue }))
  }

  const handleQuantitySubmit = (itemId, stockQuantity) => {
    const newQuantity = parseInt(tempQuantity[itemId]) || 1
    
    // Validate quantity
    let finalQuantity = Math.max(1, newQuantity) // Minimum 1
    if (stockQuantity !== undefined) {
      finalQuantity = Math.min(finalQuantity, stockQuantity) // Don't exceed stock
    }
    
    updateQuantity(itemId, finalQuantity)
    setEditingQuantity(prev => ({ ...prev, [itemId]: false }))
    setTempQuantity(prev => ({ ...prev, [itemId]: '' }))
  }

  const handleQuantityBlur = (itemId, stockQuantity) => {
    handleQuantitySubmit(itemId, stockQuantity)
  }

  const handleQuantityKeyPress = (e, itemId, stockQuantity) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit(itemId, stockQuantity)
    } else if (e.key === 'Escape') {
      setEditingQuantity(prev => ({ ...prev, [itemId]: false }))
      setTempQuantity(prev => ({ ...prev, [itemId]: '' }))
    }
  }

  const handleApplyPromoCode = async () => {
    setIsApplyingPromo(true)
    setPromoMessage('')
    
    // Simulate promo code validation
    setTimeout(() => {
      const code = promoCode.toLowerCase().trim()
      
      if (code === 'save10') {
        const discount = subtotal * 0.1
        setPromoDiscount(discount)
        setPromoMessage(`Promo code applied! You saved ${formatPrice(discount)}`)
      } else if (code === 'welcome5') {
        setPromoDiscount(5)
        setPromoMessage('Welcome! You saved $5.00')
      } else if (code === 'freeship') {
        if (shipping > 0) {
          setPromoDiscount(shipping)
          setPromoMessage('Free shipping applied!')
        } else {
          setPromoMessage('Free shipping is already active')
        }
      } else {
        setPromoMessage('Invalid promo code. Try: SAVE10, WELCOME5, or FREESHIP')
        setPromoDiscount(0)
      }
      setIsApplyingPromo(false)
    }, 1000)
  }

  const handleRefreshCart = async () => {
    await loadCart()
  }

  const removePromoCode = () => {
    setPromoCode('')
    setPromoDiscount(0)
    setPromoMessage('')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <AlertCircle className="w-24 h-24 mx-auto text-red-400 mb-8" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Error Loading Cart</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleRefreshCart}
                  className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors inline-flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
                <Link href="/shop">
                  <button className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-8" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/shop" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
                <p className="text-gray-600 mt-2">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {error && (
                  <button
                    onClick={handleRefreshCart}
                    className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center space-x-1 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                )}
                {cart.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your entire cart?')) {
                        clearCart()
                        removePromoCode()
                      }
                    }}
                    className="text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Clear All
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Cart Items</h2>
                  <div className="space-y-6">
                    {cart.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-pink-400" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                              {item.category && (
                                <p className="text-sm text-gray-500 mb-2 capitalize">{item.category}</p>
                              )}
                              
                              {/* Stock Status */}
                              {item.stock_quantity !== undefined && (
                                <div className="mb-2">
                                  {item.stock_quantity === 0 ? (
                                    <span className="text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                                      Out of Stock
                                    </span>
                                  ) : item.stock_quantity < 5 ? (
                                    <span className="text-orange-500 text-xs font-medium bg-orange-50 px-2 py-1 rounded">
                                      Only {item.stock_quantity} left
                                    </span>
                                  ) : (
                                    <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                                      In Stock
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => decreaseQuantity(item.id)}
                                  disabled={isLoading}
                                  className="p-2 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                
                                {/* Editable Quantity Display */}
                                {editingQuantity[item.id] ? (
                                  <input
                                    type="text"
                                    value={tempQuantity[item.id] || ''}
                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                    onBlur={() => handleQuantityBlur(item.id, item.stock_quantity)}
                                    onKeyDown={(e) => handleQuantityKeyPress(e, item.id, item.stock_quantity)}
                                    className="w-12 px-2 py-2 text-center font-medium border-none outline-none focus:bg-blue-50"
                                    autoFocus
                                    maxLength="3"
                                  />
                                ) : (
                                  <button
                                    onClick={() => handleQuantityClick(item.id, item.quantity)}
                                    className="px-4 py-2 font-medium min-w-[3rem] text-center hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                                    title="Click to edit quantity"
                                  >
                                    {item.quantity}
                                  </button>
                                )}
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => increaseQuantity(item.id)}
                                  disabled={isLoading || (item.stock_quantity !== undefined && item.quantity >= item.stock_quantity)}
                                  className="p-2 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-sm text-gray-500">
                                    {formatPrice(item.price)} each
                                  </p>
                                )}
                              </div>

                              {/* Remove Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                               onClick={() => {
  removeFromCart(item.id)
  toast.error(`${item.name} removed from cart!`)
}}
                                disabled={isLoading}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary - Same as before */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                
                {/* Summary Details */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  
                  {shipping > 0 && subtotal < 75 && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      💡 Add {formatPrice(75 - subtotal)} more for free shipping!
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded">
                      <span>Promo Discount</span>
                      <span className="font-medium">-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-pink-600">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
               // In your cart page, replace the checkout button with:
<Link href="/checkout">
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg mt-6 flex items-center justify-center space-x-2 disabled:opacity-50"
    >
        <CreditCard className="w-5 h-5" />
        <span>Proceed to Checkout</span>
    </motion.button>
</Link>

                {/* Security Notice */}
                <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>

                {/* Promo Code */}
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Have a promo code?
                    </label>
                    {promoDiscount > 0 ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                        <span className="text-green-700 text-sm font-medium">
                          Code: {promoCode.toUpperCase()}
                        </span>
                        <button
                          onClick={removePromoCode}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleApplyPromoCode}
                            disabled={!promoCode.trim() || isApplyingPromo}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                          >
                            {isApplyingPromo ? 'Applying...' : 'Apply'}
                          </motion.button>
                        </div>
                        {promoMessage && (
                          <div className={`text-xs p-2 rounded ${
                            promoDiscount > 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                          }`}>
                            {promoMessage}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Try: SAVE10 (10% off), WELCOME5 ($5 off), or FREESHIP
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 mb-2">Estimated Delivery</p>
                    <div className="space-y-1">
                      <p className="text-gray-600 flex justify-between">
                        <span>Standard shipping:</span>
                        <span>5-7 business days</span>
                      </p>
                      <p className="text-gray-600 flex justify-between">
                        <span>Express shipping:</span>
                        <span>2-3 business days</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}