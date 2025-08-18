import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastContainer } from 'react-toastify'
import { StripeProvider } from './context/StripeContext'
import { PayPalProvider } from './context/PayPalContext'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Pink Dreams - Premium Fashion Store',
  description: 'Discover the latest fashion trends with our premium collection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <StripeProvider>
                               <PayPalProvider> 
                                <ToastContainer
                                    position="top-right"
                                    autoClose={3000}
                                    hideProgressBar={false}
                                    newestOnTop={false}
                                    closeOnClick
                                    rtl={false}
                                    pauseOnFocusLoss
                                    draggable
                                    pauseOnHover
                                />
                                {children}
                                </PayPalProvider>
                            </StripeProvider>
                        </WishlistProvider>
                    </CartProvider>
                </AuthProvider>
      </body>
    </html>
  )
}

