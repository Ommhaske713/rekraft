"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Loader2, ShoppingCart, ArrowLeft, MapPin, Tag, Info, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import MobileMenu from "../../(auth)/signin/mobile-menu"

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    quantity: number;
    unit: string;
    negotiable: boolean;
    images: string[];
    location: {
        city: string;
        state: string;
        country: string;
    };
    sellerId: string;
    createdAt: string;
}

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.productId as string

    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true)
                const response = await axios.get(`/api/products/${productId}`)
                setProduct(response.data.product)
            } catch (err: any) {
                console.error("Error fetching product:", err)
                setError(err.response?.data?.error || "Product not found")
            } finally {
                setIsLoading(false)
            }
        }

        if (productId) {
            fetchProduct()
        }
    }, [productId])

    const handleAddToCart = async () => {
        if (!product) return

        try {
            await axios.post('/api/cart', {
                productId: product._id,
                quantity
            })
            alert("Product added to cart!")
        } catch (err: any) {
            console.error("Failed to add to cart:", err)
            alert(err.response?.data?.error || "Failed to add product to cart")
        }
    }

    const handleStartNegotiation = () => {
        if (!product) return
        router.push(`/negotiation/new?productId=${product._id}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product details...</p>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
                <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-6 rounded-lg max-w-md w-full text-center">
                    <p className="text-lg font-medium">{error || "Product not found"}</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        )
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

                    <div className="flex items-center space-x-4">
                        <Link
                            href="/cart"
                            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <ShoppingCart className="h-6 w-6" />
                        </Link>
                        <MobileMenu />
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-6">
                <div className="mb-4">
                    <Link
                        href="/products"
                        className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col space-y-4">
                        <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                            <Image
                                src={product.images?.[currentImageIndex] || "/07.jpg"}
                                alt={product.title}
                                fill
                                unoptimized={true}
                                className="object-cover"
                                placeholder="blur"
                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                            />

                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-black/50 rounded-full p-1 hover:bg-white/80 dark:hover:bg-black/80"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-black/50 rounded-full p-1 hover:bg-white/80 dark:hover:bg-black/80"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${currentImageIndex === index ? 'border-blue-600 dark:border-blue-500' : 'border-transparent'
                                            }`}
                                    >
                                        <Image
                                            src={image || "/07.jpg"}
                                            alt={`${product.title} thumbnail ${index + 1}`}
                                            fill
                                            unoptimized={true}
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {product.title}
                        </h1>

                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{product.price.toLocaleString()}
                            {product.negotiable && (
                                <span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
                                    Negotiable
                                </span>
                            )}
                        </p>

                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{product.location.city}, {product.location.state}, {product.location.country}</span>
                        </div>

                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Tag className="h-4 w-4 mr-1" />
                            <span>
                                {product.category.charAt(0).toUpperCase() + product.category.slice(1)} • {
                                    product.condition.replace('_', ' ').charAt(0).toUpperCase() +
                                    product.condition.replace('_', ' ').slice(1)
                                }
                            </span>
                        </div>

                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Info className="h-4 w-4 mr-1" />
                            <span>Available: {product.quantity} {product.unit}</span>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Quantity:
                                </label>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-l-md bg-gray-100 dark:bg-gray-700"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        id="quantity"
                                        min="1"
                                        max={product.quantity}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.min(product.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                                        className="border-t border-b border-gray-300 dark:border-gray-600 px-3 py-1 w-16 text-center focus:outline-none dark:bg-gray-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                                        className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-r-md bg-gray-100 dark:bg-gray-700"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to Cart
                                </button>

                                {product.negotiable && (
                                    <button
                                        onClick={handleStartNegotiation}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md"
                                    >
                                        Start Negotiation
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-blue-950 dark:bg-gray-950 text-white py-8 md:py-12 mt-12">
                <div className="container">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4">reKraftt.</h3>
                            <p className="text-gray-300">From Waste to Worth</p>
                        </div>
                        <div className="sm:text-center">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4">Follow Us</h3>
                            <div className="flex space-x-4 sm:justify-center">
                                <a href="#" className="hover:text-gray-300">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-gray-300">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-gray-300">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className="sm:col-span-2 md:col-span-1 md:text-right">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4">Contact</h3>
                            <p className="text-gray-300 mb-1 md:mb-2 text-sm sm:text-base">123 Recycling Lane, Eco City, Earth</p>
                            <p className="text-gray-300 mb-1 md:mb-2 text-sm sm:text-base">contact@rekraftt.com</p>
                            <p className="text-gray-300 text-sm sm:text-base">+123 456 7890</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 mb-4 md:mb-0">
                            <Link href="/terms" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                                Terms & Conditions
                            </Link>
                            <span className="text-gray-500 hidden sm:inline">•</span>
                            <Link href="/privacy" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                                Privacy Policy
                            </Link>
                            <span className="text-gray-500 hidden sm:inline">•</span>
                            <Link href="/sustainability" className="text-gray-300 hover:text-white text-xs sm:text-sm">
                                Sustainability Reports
                            </Link>
                        </div>
                        <div className="text-gray-300 text-xs sm:text-sm">© 2025 reKraftt.</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}