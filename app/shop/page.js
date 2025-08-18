'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { Filter, Search, Grid, List, ChevronDown, Loader2, AlertCircle } from 'lucide-react'

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL;


// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function Shop() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Product states
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  
  // UI states
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  const [totalProducts, setTotalProducts] = useState(0)
  const [hasMoreProducts, setHasMoreProducts] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Debounce search term with longer delay
  const debouncedSearchTerm = useDebounce(searchTerm, 800)

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'new_price-asc', label: 'Price: Low to High' },
    { value: 'new_price-desc', label: 'Price: High to Low' }
  ]

  // Handle URL parameters on component mount and when searchParams change
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const searchFromUrl = searchParams.get('search')
    const sortFromUrl = searchParams.get('sort')
    const minPriceFromUrl = searchParams.get('minPrice')
    const maxPriceFromUrl = searchParams.get('maxPrice')

    // Set category from URL
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl))
    }

    // Set search term from URL
    if (searchFromUrl && searchFromUrl !== searchTerm) {
      setSearchTerm(decodeURIComponent(searchFromUrl))
    }

    // Set sort from URL
    if (sortFromUrl) {
      const [field, order] = sortFromUrl.split('-')
      if (field && order) {
        setSortBy(field)
        setSortOrder(order)
      }
    }

    // Set price range from URL
    if (minPriceFromUrl) {
      const minPrice = parseInt(minPriceFromUrl)
      if (!isNaN(minPrice)) {
        setMinPrice(minPrice)
      }
    }

    if (maxPriceFromUrl) {
      const maxPrice = parseInt(maxPriceFromUrl)
      if (!isNaN(maxPrice)) {
        setMaxPrice(maxPrice)
      }
    }
  }, [searchParams])

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Update URL when filters change
  const updateURL = useCallback((updates = {}) => {
    const params = new URLSearchParams()
    
    const category = updates.category !== undefined ? updates.category : selectedCategory
    const search = updates.search !== undefined ? updates.search : searchTerm
    const sort = updates.sort !== undefined ? updates.sort : `${sortBy}-${sortOrder}`
    const minPriceValue = updates.minPrice !== undefined ? updates.minPrice : minPrice
    const maxPriceValue = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice

    // Only add parameters that are not default values
    if (category && category !== 'All') {
      params.set('category', encodeURIComponent(category))
    }
    
    if (search && search.trim()) {
      params.set('search', encodeURIComponent(search.trim()))
    }
    
    if (sort && sort !== 'date-desc') {
      params.set('sort', sort)
    }
    
    if (minPriceValue > priceRange.min) {
      params.set('minPrice', minPriceValue.toString())
    }
    
    if (maxPriceValue < priceRange.max) {
      params.set('maxPrice', maxPriceValue.toString())
    }

    // Update URL without triggering a page reload
    const newUrl = params.toString() ? `/shop?${params.toString()}` : '/shop'
    router.replace(newUrl)
  }, [selectedCategory, searchTerm, sortBy, sortOrder, minPrice, maxPrice, priceRange, router])

  // Fetch products when filters change
  useEffect(() => {
    if (categories.length > 1) { // Only fetch if categories are loaded
      resetAndFetchProducts()
      updateURL()
    }
  }, [selectedCategory, sortBy, sortOrder, minPrice, maxPrice])

  // Separate effect for search term
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return // Still debouncing
    if (categories.length > 1) { // Only fetch if categories are loaded
      resetAndFetchProducts()
      updateURL({ search: debouncedSearchTerm })
    }
  }, [debouncedSearchTerm])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch categories
      const categoriesResponse = await fetch(`${API_BASE}/categories`)
      const categoriesData = await categoriesResponse.json()
      
      if (categoriesData.success) {
        // Filter out 'women' category and ensure proper order
        let filteredCategories = categoriesData.categories.filter(cat => 
          cat.toLowerCase() !== 'women'
        )
        
        // Ensure 'All' is first
        const allIndex = filteredCategories.indexOf('All')
        if (allIndex > 0) {
          filteredCategories.splice(allIndex, 1)
          filteredCategories.unshift('All')
        } else if (allIndex === -1) {
          filteredCategories.unshift('All')
        }
        
        setCategories(filteredCategories)
        
        // Check if there's a category from URL and if it exists in available categories
        const categoryFromUrl = searchParams.get('category')
        if (categoryFromUrl) {
          const decodedCategory = decodeURIComponent(categoryFromUrl)
          if (filteredCategories.includes(decodedCategory)) {
            setSelectedCategory(decodedCategory)
          } else {
            // If category from URL doesn't exist, redirect to shop without category
            router.replace('/shop')
            setSelectedCategory('All')
          }
        }
      }

      // Get price range for filters
      const filtersResponse = await fetch(`${API_BASE}/product-filters`)
      const filtersData = await filtersResponse.json()
      
      if (filtersData.success && filtersData.filters.priceRange) {
        const { minPrice: min, maxPrice: max } = filtersData.filters.priceRange
        const roundedMin = Math.floor(min)
        const roundedMax = Math.ceil(max)
        setPriceRange({ min: roundedMin, max: roundedMax })
        
        // Only set default prices if not set from URL
        const minPriceFromUrl = searchParams.get('minPrice')
        const maxPriceFromUrl = searchParams.get('maxPrice')
        
        if (!minPriceFromUrl) {
          setMinPrice(roundedMin)
        }
        if (!maxPriceFromUrl) {
          setMaxPrice(roundedMax)
        }
      }

      // Initial products fetch will be triggered by useEffect when categories are set
      
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to load initial data')
      setLoading(false)
    }
  }

  const fetchProducts = async (page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      })

      // Add optional parameters
      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim())
      }
      
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory)
      }
      
      if (minPrice > priceRange.min) {
        params.append('minPrice', minPrice.toString())
      }
      
      if (maxPrice < priceRange.max) {
        params.append('maxPrice', maxPrice.toString())
      }

      const response = await fetch(`${API_BASE}/allproducts?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        if (isLoadMore) {
          // Append new products for load more
          setAllProducts(prev => [...prev, ...data.products])
        } else {
          // Replace products for new search/filter
          setAllProducts(data.products)
        }
        
        setTotalProducts(data.pagination?.totalProducts || 0)
        setHasMoreProducts(data.pagination?.hasNextPage || false)
        setCurrentPage(page)
      } else {
        throw new Error(data.message || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError(`Failed to load products: ${error.message}`)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const resetAndFetchProducts = useCallback(() => {
    setCurrentPage(1)
    setAllProducts([])
    setHasMoreProducts(false)
    fetchProducts(1, false)
  }, [selectedCategory, sortBy, sortOrder, minPrice, maxPrice, debouncedSearchTerm])

  const handleCategoryFilter = (category) => {
    if (category !== selectedCategory) {
      setSelectedCategory(category)
    }
  }

  const handleSort = (sortValue) => {
    const [field, order] = sortValue.split('-')
    setSortBy(field)
    setSortOrder(order)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value)
    setMinPrice(value)
    if (value > maxPrice) {
      setMaxPrice(value)
    }
  }

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value)
    setMaxPrice(value)
    if (value < minPrice) {
      setMinPrice(value)
    }
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    fetchProducts(nextPage, true)
  }

  const clearAllFilters = () => {
    setSelectedCategory('All')
    setSearchTerm('')
    setMinPrice(priceRange.min)
    setMaxPrice(priceRange.max)
    setSortBy('date')
    setSortOrder('desc')
    setCurrentPage(1)
    setAllProducts([])
    setHasMoreProducts(false)
    
    // Clear URL parameters
    router.replace('/shop')
    
    // Fetch products with cleared filters
    setTimeout(() => {
      fetchProducts(1, false)
    }, 100)
  }

  // Get category display name for hero section
  const getCategoryDisplayName = () => {
    if (selectedCategory === 'All') {
      return 'Our Collection'
    }
    return selectedCategory
  }

  // Loading state
  if (loading && allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error && allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchInitialData}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{getCategoryDisplayName()}</h1>
            <p className="text-xl text-pink-100">
              {selectedCategory === 'All' 
                ? `Discover your perfect style from our curated selection of ${totalProducts} products`
                : `Explore our ${selectedCategory.toLowerCase()} collection - ${totalProducts} products available`
              }
            </p>
            {selectedCategory !== 'All' && (
              <motion.button
                onClick={() => handleCategoryFilter('All')}
                className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                ← View All Products
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Shop Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <motion.div 
              className={`lg:w-1/4 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Clear Filters Button */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-pink-100 text-pink-700 font-semibold'
                          : 'hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Min Price: ${minPrice}
                    </label>
                    <input 
                      type="range" 
                      min={priceRange.min} 
                      max={priceRange.max} 
                      step="1"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Price: ${maxPrice}
                    </label>
                    <input 
                      type="range" 
                      min={priceRange.min} 
                      max={priceRange.max} 
                      step="1"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    ${minPrice} - ${maxPrice}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Controls */}
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden bg-white border border-pink-600 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors flex items-center space-x-2"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filters</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select 
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => handleSort(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Showing {allProducts.length} of {totalProducts} products
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  {searchTerm && searchTerm !== debouncedSearchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                    </div>
                  )}
                  {searchTerm && searchTerm === debouncedSearchTerm && searchTerm.length > 0 && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Products Grid */}
              {allProducts.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {allProducts.map((product, index) => (
                      <motion.div
                        key={`${product.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: (index % 9) * 0.1 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMoreProducts && (
                    <motion.div
                      className="text-center mt-12"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <span>Load More Products</span>
                        )}
                      </button>
                      <p className="text-gray-500 text-sm mt-2">
                        {allProducts.length} of {totalProducts} products shown
                      </p>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-gray-500 text-lg mb-4">
                    {selectedCategory !== 'All' 
                      ? `No products found in ${selectedCategory} category.`
                      : 'No products found matching your criteria.'
                    }
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}