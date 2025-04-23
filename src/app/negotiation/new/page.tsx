"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Product {
    _id: string;
    title: string;
    price: number;
    sellerId: string;
    images: string[];
}

export default function NewNegotiationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const productId = searchParams.get("productId")
    const { data: session } = useSession()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [offerPrice, setOfferPrice] = useState<number>(0)
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return
            
            try {
                setIsLoading(true)
                const response = await axios.get(`/api/products/${productId}`)
                const productData = response.data.product
                setProduct(productData)
                setOfferPrice(Math.floor(productData.price * 0.9)) 
            } catch (err: any) {
                console.error("Error fetching product:", err)
                setError(err.response?.data?.error || "Product not found")
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchProduct()
    }, [productId])
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!product || isSubmitting) return
        
        try {
            setIsSubmitting(true)
            await axios.post("/api/negotiations", {
                productId: product._id,
                sellerId: product.sellerId,
                customerId: session?.user?.id, 
                initialPrice: offerPrice,
                messages: [{
                    userId: session?.user?.id, 
                    message: message || `I'd like to buy this product for ₹${offerPrice}`,
                    timestamp: new Date()
                }]
            })
            
            router.push("/negotiation?status=created")
        } catch (err: any) {
            console.error("Error creating negotiation:", err)
            setError(err.response?.data?.error || "Failed to create negotiation")
            setIsSubmitting(false)
        }
    }
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }
    
    if (error || !product) {
        return (
            <div className="container mx-auto max-w-4xl p-4">
                <div className="bg-red-50 p-4 rounded-md mb-4">
                    <p className="text-red-700">{error || "Unable to load product details"}</p>
                </div>
                <Link href="/products" className="text-blue-600 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to products
                </Link>
            </div>
        )
    }
    
    return (
        <div className="container mx-auto max-w-4xl p-4">
            <Link 
                href={`/products/${productId}`}
                className="text-blue-600 flex items-center mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to product
            </Link>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Start a Negotiation</h1>
                
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="md:w-1/3">
                        <div className="aspect-square bg-gray-100 rounded-md relative overflow-hidden">
                            {product.images && product.images[0] && (
                                <img 
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="object-cover w-full h-full"
                                />
                            )}
                        </div>
                    </div>
                    
                    <div className="md:w-2/3">
                        <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
                        <p className="text-gray-700 mb-4">Listed Price: ₹{product.price.toLocaleString()}</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Offer
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">₹</span>
                                    <input
                                        type="number"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(Number(e.target.value))}
                                        className="pl-8 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        min={1}
                                        max={product.price}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message to Seller (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Explain why you're making this offer..."
                                ></textarea>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Submitting...
                                    </span>
                                ) : (
                                    'Send Offer'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}