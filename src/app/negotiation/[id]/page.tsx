"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Send } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"

interface NegotiationMessage {
    userId: string;
    message: string;
    timestamp: Date;
}

interface Negotiation {
    _id: string;
    productId: string;
    customerId: string;
    sellerId: string;
    initialPrice: number;
    counterOffer?: number;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
    messages: NegotiationMessage[];
    createdAt: string;
    updatedAt: string;
}

interface Product {
    _id: string;
    title: string;
    price: number;
    images: string[];
    sellerId: string;
}

export default function NegotiationDetailPage() {
    const router = useRouter()
    const { id } = useParams()
    const { data: session } = useSession()
    
    const [negotiation, setNegotiation] = useState<Negotiation | null>(null)
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [newOffer, setNewOffer] = useState<number>(0)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
    
    const messagesEndRef = useRef<HTMLDivElement>(null)
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    useEffect(() => {
        const fetchNegotiationAndProduct = async () => {
            try {
                setIsLoading(true)

                const negotiationResponse = await axios.get(`/api/negotiations/${id}`)
                const negotiationData = negotiationResponse.data
                setNegotiation(negotiationData)

                const productResponse = await axios.get(`/api/products/${negotiationData.productId}`)
                setProduct(productResponse.data.product)

                if (!negotiationData.counterOffer) {
                    setNewOffer(negotiationData.initialPrice)
                } else {
                    setNewOffer(negotiationData.counterOffer)
                }
            } catch (err: any) {
                console.error("Error fetching negotiation details:", err)
                setError(err.response?.data?.error || "Failed to load negotiation details")
            } finally {
                setIsLoading(false)
            }
        }
        
        if (id) {
            fetchNegotiationAndProduct()
        }
    }, [id])
    
    useEffect(() => {
        scrollToBottom()
    }, [negotiation?.messages])
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!negotiation || !session?.user || !newMessage.trim()) return
        
        try {
            setIsSendingMessage(true)
            
            const updatedNegotiation = await axios.patch(`/api/negotiations/${id}`, {
                messages: [
                    ...negotiation.messages,
                    {
                        userId: session.user.id,
                        message: newMessage.trim(),
                        timestamp: new Date()
                    }
                ]
            })
            
            setNegotiation(updatedNegotiation.data)
            setNewMessage("")
        } catch (err: any) {
            console.error("Error sending message:", err)
            alert("Failed to send message. Please try again.")
        } finally {
            setIsSendingMessage(false)
        }
    }
    
    const handleAccept = async () => {
        if (!negotiation || !session?.user) return
        
        if (!confirm("Are you sure you want to accept this offer?")) return
        
        try {
            const updatedNegotiation = await axios.patch(`/api/negotiations/${id}`, {
                status: 'accepted',
                messages: [
                    ...negotiation.messages,
                    {
                        userId: session.user.id,
                        message: "I've accepted your offer.",
                        timestamp: new Date()
                    }
                ]
            })
            
            setNegotiation(updatedNegotiation.data)
        } catch (err) {
            console.error("Error accepting offer:", err)
            alert("Failed to accept offer. Please try again.")
        }
    }
    
    const handleReject = async () => {
        if (!negotiation || !session?.user) return
        
        if (!confirm("Are you sure you want to reject this offer?")) return
        
        try {
            const updatedNegotiation = await axios.patch(`/api/negotiations/${id}`, {
                status: 'rejected',
                messages: [
                    ...negotiation.messages,
                    {
                        userId: session.user.id,
                        message: "I'm sorry, I have to decline this offer.",
                        timestamp: new Date()
                    }
                ]
            })
            
            setNegotiation(updatedNegotiation.data)
        } catch (err) {
            console.error("Error rejecting offer:", err)
            alert("Failed to reject offer. Please try again.")
        }
    }
    
    const handleCounterOffer = async () => {
        if (!negotiation || !session?.user || !newOffer) return
        
        try {
            const updatedNegotiation = await axios.patch(`/api/negotiations/${id}`, {
                status: 'countered',
                counterOffer: newOffer,
                messages: [
                    ...negotiation.messages,
                    {
                        userId: session.user.id,
                        message: `I'm offering ₹${newOffer} instead.`,
                        timestamp: new Date()
                    }
                ]
            })
            
            setNegotiation(updatedNegotiation.data)
        } catch (err) {
            console.error("Error sending counter offer:", err)
            alert("Failed to send counter offer. Please try again.")
        }
    }
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }
    
    if (error || !negotiation || !product) {
        return (
            <div className="container mx-auto max-w-4xl p-4">
                <div className="bg-red-50 p-4 rounded-md mb-4">
                    <p className="text-red-700">{error || "Unable to load negotiation details"}</p>
                </div>
                <Link href="/negotiation" className="text-blue-600 flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to negotiations
                </Link>
            </div>
        )
    }
    
    const isCustomer = session?.user?.id === negotiation.customerId
    const isSeller = session?.user?.id === negotiation.sellerId
    const isResolved = ['accepted', 'rejected'].includes(negotiation.status)
    
    return (
        <div className="container mx-auto max-w-4xl p-4">
            <Link 
                href="/negotiation"
                className="text-blue-600 flex items-center mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to negotiations
            </Link>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/4">
                            <div className="relative aspect-square rounded-md overflow-hidden">
                                {product.images && product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        unoptimized={true}
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">No image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="sm:w-3/4">
                            <h2 className="text-xl font-semibold">
                                <Link href={`/products/${product._id}`} className="hover:text-blue-600">
                                    {product.title}
                                </Link>
                            </h2>
                            
                            <div className="mt-2 space-y-1">
                                <p className="text-gray-700">Original Price: ₹{product.price.toLocaleString()}</p>
                                <p className="text-gray-700">Initial Offer: ₹{negotiation.initialPrice.toLocaleString()}</p>
                                
                                {negotiation.counterOffer && (
                                    <p className="text-gray-700">Counter Offer: ₹{negotiation.counterOffer.toLocaleString()}</p>
                                )}
                                
                                <p className={`font-medium ${
                                    negotiation.status === 'pending' ? 'text-yellow-600' :
                                    negotiation.status === 'accepted' ? 'text-green-600' :
                                    negotiation.status === 'rejected' ? 'text-red-600' :
                                    'text-blue-600'
                                }`}>
                                    Status: {negotiation.status.charAt(0).toUpperCase() + negotiation.status.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 max-h-96 overflow-y-auto bg-gray-50">
                    {negotiation.messages.length === 0 ? (
                        <p className="text-center text-gray-500 my-8">No messages yet</p>
                    ) : (
                        <div className="space-y-4">
                            {negotiation.messages.map((msg, index) => {
                                const isOwnMessage = msg.userId === session?.user?.id
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                            isOwnMessage 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white border border-gray-200 text-gray-800'
                                        }`}>
                                            <p className="text-sm">{msg.message}</p>
                                            <p className={`text-xs mt-1 ${
                                                isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                                            }`}>
                                                {new Date(msg.timestamp).toLocaleTimeString()} · {
                                                    msg.userId === negotiation.customerId ? 'Customer' : 'Seller'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {!isResolved && (
                    <div className="p-4 sm:p-6 border-t border-gray-200">
                        {isSeller && negotiation.status === 'pending' && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-md">
                                <h3 className="font-medium mb-2">Respond to Offer</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={handleAccept}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        Accept Offer
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        Decline Offer
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={newOffer}
                                            onChange={(e) => setNewOffer(Number(e.target.value))}
                                            className="rounded-md border border-gray-300 p-2 w-32"
                                            min={1}
                                        />
                                        <button
                                            onClick={handleCounterOffer}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
                                        >
                                            Send Counter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isCustomer && negotiation.status === 'countered' && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-md">
                                <h3 className="font-medium mb-2">Counter Offer: ₹{negotiation.counterOffer?.toLocaleString()}</h3>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleAccept}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        Accept Counter
                                    </button>
                                    <button 
                                        onClick={handleReject}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        Reject Counter
                                    </button>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 rounded-l-md border border-r-0 border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSendingMessage}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md flex items-center justify-center disabled:opacity-50"
                                disabled={!newMessage.trim() || isSendingMessage}
                            >
                                {isSendingMessage ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {isResolved && (
                    <div className="p-4 sm:p-6 border-t border-gray-200">
                        <div className={`p-4 rounded-md ${
                            negotiation.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {negotiation.status === 'accepted' ? (
                                <p>This negotiation has been accepted. Please proceed with the purchase.</p>
                            ) : (
                                <p>This negotiation has been rejected. You may start a new negotiation if desired.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}