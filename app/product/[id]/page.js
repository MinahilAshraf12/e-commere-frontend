'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext' // Import WishlistContext // Import CartContext
import { toast } from 'react-toastify' // Import toast for notifications
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Plus, 
  Minus, 
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Package,
  Zap
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Enhanced Product Image Zoom Component (unchanged)
const ProductImageZoom = ({ 
  src, 
  alt = "Product image", 
  className = "",
  highResSrc = null,
  onImageLoad = () => {},
  onImageError = () => {}
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  
  const containerRef = useRef(null)
  
  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Calculate cursor position and zoom transform origin
  const calculateZoomPosition = (clientX, clientY) => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    
    // Get cursor position relative to container
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    // Update cursor position for icon
    setCursorPosition({ x, y })
  }

  // Mouse event handlers
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false)
    }
  }

  const handleMouseMove = (e) => {
    if (!isMobile) {
      calculateZoomPosition(e.clientX, e.clientY)
    }
  }

  // Image load handlers
  const handleImageLoad = (e) => {
    setIsImageLoaded(true)
    onImageLoad(e)
  }

  const handleImageError = (e) => {
    setIsImageLoaded(false)
    onImageError(e)
  }

  // Use high-res image for zoom if provided, otherwise use same image
  const zoomImageSrc = highResSrc || src

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        touchAction: isMobile ? 'none' : 'auto',
        cursor: isHovered && !isMobile ? 'none' : 'default'
      }}
    >
      {/* Normal Image - Always visible */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover select-none"
        animate={{
          scale: isHovered && !isMobile ? 2 : 1,
          transformOrigin: `${cursorPosition.x}px ${cursorPosition.y}px`
        }}
        transition={{
          type: "tween",
          ease: "easeOut",
          duration: 0.3
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={false}
        style={{
          transformOrigin: isHovered && !isMobile ? `${cursorPosition.x}px ${cursorPosition.y}px` : 'center center'
        }}
      />

      {/* Loading State */}
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Plus Icon (Desktop Only) */}
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            className="absolute pointer-events-none z-10"
            style={{
              left: cursorPosition.x - 12,
              top: cursorPosition.y - 12
            }}
            initial={{ 
              opacity: 0, 
              scale: 0.5 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5 
            }}
            transition={{
              type: "tween",
              ease: "easeOut",
              duration: 0.15
            }}
          >
            <div>
              <Plus className="w-7 h-7 text-black" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Touch Preparation Layer */}
      {isMobile && (
        <div 
          className="absolute inset-0 z-20"
          style={{ touchAction: 'none' }}
        />
      )}
    </div>
  )
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id

  // Import cart and wishlist context functions
  const { addToCart: addToCartContext } = useCart()
  const { toggleWishlist, isInWishlist: checkIsInWishlist } = useWishlist()

  // Product states
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // UI states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  // Remove local wishlist state since we're using context
  const [activeTab, setActiveTab] = useState('description')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)

  // Get user info
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  // Remove the old wishlist status check effect since we're using context now

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE}/product/${productId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.product)
        
        if (data.product.colors && data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0])
        }
        if (data.product.sizes && data.product.sizes.length > 0) {
          setSelectedSize(data.product.sizes[0])
        }

        fetchRelatedProducts(data.product.id)
      } else {
        throw new Error(data.message || 'Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (productId) => {
    try {
      const response = await fetch(`${API_BASE}/product/${productId}/recommendations`)
      const data = await response.json()
      
      if (data.success) {
        setRelatedProducts(data.recommendations)
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  // Remove old checkWishlistStatus function since we're using context

  // Updated handleAddToCart function to match CartContext signature
  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsAddingToCart(true)

    try {
      // Call addToCart with the correct signature: (product, quantity)
      // This matches exactly how the CartContext expects it
      const success = await addToCartContext(product, quantity)
      
      if (success) {
        toast.success(`${product.name} added to cart!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        
        // Cart context handles the state update automatically
        // No need to manually reload cart since it uses optimistic updates
      } else {
        toast.error('Failed to add product to cart. Please try again.', {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add product to cart. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Updated handleWishlistToggle function to use WishlistContext
  const handleWishlistToggle = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsAddingToWishlist(true)

    try {
      // Use the wishlist context function
      await toggleWishlist(product)
      
      const isNowInWishlist = checkIsInWishlist(product.id)
      
      toast.success(
        isNowInWishlist 
          ? `${product.name} added to wishlist!` 
          : `${product.name} removed from wishlist!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      )
      
      // Trigger a custom event to notify other components about wishlist update
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { productId: product.id, isInWishlist: isNowInWishlist }
      }))
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error('Failed to update wishlist. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Product URL copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  const incrementQuantity = () => {
    if (product.stock_quantity && quantity >= product.stock_quantity) return
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const getImageSrc = (imageSrc) => {
    if (!imageSrc) return '/placeholder-product.jpg'
    
    if (imageSrc.startsWith('http')) {
      return imageSrc
    }
    
   if (imageSrc.startsWith('/images/')) {
  return `${API_URL}${imageSrc}`;
}

if (!imageSrc.includes('/')) {
  return `${API_URL}/images/${imageSrc}`;
}
    
    return imageSrc
  }

  // Generate high-res version of image for zoom
  const getHighResSrc = (imageSrc) => {
    const normalSrc = getImageSrc(imageSrc)
    
    // If it's an external URL, try to get a higher resolution version
    if (normalSrc.includes('unsplash.com')) {
      return normalSrc.replace(/w=\d+/, 'w=1200').replace(/h=\d+/, 'h=1200')
    }
    
    // For local images, you could have a high-res folder or naming convention
    // For now, just return the same image
    return normalSrc
  }

  const getProductImages = () => {
    const images = []
    
    if (product.image) {
      images.push(product.image)
    }
    
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && img !== product.image) {
          images.push(img)
        }
      })
    }
    
    return images.length > 0 ? images : ['/placeholder-product.jpg']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
            <Link 
              href="/shop"
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Back to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const productImages = getProductImages()
  const discountPercentage = product.old_price > product.new_price 
    ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100)
    : 0

  // Get wishlist status from context
  const isInWishlist = checkIsInWishlist(product.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-pink-600">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-pink-600">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Images with Enhanced Layout */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex gap-4">
                {/* Left Thumbnail Column - Only show if more than 1 image */}
                {productImages.length > 1 && (
                  <div className="flex flex-col gap-3 w-28">
                    {productImages.slice(0, 3).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-[150px] rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                          selectedImageIndex === index 
                            ? 'border-pink-500 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={getImageSrc(image)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover select-none"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg'
                          }}
                        />
                        
                        {/* Active indicator */}
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 bg-pink-500/10 border-2 border-pink-500 rounded-lg"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image Container */}
                <div className="flex-1">
                  <div className="relative h-[450px] shadow-xl rounded-xl overflow-hidden bg-gray-50">
                    <ProductImageZoom
                      src={getImageSrc(productImages[selectedImageIndex])}
                      highResSrc={getHighResSrc(productImages[selectedImageIndex])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onImageLoad={() => console.log('Image loaded')}
                      onImageError={(e) => {
                        e.target.src = '/placeholder-product.jpg'
                      }}
                    />
                    
                    {/* Overlays */}
                    {discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-20">
                        -{discountPercentage}%
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-20">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Mobile thumbnail strip - Only show on mobile if more than 1 image */}
                  {productImages.length > 1 && (
                    <div className="flex md:hidden mt-4 space-x-3 overflow-x-auto pb-2">
                      {productImages.slice(0, 3).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === index 
                              ? 'border-pink-500' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={getImageSrc(image)}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover select-none"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-500">{product.brand}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">(4.8) • 24 reviews</span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-pink-600">
                    ${product.new_price}
                  </span>
                  {product.old_price > product.new_price && (
                    <span className="text-xl text-gray-500 line-through">
                      ${product.old_price}
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                      Save {discountPercentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-gray-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Color: {selectedColor}</h3>
                  <div className="flex space-x-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedColor === color
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Size: {selectedSize}</h3>
                  <div className="flex space-x-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedSize === size
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={product.stock_quantity && quantity >= product.stock_quantity}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {product.stock_quantity && (
                    <span className="text-sm text-gray-600">
                      {product.stock_quantity} available
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {product.stock_quantity > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stock_quantity === 0}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleWishlistToggle}
                    disabled={isAddingToWishlist}
                    className={`p-3 border rounded-lg transition-colors ${
                      isInWishlist
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-gray-300 hover:border-pink-500 hover:text-pink-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-gray-600">30-day returns</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-gray-600">SSL protected</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-12"
          >
            {/* Tab Navigation */}
            <div className="border-b mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'specifications', label: 'Specifications' },
                  { id: 'reviews', label: 'Reviews (24)' },
                  { id: 'shipping', label: 'Shipping & Returns' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'description' && (
                <div>
                  {product.description ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">No description available for this product.</p>
                  )}
                  
                  {product.features && product.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-700">{spec.key}</span>
                          <span className="text-gray-600">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Brand</span>
                        <span className="text-gray-600">{product.brand || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Category</span>
                        <span className="text-gray-600">{product.category}</span>
                      </div>
                      {product.weight > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Weight</span>
                          <span className="text-gray-600">{product.weight} kg</span>
                        </div>
                      )}
                      {product.materials && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Materials</span>
                          <span className="text-gray-600">{product.materials}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-8">
                  <p className="text-gray-600">Customer reviews coming soon...</p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Free standard shipping on orders over $50</li>
                      <li>• Express shipping available for $9.99</li>
                      <li>• Orders typically ship within 1-2 business days</li>
                      <li>• Delivery time: 3-7 business days</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Returns & Exchanges</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• 30-day return policy</li>
                      <li>• Items must be in original condition</li>
                      <li>• Free return shipping for defective items</li>
                      <li>• Exchanges available for different sizes/colors</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <ProductCard product={relatedProduct} />
                  </motion.div>
                ))}
              </div>
              
              {relatedProducts.length > 4 && (
                <div className="text-center mt-8">
                  <Link
                    href={`/shop?category=${encodeURIComponent(product.category)}`}
                    className="inline-flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <span>View More in {product.category}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Recently Viewed Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            {/* Product Analytics/Views */}
            {product.views && (
              <div className="bg-gray-100 rounded-lg p-4 mb-8">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{product.views} views</span>
                  </div>
                  {product.sales_count && (
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>{product.sales_count} sold</span>
                    </div>
                  )}
                  {product.featured && (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Featured Product</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}