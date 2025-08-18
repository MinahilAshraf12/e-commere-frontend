'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, ShoppingCart, CreditCard, Truck, Shield } from 'lucide-react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaymentSelector from '../components/PaymentSelector'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { StripeProvider } from '../context/StripeContext'
import { PayPalProvider } from '../context/PayPalContext'
import { toast } from 'react-toastify'

function CheckoutContent() {
    const router = useRouter()
    const { cart, getTotalPrice, getTotalItems, clearCart } = useCart()
    const { user } = useAuth()
    
    const [orderId, setOrderId] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [shippingAddress, setShippingAddress] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Pk'
    })

    useEffect(() => {
        const newOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
        setOrderId(newOrderId)
        console.log('🆔 Generated Order ID:', newOrderId)

        if (cart.length === 0) {
            router.push('/cart')
        }
    }, [cart, router])

    const handlePaymentSuccess = async (order, paymentData) => {
        setIsProcessing(true)
        
        try {
            console.log('✅ Payment successful!', { order, paymentData })
            
            await clearCart()
            toast.success('🎉 Payment successful! Order confirmed.')
            
            const successOrderId = order?.orderId || order?._id
            let paymentId = 'completed'
            
            if (paymentData?.id) {
                paymentId = paymentData.id
            } else if (paymentData?.orderID) {
                paymentId = paymentData.orderID
            } else if (paymentData?.captureId) {
                paymentId = paymentData.captureId
            }
            
            console.log('🔄 Redirecting to success page...', { successOrderId, paymentId })
            
            if (!successOrderId) {
                throw new Error('Order ID is missing. Please contact support.')
            }
            
            router.push(`/order/success?payment_intent=${paymentId}&order_id=${successOrderId}`)
            
        } catch (error) {
            console.error('❌ Error processing successful payment:', error)
            toast.error('Payment succeeded but there was an error. Please contact support.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePaymentError = (error) => {
        console.error('❌ Payment error:', error)
        toast.error(error.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-4">Redirecting to cart...</p>
                </div>
            </div>
        )
    }

    const subtotal = getTotalPrice()
    const shipping = subtotal > 75 ? 0 : 9.99
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            {/* Progress Bar */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center space-x-8">
                        <div className="flex items-center text-pink-600">
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            <span className="font-medium">Cart</span>
                        </div>
                        <div className="h-px bg-pink-300 w-12"></div>
                        <div className="flex items-center text-pink-600 font-semibold">
                            <CreditCard className="w-5 h-5 mr-2" />
                            <span>Checkout</span>
                        </div>
                        <div className="h-px bg-gray-300 w-12"></div>
                        <div className="flex items-center text-gray-400">
                            <Package className="w-5 h-5 mr-2" />
                            <span>Confirmation</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/cart" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Cart
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-800">Secure Checkout</h1>
                        <p className="text-gray-600 mt-2">
                            Complete your order with confidence • SSL encrypted
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        
                        {/* Left Side - Order Summary & Shipping */}
                        <div className="lg:col-span-3 space-y-6">
                            
                            {/* Order Summary */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Package className="w-6 h-6 mr-3 text-pink-600" />
                                    Order Summary ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})
                                </h2>
                                
                                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                                    {cart.map((item, index) => (
                                        <div key={`${item.id}-${index}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-pink-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                                {item.category && (
                                                    <p className="text-gray-500 text-xs capitalize bg-gray-200 px-2 py-1 rounded-full w-fit mt-1">
                                                        {item.category}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800 text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-gray-500 text-sm">${item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Totals */}
                                <div className="border-t pt-6 space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center">
                                            <Truck className="w-4 h-4 mr-1" />
                                            Shipping:
                                        </span>
                                        <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                                            {shipping === 0 ? 'FREE ✨' : `${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    {shipping > 0 && subtotal < 75 && (
                                        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            💡 Add ${(75 - subtotal).toFixed(2)} more for free shipping!
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (8%):</span>
                                        <span className="font-medium">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-2xl border-t pt-4 text-gray-800">
                                        <span>Total:</span>
                                        <span className="text-pink-600">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Shipping Address */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Truck className="w-5 h-5 mr-3 text-pink-600" />
                                    Shipping Address
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingAddress.name}
                                            onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={shippingAddress.email}
                                            onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={shippingAddress.phone}
                                            onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingAddress.address}
                                            onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingAddress.city}
                                            onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                            placeholder="New York"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingAddress.state}
                                            onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                            placeholder="NY"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={shippingAddress.zipCode}
                                            onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>

                                {/* Security Notice */}
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center space-x-2 text-green-800">
                                        <Shield className="w-5 h-5" />
                                        <span className="font-medium">Secure Checkout</span>
                                    </div>
                                    <p className="text-green-700 text-sm mt-1">
                                        Your information is protected with 256-bit SSL encryption
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Side - Payment Selection */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-8"
                            >
                                <PaymentSelector
                                    amount={total}
                                    orderId={orderId}
                                    userId={user?.id || 'guest'}
                                    cartItems={cart}
                                    shippingAddress={shippingAddress}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                    isLoading={isProcessing}
                                />

                                {/* Trust Signals */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-3">Why shop with us?</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            <span>Secure payments</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Truck className="w-4 h-4 text-blue-500" />
                                            <span>Free shipping over $75</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Package className="w-4 h-4 text-purple-500" />
                                            <span>30-day return policy</span>
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

export default function CheckoutPage() {
    return (
        <StripeProvider>
            <PayPalProvider>
                <CheckoutContent />
            </PayPalProvider>
        </StripeProvider>
    )
}