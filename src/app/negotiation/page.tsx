"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, ArrowLeft, MessageSquare, Check, X, RefreshCw } from "lucide-react"
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
  product?: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
}

export default function NegotiationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const { data: session, status: sessionStatus } = useSession() 
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNegotiations = async () => {

      if (sessionStatus === "loading") return;

      if (sessionStatus === "unauthenticated" || !session?.user?.id) {
        setError("You must be logged in to view negotiations")
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const userId = session.user.id

        const [customerResponse, sellerResponse] = await Promise.all([
          axios.get(`/api/negotiations?customerId=${userId}`),
          axios.get(`/api/negotiations?sellerId=${userId}`)
        ])

        const allNegotiations = [...customerResponse.data, ...sellerResponse.data]

        const negotiationsWithProducts = await Promise.all(
          allNegotiations.map(async (negotiation: Negotiation) => {
            try {
              const productResponse = await axios.get(`/api/products/${negotiation.productId}`)
              return {
                ...negotiation,
                product: productResponse.data.product
              }
            } catch (err) {
              console.error(`Error fetching product ${negotiation.productId}:`, err)
              return negotiation
            }
          })
        )

        setNegotiations(negotiationsWithProducts)
      } catch (err: any) {
        console.error("Error fetching negotiations:", err)
        setError(err.response?.data?.error || "Failed to load negotiations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNegotiations()
  }, [session]) 

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Negotiations</h1>
        <Link href="/products" className="text-blue-600 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to products
        </Link>
      </div>

      {status === "created" && (
        <div className="bg-green-50 p-4 rounded-md mb-6">
          <p className="text-green-700">Your offer has been sent to the seller. You'll be notified when they respond.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {negotiations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You don't have any active negotiations yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {negotiations.map((negotiation) => (
            <div
              key={negotiation._id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="flex flex-col sm:flex-row cursor-pointer"
                onClick={() => router.push(`/negotiation/${negotiation._id}`)}
              >
                <div className="sm:w-1/4 bg-gray-100">
                  {negotiation.product?.images && negotiation.product.images[0] ? (
                    <div className="relative aspect-square">
                      <Image
                        src={negotiation.product.images[0]}
                        alt={negotiation.product.title || "Product"}
                        fill
                        unoptimized={true}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image</p>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <h3 className="font-medium">
                    {negotiation.product?.title || "Product"}
                  </h3>

                  <div className="mt-2 flex justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Original price: ₹{negotiation.product?.price.toLocaleString() || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Offered price: ₹{negotiation.initialPrice.toLocaleString()}</p>
                      {negotiation.counterOffer && (
                        <p className="text-sm text-gray-600">Counter offer: ₹{negotiation.counterOffer.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {negotiation.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {negotiation.status === 'accepted' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Accepted
                        </span>
                      )}
                      {negotiation.status === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </span>
                      )}
                      {negotiation.status === 'countered' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Countered
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{negotiation.messages?.length || 0} messages</span>
                    <span className="mx-2">•</span>
                    <span>Last updated: {new Date(negotiation.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}