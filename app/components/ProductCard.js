// components/ProductCard.js
'use client'
import { useState, useEffect } from 'react'
import { Heart, ShoppingBag, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

// Image utility function (you can move this to utils/imageUtils.js if preferred)
const getImageSrc = (imageSrc, fallback = '/placeholder-product.jpg') => {
  if (!imageSrc) return fallback
  
  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
    return imageSrc
  }
  
  if (imageSrc.startsWith('/images/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${imageSrc}`
  }
  
  if (!imageSrc.includes('/') && (imageSrc.includes('.jpg') || imageSrc.includes('.png') || imageSrc.includes('.jpeg') || imageSrc.includes('.webp'))) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/images/${imageSrc}`
  }
  
  if (imageSrc.startsWith('images/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/${imageSrc}`
  }
  
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/${imageSrc}`
}

const ProductCard = ({ product }) => {
  const [loading, setLoading] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { addToCart, isInCart, getItemQuantity } = useCart()

  if (!product) return null

  // Set up image source
  useEffect(() => {
    const mainImage = product.image || (product.images && product.images[0]) || null
    setImageSrc(getImageSrc(mainImage))
    setImageError(false)
  }, [product])

  // Calculate discount percentage
  const discountPercentage = product.old_price && product.new_price 
    ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100)
    : 0

  // Generate product URL
  const productUrl = `/product/${product.id}`
  const isLiked = isInWishlist(product.id)

  const handleWishlistClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setLoading(true)
    try {
      await toggleWishlist(product)
    } catch (error) {
      console.error('Error updating wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.available || (product.stock_quantity !== undefined && product.stock_quantity <= 0)) {
      return
    }

    setAddingToCart(true)
    try {
      const success = await addToCart(product)
      if (success) {
        console.log(`Added ${product.name} to cart`)
        setTimeout(() => {
          setAddingToCart(false)
        }, 500)
      } else {
        setAddingToCart(false)
        console.error('Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setAddingToCart(false)
    }
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(productUrl, '_blank')
  }

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true)
      setImageSrc('/placeholder-product.jpg')
    }
  }

  const itemQuantity = getItemQuantity ? getItemQuantity(product.id) : 0
  const inCart = isInCart ? isInCart(product.id) : false

  return (
    <div 
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-pink-200 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-t-3xl">
        <Link href={productUrl}>
          <div className="aspect-[4/5] relative cursor-pointer">
            {imageSrc && !imageError ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingBag className="w-12 h-12 text-pink-300 mx-auto mb-2" />
                  <span className="text-pink-400 text-sm font-medium">No Image</span>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {discountPercentage > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              <span className="drop-shadow-sm">-{discountPercentage}%</span>
            </div>
          )}
          {product.featured && (
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span className="drop-shadow-sm">Featured</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`absolute top-4 right-4 z-10 space-y-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={handleWishlistClick}
            disabled={loading}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
              isLiked 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg ring-2 ring-white/50' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-pink-600 shadow-md hover:shadow-lg'
            } ${loading ? 'cursor-not-allowed opacity-70' : 'hover:scale-110 active:scale-95'}`}
            title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={`w-5 h-5 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : 'hover:scale-110'}`} />
            )}
          </button>

          <button
            onClick={handleQuickView}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm bg-white/90 text-gray-600 hover:bg-white hover:text-pink-600 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
            title="Quick view"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Status Badge */}
        {product.stock_quantity !== undefined && product.stock_quantity <= (product.low_stock_threshold || 10) && product.stock_quantity > 0 && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Only {product.stock_quantity} left!
              </span>
            </div>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.stock_quantity !== undefined && product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-800 shadow-lg">
              Out of Stock
            </div>
          </div>
        )}

        {/* Cart Indicator */}
        {inCart && itemQuantity > 0 && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg ring-2 ring-white/50">
              <ShoppingBag className="w-3.5 h-3.5 fill-current" />
              <span>{itemQuantity}</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {product.category && (
          <div className="mb-2">
            <Link 
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent text-xs font-bold uppercase tracking-wider hover:from-pink-600 hover:to-rose-600 transition-all duration-200"
            >
              {product.category}
            </Link>
          </div>
        )}

        <Link href={productUrl}>
          <h3 className="font-bold text-gray-800 hover:text-pink-600 transition-colors duration-200 line-clamp-2 mb-2 min-h-[2.5rem] text-base leading-snug cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {product.brand && false && (
          <div className="mb-2">
            <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
              {product.brand}
            </span>
          </div>
        )}

        {false && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className="w-3 h-3 fill-yellow-400 text-yellow-400" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">(4.8)</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            ${typeof product.new_price === 'number' ? product.new_price.toFixed(2) : product.new_price}
          </span>
          {product.old_price && product.old_price !== product.new_price && (
            <span className="text-sm text-gray-500 line-through">
              ${typeof product.old_price === 'number' ? product.old_price.toFixed(2) : product.old_price}
            </span>
          )}
        </div>

        {product.colors && product.colors.length > 0 && false && (
          <div className="flex items-center space-x-1 mb-3">
            <span className="text-xs text-gray-500">Colors:</span>
            <div className="flex space-x-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {product.stock_quantity !== undefined && false && (
          <div className="mb-3">
            {product.stock_quantity > 0 ? (
              <span className={`text-xs font-medium flex items-center gap-1 ${
                product.stock_quantity <= (product.low_stock_threshold || 10) 
                  ? 'text-orange-600' 
                  : 'text-green-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  product.stock_quantity <= (product.low_stock_threshold || 10) 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                }`}></div>
                {product.stock_quantity <= (product.low_stock_threshold || 10) 
                  ? `Only ${product.stock_quantity} left!` 
                  : 'In Stock'
                }
              </span>
            ) : (
              <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Out of Stock
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!product.available || (product.stock_quantity !== undefined && product.stock_quantity <= 0) || addingToCart}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md text-sm ${
            product.available && (product.stock_quantity === undefined || product.stock_quantity > 0) && !addingToCart
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:transform hover:scale-[1.02]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
        >
          {addingToCart ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : !product.available ? (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Unavailable</span>
            </>
          ) : (product.stock_quantity !== undefined && product.stock_quantity <= 0) ? (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Sold Out</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <Link 
          href={productUrl}
          className="block w-full text-center mt-2 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors duration-200"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default ProductCard