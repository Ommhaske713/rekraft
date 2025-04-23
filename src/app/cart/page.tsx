"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ShoppingBag, X, ArrowLeft, Loader } from "lucide-react"

interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  negotiatedPrice?: number 
  quantity: number
  image: string
  category: string
  sellerId: string
  negotiable: boolean
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.negotiatedPrice || item.price) * item.quantity,
    0
  )

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  useEffect(() => {
    async function fetchCart() {
      try {
        setLoading(true)
        const response = await axios.get('/api/cart')
        setCartItems(response.data.items || [])
      } catch (err: any) {
        console.error('Failed to fetch cart:', err)
        setError(err.response?.data?.error || 'Failed to load cart items')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) return
      setUpdatingItem(productId)

      await axios.patch('/api/cart', {
        productId,
        quantity: newQuantity
      })

      setCartItems(prev =>
        prev.map(item => item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
        )
      )

      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 2000)
    } catch (err: any) {
      console.error('Failed to update quantity:', err)
      alert(err.response?.data?.error || 'Failed to update quantity')
    } finally {
      setUpdatingItem(null)
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      setRemovingItem(productId)
      await axios.delete(`/api/cart?productId=${productId}`)

      setCartItems(prev => prev.filter(item => item.productId !== productId))
    } catch (err: any) {
      console.error('Failed to remove item:', err)
      alert(err.response?.data?.error || 'Failed to remove item from cart')
    } finally {
      setRemovingItem(null)
    }
  }

  const checkout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin mr-2">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <p>Loading cart...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {showFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 py-2 px-4 rounded shadow">
          Cart updated successfully
        </div>
      )}

      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/products" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Continue Shopping</span>
          </Link>
          <div className="w-24">
            {/* Spacer for flex alignment */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded">
            {error}
          </div>
        )}

        {cartItems.length === 0 && !error ? (
          <div className="text-center py-12 max-w-md mx-auto">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any construction materials to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Browse Materials
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium mb-4">Items ({totalItems})</h2>

              <div className="space-y-4">
                {cartItems.map(item => (
                  <div
                    key={item.productId}
                    className={`border rounded-lg p-4 ${removingItem === item.productId ? 'opacity-50' : ''}`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 relative rounded bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || "/product-placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                          sizes="96px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/product-placeholder.svg";
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.title}</h3>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            disabled={removingItem === item.productId}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Remove item"
                          >
                            {removingItem === item.productId ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                          {item.category}
                          {item.negotiable && (
                            <span className="ml-2 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                              Negotiable
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex border rounded">
                            <button
                              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                              disabled={updatingItem === item.productId || item.quantity <= 1}
                              className="px-3 py-1 border-r"
                            >
                              -
                            </button>
                            <span className="px-3 py-1">
                              {updatingItem === item.productId ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={updatingItem === item.productId}
                              className="px-3 py-1 border-l"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-medium">₹{((item.negotiatedPrice || item.price) * item.quantity).toFixed(2)}</div>
                            {item.negotiatedPrice ? (
                              <div className="text-xs">
                                <span className="text-green-600">₹{item.negotiatedPrice.toFixed(2)} each</span>
                                <span className="text-gray-500 line-through ml-1">₹{item.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">₹{item.price.toFixed(2)} each</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="border rounded-lg p-6 sticky top-8" style={{margin: "42px -50px 12px 21px"}}>
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={checkout}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Secure payment and fast delivery
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}