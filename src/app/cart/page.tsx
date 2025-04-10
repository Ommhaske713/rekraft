"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, User, Twitter, Facebook, Instagram, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Sidebar from "@/components/sidebar"
import MobileMenu from "../(auth)/signin/mobile-menu"

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  sellerId: string;
  negotiable: boolean;
}

interface UserInfo {
  email: string;
  name?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  const grandTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true)
        console.log("Fetching cart data...")

        const cartResponse = await axios.get('/api/cart', { withCredentials: true })
        console.log("Full cart response:", JSON.stringify(cartResponse.data))
        setCartItems(cartResponse.data.items || [])

        const userResponse = await axios.get('/api/auth/session')
        if (userResponse.data?.user) {
          setUserInfo({
            email: userResponse.data.user.email,
            name: userResponse.data.user.name,
          })
        }
      } catch (err: any) {
        console.error("Failed to fetch cart data:", err)
        setError(err.response?.data?.error || "Failed to load cart items")
      } finally {
        setLoading(false)
      }
    }

    fetchCartData()
  }, [])

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) return
      
      await axios.patch('/api/cart', { 
        productId, 
        quantity: newQuantity 
      }, { withCredentials: true })

      setCartItems(prev => prev.map(item => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ))
    } catch (err: any) {
      console.error("Failed to update quantity:", err)
      alert(err.response?.data?.error || "Failed to update quantity")
    }
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      await axios.delete(`/api/cart?productId=${productId}`, { withCredentials: true })

      setCartItems(prev => prev.filter(item => item.productId !== productId))
    } catch (err: any) {
      console.error("Failed to remove item:", err)
      alert(err.response?.data?.error || "Failed to remove item from cart")
    }
  }

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty")
      return
    }
    console.log("Proceeding to payment")
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black dark:text-white">
              reKraftt.
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-12">
            <Link
              href="/"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              About Us
            </Link>
            <Link
              href="/services"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md hidden sm:flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
            <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md hidden sm:flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="container flex flex-col md:flex-row">
          <Sidebar activeIcon="wallet" />

          <div className="flex-1 px-4 md:pl-6">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-8">Your Cart</h1>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-900 dark:text-blue-300 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading your cart items...</p>
              </div>
            ) : error ? (
              <div className="border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <div className="mb-4">
                  <Image 
                    src="/product-placeholder.svg" 
                    alt="Empty Cart" 
                    width={120} 
                    height={120}
                    className="mx-auto opacity-50" 
                  />
                </div>
                <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Add items to your cart to proceed with your purchase</p>
                <Link href="/products" className="bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-md">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                {cartItems.map((item) => (
                  <div key={item.productId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 bg-white dark:bg-gray-800">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 h-32 md:h-48 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src={item.image || "/product-placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                            <p className="font-medium text-blue-900 dark:text-blue-300">{item.category}</p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                            <div className="flex items-center mt-1">
                              <button 
                                onClick={() => handleUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-l"
                              >
                                -
                              </button>
                              <span className="px-4 py-1 bg-gray-100 dark:bg-gray-800">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-r"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Delivery</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">To be determined</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {userInfo && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Email ID</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{userInfo.email}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* Additional customer details would go here */}
                        </div>
                      </div>

                      <div className="border-t md:border-l md:border-t-0 border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0 space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Product Name</p>
                          <p className="font-medium text-blue-900 dark:text-blue-300">{item.title}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Price per item</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">${item.price.toFixed(2)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>

                        <button 
                          onClick={() => handleRemoveItem(item.productId)}
                          className="flex items-center text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Grand Total */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300">Grand Total</h2>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">${grandTotal.toFixed(2)} /-</p>
                  </div>
                </div>

                {/* Proceed to Payment Button */}
                <div className="flex justify-center mt-8">
                  <button
                    className="bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-md"
                    onClick={handleProceedToPayment}
                    disabled={cartItems.length === 0}
                  >
                    Proceed To Payment
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-8">Recommendations</h2>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 bg-white dark:bg-gray-800">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-6">Relatable Category</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Windows Category */}
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="h-48 relative">
                      <Image src="/wooden.jpg?height=200&width=400" alt="Windows" fill className="object-cover" />
                    </div>
                    <div className="p-3 flex justify-between items-center bg-white dark:bg-gray-800">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Windows</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty : 3</p>
                      </div>
                    </div>
                  </div>

                  {/* Doors Category */}
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="h-48 relative">
                      <Image src="/metal.jpg?height=200&width=400" alt="Doors" fill className="object-cover" />
                    </div>
                    <div className="p-3 flex justify-between items-center bg-white dark:bg-gray-800">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Doors</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty : 2</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Link href="/products" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md">
                    Explore more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 dark:bg-gray-950 text-white py-8 md:py-12 mt-16">
        {/* Footer content remains the same */}
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">reKraftt.</h3>
              <p className="text-gray-300">From Waste to Worth</p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-4">
                <a href="#" className="hover:text-gray-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-gray-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-gray-300">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="md:text-right">
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-300 mb-2">123 Recycling Lane, Eco City, Earth</p>
              <p className="text-gray-300 mb-2">contact@earthlygoods.com</p>
              <p className="text-gray-300">+123 456 7890</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 mb-4 md:mb-0">
              <Link href="/terms" className="text-gray-300 hover:text-white text-sm">
                Terms & Conditions
              </Link>
              <span className="text-gray-500 hidden sm:inline">•</span>
              <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <span className="text-gray-500 hidden sm:inline">•</span>
              <Link href="/sustainability" className="text-gray-300 hover:text-white text-sm">
                Sustainability Reports
              </Link>
            </div>
            <div className="text-gray-300 text-sm">© 2025 Brand Name</div>
          </div>
        </div>
      </footer>
    </div>
  )
}