'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  MessageCircle, 
  Share2, 
  Search, 
  Tag,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Filter
} from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

// Sample blog data - replace with your actual data source
const samplePosts = [
  {
    id: 1,
    title: "The Ultimate Guide to Pink Home Decor: Transform Your Space",
    excerpt: "Discover how to incorporate beautiful pink tones into your home decor to create a warm, inviting, and stylish living space that reflects your personality.",
    content: "Pink isn't just for little girls' rooms anymore. This versatile color has made a major comeback in interior design...",
    image: "/assets/blog1.jpeg",
    author: {
      name: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      bio: "Interior Design Specialist"
    },
    publishedAt: "2024-06-28",
    readTime: 8,
    category: "Home & Decor",
    tags: ["interior design", "pink decor", "home styling", "color theory"],
    likes: 234,
    comments: 45,
    featured: true,
    trending: true
  },
  {
    id: 2,
    title: "Self-Care Sunday: Creating Your Perfect Pink Sanctuary",
    excerpt: "Learn how to create a peaceful, pink-themed self-care routine that will help you unwind and recharge for the week ahead.",
    content: "In our fast-paced world, taking time for self-care has become more important than ever...",
    image: "/assets/blog2.jpeg",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      bio: "Wellness Coach & Blogger"
    },
    publishedAt: "2024-06-25",
    readTime: 6,
    category: "Lifestyle",
    tags: ["self-care", "wellness", "meditation", "lifestyle"],
    likes: 189,
    comments: 32,
    featured: false,
    trending: true
  },
  {
    id: 3,
    title: "Fashion Forward: How to Style Pink for Every Season",
    excerpt: "From soft pastels to bold magentas, discover how to incorporate pink into your wardrobe throughout the year with confidence and style.",
    content: "Pink is having a major moment in fashion, and it's not going anywhere anytime soon...",
    image: "/assets/blog3.jpeg",
    author: {
      name: "Isabella Parker",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      bio: "Fashion Stylist"
    },
    publishedAt: "2024-06-22",
    readTime: 5,
    category: "Fashion",
    tags: ["fashion", "styling", "pink fashion", "seasonal style"],
    likes: 156,
    comments: 28,
    featured: true,
    trending: false
  },
  {
    id: 4,
    title: "DIY Pink Clay Face Masks: Natural Beauty at Home",
    excerpt: "Create spa-quality face masks at home using pink clay and natural ingredients for glowing, healthy skin.",
    content: "Pink clay, also known as rose clay, is one of the gentlest clays for skincare...",
    image: "/assets/blog3.jpeg",
    author: {
      name: "Dr. Maya Patel",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      bio: "Dermatologist & Natural Beauty Expert"
    },
    publishedAt: "2024-06-20",
    readTime: 7,
    category: "Beauty",
    tags: ["skincare", "DIY beauty", "natural beauty", "face masks"],
    likes: 298,
    comments: 67,
    featured: false,
    trending: true
  },
  {
    id: 5,
    title: "The Psychology of Pink: How Color Affects Your Mood",
    excerpt: "Explore the fascinating science behind how the color pink influences our emotions, behavior, and overall well-being.",
    content: "Color psychology has long been a subject of fascination for researchers and designers alike...",
    image: "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=800&h=400&fit=crop",
    author: {
      name: "Dr. Alexander Kim",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      bio: "Color Psychology Researcher"
    },
    publishedAt: "2024-06-18",
    readTime: 9,
    category: "Psychology",
    tags: ["psychology", "color theory", "mood", "wellbeing"],
    likes: 187,
    comments: 41,
    featured: false,
    trending: false
  },
  {
    id: 6,
    title: "Pink Smoothie Bowls: Healthy & Instagram-Worthy Recipes",
    excerpt: "Whip up these gorgeous pink smoothie bowls that are as nutritious as they are photogenic. Perfect for a healthy breakfast or snack.",
    content: "Smoothie bowls have taken the health food world by storm, and pink varieties are especially popular...",
    image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&h=400&fit=crop",
    author: {
      name: "Chef Maria Santos",
      avatar: "https://images.unsplash.com/photo-1485893226505-9652ac31de53?w=100&h=100&fit=crop&crop=face",
      bio: "Nutritionist & Recipe Developer"
    },
    publishedAt: "2024-06-15",
    readTime: 4,
    category: "Food & Health",
    tags: ["healthy recipes", "smoothie bowls", "nutrition", "breakfast"],
    likes: 145,
    comments: 23,
    featured: false,
    trending: false
  }
];

