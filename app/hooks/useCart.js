// hooks/useCart.js
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL;


export const useCart = () => {
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Dispatch cart update event
  const dispatchCartUpdate = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }, [])

  // Load cart from sessionStorage (for guest users)
  const loadSessionCart = useCallback(() => {
    if (typeof window === 'undefined') return []
    
    try {
      const sessionCart = JSON.parse(sessionStorage.getItem('guestCart') || '[]')
      return sessionCart
    } catch (error) {
      console.error('Error loading session cart:', error)
      return []
    }
  }, [])

  // Save cart to sessionStorage (for guest users)
  const saveSessionCart = useCallback((cartData) => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem('guestCart', JSON.stringify(cartData))
    } catch (error) {
      console.error('Error saving session cart:', error)
    }
  }, [])

  // Clear session cart
  const clearSessionCart = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.removeItem('guestCart')
    } catch (error) {
      console.error('Error clearing session cart:', error)
    }
  }, [])

  // Load cart from backend (for logged-in users)
  const loadBackendCart = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}`)
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend cart endpoints not available')
      }
      
      const data = await response.json()

      if (data.success) {
        return data.cart || []
      } else {
        throw new Error(data.message || 'Failed to load cart from backend')
      }
    } catch (error) {
      console.error('Error loading backend cart:', error)
      throw error
    }
  }, [])

  // Load cart (from backend for logged-in users, sessionStorage for guests)
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (user) {
        // Logged-in user: load from backend
        try {
          const backendCart = await loadBackendCart(user.id)
          setCart(backendCart)
          dispatchCartUpdate()
        } catch (backendError) {
          console.warn('Backend cart not available:', backendError.message)
          setError('Cart service unavailable')
          setCart([])
        }
      } else {
        // Guest user: load from sessionStorage
        const sessionCart = loadSessionCart()
        setCart(sessionCart)
        dispatchCartUpdate()
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading cart:', error)
      setError(error.message)
      setCart([])
      setIsLoading(false)
    }
  }, [user, loadBackendCart, loadSessionCart, dispatchCartUpdate])

  // Sync session cart to backend when user logs in
  const syncSessionCartToBackend = useCallback(async () => {
    if (!user || typeof window === 'undefined') return
    
    try {
      const sessionCart = loadSessionCart()
      if (sessionCart.length === 0) return

      console.log('Syncing session cart to backend:', sessionCart)

      const response = await fetch(`${API_BASE}/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          localCartItems: sessionCart
        })
      })

      const data = await response.json()
      if (data.success) {
        console.log('Session cart synced successfully')
        // Clear session cart after successful sync
        clearSessionCart()
        // Reload cart from backend
        await loadCart()
      } else {
        console.warn('Failed to sync session cart:', data.message)
      }
    } catch (error) {
      console.warn('Error syncing session cart to backend:', error)
    }
  }, [user, loadSessionCart, clearSessionCart, loadCart])

  // Add item to cart
  const addToCart = useCallback(async (product, quantity = 1) => {
    try {
      // Optimistic update
      const existingItemIndex = cart.findIndex(item => item.id === product.id)
      let newCart
      
      if (existingItemIndex > -1) {
        newCart = cart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.new_price,
          quantity: quantity,
          image: product.image,
          category: product.category,
          available: product.available,
          stock_quantity: product.stock_quantity
        }
        newCart = [...cart, cartItem]
      }
      
      setCart(newCart)
      dispatchCartUpdate()

      if (user) {
        // Logged-in user: send to backend
        try {
          const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              productId: product.id,
              quantity: quantity
            })
          })

          const data = await response.json()
          if (!data.success) {
            console.warn('Backend add failed:', data.message)
            setError('Failed to add item to cart')
            // Revert optimistic update
            setCart(cart)
          }
        } catch (backendError) {
          console.warn('Backend not available for add operation:', backendError.message)
          setError('Cart service unavailable')
          // Revert optimistic update
          setCart(cart)
        }
      } else {
        // Guest user: save to sessionStorage
        saveSessionCart(newCart)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setError(error.message)
    }
  }, [cart, user, dispatchCartUpdate, saveSessionCart])

  // Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    try {
      // Optimistic update
      const newCart = cart.filter(item => item.id !== productId)
      setCart(newCart)
      dispatchCartUpdate()

      if (user) {
        // Logged-in user: send to backend
        try {
          const response = await fetch(`${API_BASE}/cart/remove`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              productId: productId
            })
          })

          const data = await response.json()
          if (!data.success) {
            console.warn('Backend remove failed:', data.message)
            setError('Failed to remove item from cart')
            // Revert optimistic update
            setCart(cart)
          }
        } catch (backendError) {
          console.warn('Backend not available for remove operation:', backendError.message)
          setError('Cart service unavailable')
          // Revert optimistic update
          setCart(cart)
        }
      } else {
        // Guest user: save to sessionStorage
        saveSessionCart(newCart)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      setError(error.message)
    }
  }, [cart, user, dispatchCartUpdate, saveSessionCart])

  // Update item quantity
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    try {
      // Optimistic update
      const newCart = cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: quantity }
          : item
      )
      setCart(newCart)
      dispatchCartUpdate()

      if (user) {
        // Logged-in user: send to backend
        try {
          const response = await fetch(`${API_BASE}/cart/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              productId: productId,
              quantity: quantity
            })
          })

          const data = await response.json()
          if (!data.success) {
            console.warn('Backend update failed:', data.message)
            setError('Failed to update cart')
            // Revert optimistic update
            setCart(cart)
          }
        } catch (backendError) {
          console.warn('Backend not available for update operation:', backendError.message)
          setError('Cart service unavailable')
          // Revert optimistic update
          setCart(cart)
        }
      } else {
        // Guest user: save to sessionStorage
        saveSessionCart(newCart)
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      setError(error.message)
    }
  }, [cart, user, removeFromCart, dispatchCartUpdate, saveSessionCart])

  // Increase quantity
  const increaseQuantity = useCallback(async (productId) => {
    const item = cart.find(item => item.id === productId)
    if (item) {
      await updateQuantity(productId, item.quantity + 1)
    }
  }, [cart, updateQuantity])

  // Decrease quantity
  const decreaseQuantity = useCallback(async (productId) => {
    const item = cart.find(item => item.id === productId)
    if (item && item.quantity > 1) {
      await updateQuantity(productId, item.quantity - 1)
    } else if (item && item.quantity === 1) {
      await removeFromCart(productId)
    }
  }, [cart, updateQuantity, removeFromCart])

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      // Optimistic update
      setCart([])
      dispatchCartUpdate()

      if (user) {
        // Logged-in user: send to backend
        try {
          const response = await fetch(`${API_BASE}/cart/clear/${user.id}`, {
            method: 'DELETE'
          })

          const data = await response.json()
          if (!data.success) {
            console.warn('Backend clear failed:', data.message)
            setError('Failed to clear cart')
          }
        } catch (backendError) {
          console.warn('Backend not available for clear operation:', backendError.message)
          setError('Cart service unavailable')
        }
      } else {
        // Guest user: clear sessionStorage
        clearSessionCart()
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      setError(error.message)
    }
  }, [user, dispatchCartUpdate, clearSessionCart])

  // Check if item is in cart
  const isInCart = useCallback((productId) => {
    return cart.some(item => item.id === productId)
  }, [cart])

  // Get item quantity
  const getItemQuantity = useCallback((productId) => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }, [cart])

  // Get total items count
  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  // Get total price
  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cart])

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Sync session cart when user logs in
  useEffect(() => {
    if (user) {
      syncSessionCartToBackend()
    }
  }, [user, syncSessionCartToBackend])

  return {
    cart,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getTotalItems,
    getTotalPrice,
    loadCart
  }
}