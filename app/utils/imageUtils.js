// utils/imageUtils.js
// Create this file to handle all image URL scenarios from your admin panel

export const getImageSrc = (imageSrc, fallback = '/placeholder-product.jpg') => {
  // Return fallback if no image source
  if (!imageSrc) return fallback
  
  // If it's already a full URL (http or https), return as is
  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
    return imageSrc
  }
  
  // If it's a relative path starting with /images/, construct the full URL
  if (imageSrc.startsWith('/images/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${imageSrc}`
  }
  
  // If it's just a filename (like "product_1752850601329.png"), construct the full URL
  if (!imageSrc.includes('/') && (imageSrc.includes('.jpg') || imageSrc.includes('.png') || imageSrc.includes('.jpeg') || imageSrc.includes('.webp'))) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/images/${imageSrc}`
  }
  
  // If it starts with 'images/' (without leading slash), add the base URL
  if (imageSrc.startsWith('images/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/${imageSrc}`
  }
  
  // Default case - assume it's a relative path and prepend base URL
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/${imageSrc}`
}

// Optional: Create a React hook for image loading with error handling
export const useImageWithFallback = (src, fallback = '/placeholder-product.jpg') => {
  const [imageSrc, setImageSrc] = useState(getImageSrc(src, fallback))
  const [isError, setIsError] = useState(false)
  
  useEffect(() => {
    setImageSrc(getImageSrc(src, fallback))
    setIsError(false)
  }, [src, fallback])
  
  const handleError = () => {
    if (!isError) {
      setIsError(true)
      setImageSrc(fallback)
    }
  }
  
  return { imageSrc, handleError, isError }
}