const categories = [
  { id: 'all', name: 'All Posts', count: 6 },
  { id: 'Home & Decor', name: 'Home & Decor', count: 1 },
  { id: 'Lifestyle', name: 'Lifestyle', count: 1 },
  { id: 'Fashion', name: 'Fashion', count: 1 },
  { id: 'Beauty', name: 'Beauty', count: 1 },
  { id: 'Psychology', name: 'Psychology', count: 1 },
  { id: 'Food & Health', name: 'Food & Health', count: 1 }
];

const Blog = () => {
  const [posts, setPosts] = useState(samplePosts);
  const [filteredPosts, setFilteredPosts] = useState(samplePosts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter posts based on category and search
  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [posts, selectedCategory, searchTerm]);

  const toggleLike = (postId) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    
    // Update the post likes count
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: likedPosts.includes(postId) ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BlogCard = ({ post, featured = false }) => (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 ${
        featured ? 'col-span-1 md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            featured ? 'h-64 md:h-80' : 'h-48'
          }`}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {post.featured && (
            <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
          {post.trending && (
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
        </div>

        {/* Category */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
            {post.category}
          </span>
        </div>
      </div>

      <div className={`p-6 ${featured ? 'md:p-8' : ''}`}>
        {/* Author & Meta */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{post.author.name}</span>
              <span>•</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">{post.author.bio}</p>
          </div>
        </div>

        {/* Title & Excerpt */}
        <h2 className={`font-bold text-gray-900 mb-3 line-clamp-2 ${
          featured ? 'text-2xl md:text-3xl' : 'text-xl'
        }`}>
          {post.title}
        </h2>
        <p className={`text-gray-600 mb-4 line-clamp-3 ${
          featured ? 'text-base' : 'text-sm'
        }`}>
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-pink-50 text-pink-700 px-2 py-1 rounded-lg text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 ${
                likedPosts.includes(post.id)
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={likedPosts.includes(post.id) ? 'currentColor' : 'none'}
              />
              <span className="text-sm font-medium">{post.likes}</span>
            </motion.button>

            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 transition-colors duration-200"
          >
            <span>Read More</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <Header/>
      <div className=" shadow-sm  bg-pink-500 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className=" text-5xl font-bold text-white mb-4">
              Our Blog
            </h1>
            <p className="text-lg text-gray-100 max-w-3xl mx-auto">
              Discover inspiration, tips, and stories about beauty, lifestyle, and everything pink. 
              Join our community of readers who love living life in full color.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4 space-y-6">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-pink-500" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex justify-between items-center ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm bg-white/80 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['pink decor', 'self-care', 'fashion', 'DIY beauty', 'wellness', 'lifestyle', 'home styling'].map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-pink-50 text-pink-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors duration-200"
                    >
                      #{tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the latest blog posts delivered to your inbox
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors duration-200"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Info */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'All Posts' : selectedCategory}
                </h2>
                <span className="text-gray-600">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </motion.div>

            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <div className="mb-12">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5 text-pink-500" />
                  Featured Posts
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AnimatePresence>
                    {featuredPosts.map((post) => (
                      <BlogCard key={post.id} post={post} featured={true} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <div>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold text-gray-900 mb-6"
                >
                  Latest Posts
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AnimatePresence>
                    {regularPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-gray-400 mb-4">
                  <Search className="w-20 h-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No posts found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or browse different categories
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="bg-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors duration-200"
                >
                  View All Posts
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
        <Footer />
    </div>
  );
};

export default Blog;