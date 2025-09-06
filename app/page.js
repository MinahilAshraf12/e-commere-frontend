'use client'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ProductCard from './components/ProductCard'
import { ShoppingBag, Star, Users, Award, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Newsletter from './components/Newsletter'

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Counter component for animated numbers
function Counter({ value, duration = 3.5, format = "number" }) {
  const ref = useRef(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { 
    duration: duration * 1000,
    bounce: 0.25,
    stiffness: 80,
    damping: 15
  })
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, isInView, value])

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        let displayValue = latest
        
        switch (format) {
          case "k":
            displayValue = `${(latest / 1000).toFixed(0)}K`
            break
          case "rating":
            displayValue = (latest / 10).toFixed(1)
            break
          case "number":
          default:
            displayValue = latest.toFixed(0)
            break
        }
        
        ref.current.textContent = displayValue
      }
    })
  }, [springValue, format])

  return <span ref={ref} />
}

export default function Home() {
  // State for dynamic data
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    categoryStats: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch featured products
      const featuredResponse = await fetch(`${API_BASE}/featured-products?limit=4`)
      const featuredData = await featuredResponse.json()
      
      // If no featured products, fetch recent products
      let productsToShow = []
      if (featuredData.success && featuredData.products.length > 0) {
        productsToShow = featuredData.products
      } else {
        // Fallback to recent products
        const allProductsResponse = await fetch(`${API_BASE}/allproducts?limit=4&sortBy=date&sortOrder=desc`)
        const allProductsData = await allProductsResponse.json()
        if (allProductsData.success) {
          productsToShow = allProductsData.products
        }
      }
      
      setFeaturedProducts(productsToShow)

      // Fetch categories for category section
      const categoriesResponse = await fetch(`${API_BASE}/categories`)
      const categoriesData = await categoriesResponse.json()
      if (categoriesData.success) {
        // Filter out 'All' and take first 3 categories
        const filteredCategories = categoriesData.categories
          .filter(cat => cat !== 'All')
          .slice(0, 3)
        setCategories(filteredCategories)
      }

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/dashboard/stats`)
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setStats(statsData.stats)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Dynamic stats based on real data
  const dynamicStats = [
    { 
      icon: Users, 
      label: 'Products Available', 
      value: `${stats.totalProducts || 0}+`, 
      numericValue: stats.totalProducts || 0, 
      format: 'number' 
    },
    { 
      icon: ShoppingBag, 
      label: 'Active Products', 
      value: `${stats.activeProducts || 0}+`, 
      numericValue: stats.activeProducts || 0, 
      format: 'number' 
    },
    { 
      icon: Star, 
      label: 'Featured Items', 
      value: `${stats.featuredProducts || 0}+`, 
      numericValue: stats.featuredProducts || 0, 
      format: 'number' 
    },
    { 
      icon: Award, 
      label: 'Categories', 
      value: `${stats.categoryStats?.length || 0}+`, 
      numericValue: stats.categoryStats?.length || 0, 
      format: 'number' 
    }
  ]

  // Category images mapping (you can replace these with actual images from your backend)
  const categoryImages = {
    'Dresses': '/assets/shop1.avif',
    'Tops': '/assets/shop2.jpeg', 
    'Accessories': '/assets/shop3.jpeg',
    'Bottoms': '/assets/shop2.jpeg',
    'Shoes': '/assets/shop2.jpeg',
    'Outerwear': '/assets/shop3.jpeg'
  }

  const testimonials = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Amazing quality and fast shipping! I love my new dress.',
      avatar: '/assets/test1.avif'
    },
    {
      name: 'Emma Davis',
      rating: 5,
      comment: 'The customer service is outstanding. Highly recommend!',
      avatar: '/assets/test2.jpeg'
    },
    {
      name: 'Lisa Chen',
      rating: 5,
      comment: 'Beautiful designs and perfect fit. Will shop again!',
      avatar: '/assets/test3.jpeg'
    }
  ]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  // Error state
  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
  //         <p className="text-gray-600 mb-4">{error}</p>
  //         <button 
  //           onClick={fetchAllData}
  //           className="btn-primary px-6 py-2"
  //         >
  //           Try Again
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen">
      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: white;
          font-weight: 600;
          border-radius: 9999px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
        }
        
        .btn-secondary {
          background: white;
          color: #ec4899;
          font-weight: 600;
          border-radius: 9999px;
          border: 2px solid #ec4899;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .btn-secondary:hover {
          background: #ec4899;
          color: white;
          transform: translateY(-2px);
        }
        
        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.div 
                  className="inline-flex items-center space-x-2 bg-pink-100 px-4 py-2 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-600 font-semibold text-sm">New Collection</span>
                </motion.div>
                
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Discover Your
                  <span className="gradient-text block">Perfect Style</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Elevate your wardrobe with our curated collection of premium fashion pieces. 
                  From elegant dresses to casual essentials, find everything you need to express your unique style.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop"> 
                <motion.button 
                  className="btn-primary text-lg px-8 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop Collection
                </motion.button>
                </Link>
                 
                <motion.button 
                  className="btn-secondary text-lg px-8 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Lookbook
                  
                </motion.button>
                
              </div>
              
              <div className="flex items-center space-x-8 pt-8">
                {dynamicStats.slice(0, 2).map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-2xl font-bold text-pink-600">
                      <Counter value={stat.numericValue} format={stat.format} />
                      {stat.value.includes('+') ? '+' : ''}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative z-10">
                <img 
                  src="/assets/hero-img.jpeg" 
                  alt="Fashion Model" 
                  className="rounded-2xl shadow-2xl"
                />
                <motion.div 
                  className="absolute -top-4 -left-4 w-32 h-32 bg-pink-200 rounded-full opacity-70"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-300 rounded-full opacity-60"
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0] 
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Discover our most popular items</p>
          </motion.div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No featured products available at the moment.</p>
            </div>
          )}
          
          <Link href="/shop"> 
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2">
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
          </Link>
        </div>
      </section>

      {/* Stats Section with Counter Animation */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {dynamicStats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  whileHover={{ scale: 1.1 }}
                >
                  <stat.icon className="w-12 h-12" />
                </motion.div>
                <div className="text-3xl font-bold mb-2">
                  <Counter value={stat.numericValue} duration={4} format={stat.format} />
                  {stat.value.includes('+') ? '+' : ''}
                </div>
                <div className="text-pink-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </motion.div>
          
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category, index) => {
                const categoryStats = stats.categoryStats?.find(cat => cat._id === category)
                const itemCount = categoryStats ? `${categoryStats.count}+ items` : 'View items'
                
                return (
                  <motion.div 
                    key={category}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link href={`/category/${encodeURIComponent(category)}`}>
                      <img 
                        src={categoryImages[category] || '/assets/shop1.avif'} 
                        alt={category}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{category}</h3>
                        <p className="text-pink-200">{itemCount}</p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Categories will be displayed here once products are added.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real reviews from real customers</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.name}
                className="card p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
     <Newsletter />
      
      <Footer />
    </div>
  )
}