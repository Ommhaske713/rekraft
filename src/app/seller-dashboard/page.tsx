"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, User, Plus, Trash2, Twitter, Facebook, Instagram, LogOut, Loader2, AlertCircle, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import MobileMenu from "../(auth)/signin/mobile-menu"
import { signOut } from "next-auth/react"
import axios from "axios"

interface SellerData {
  _id: string;
  username: string;
  businessName: string;
  email: string;
  phone: string;
  businessDescription: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  createdAt: string;
  verified: boolean;
}

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
  createdAt: string;
}

export default function SellerDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [sellerData, setSellerData] = useState<SellerData | null>(null)
  const [sellerProducts, setSellerProducts] = useState<Product[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [productImages, setProductImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(["/product-placeholder.svg"])
  
  const [productForm, setProductForm] = useState({
    title: "",
    category: "doors", 
    condition: "good", 
    description: "",
    price: "",
    negotiable: false,
    quantity: "1",
    unit: "piece", 
    images: ["/product-placeholder.svg"],
  })

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/api/seller/me')
        setSellerData(response.data.seller)

        if (response.data.seller._id) {
          fetchSellerProducts(response.data.seller._id)
        }
      } catch (err: any) {
        console.error("Failed to fetch seller data:", err)
        setError(err.response?.data?.error || "Failed to load seller information")

        if (err.response?.status === 401) {
          setTimeout(() => {
            router.push('/signin')
          }, 2000)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchSellerProducts = async (sellerId: string) => {
      try {
        const response = await axios.get(`/api/products?sellerId=${sellerId}`)
        setSellerProducts(response.data.products || [])
      } catch (err: any) {
        console.error("Failed to fetch seller products:", err)
      }
    }
    
    fetchSellerData()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/signin")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProductForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setProductForm((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      const invalidFiles = newFiles.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        setSubmitError("Only image files are allowed")
        return
      }

      const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setSubmitError("Images must be less than 5MB each")
        return
      }

      const combinedFiles = [...productImages, ...newFiles].slice(0, 5)
      setProductImages(combinedFiles)

      const newPreviews = combinedFiles.map(file => URL.createObjectURL(file))
      setImagePreviewUrls(newPreviews.length > 0 ? newPreviews : ["/product-placeholder.svg"])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...productImages]
    newImages.splice(index, 1)
    setProductImages(newImages)

    URL.revokeObjectURL(imagePreviewUrls[index])
    
    const newPreviewUrls = [...imagePreviewUrls]
    newPreviewUrls.splice(index, 1)
    setImagePreviewUrls(newPreviewUrls.length > 0 ? newPreviewUrls : ["/product-placeholder.svg"])
  }

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        if (url !== "/product-placeholder.svg") {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess("")
    
    try {
      const productData = {
        title: productForm.title,
        description: productForm.description,
        price: productForm.price === "" ? 0 : Number(productForm.price),
        category: productForm.category,
        condition: productForm.condition,
        quantity: Number(productForm.quantity),
        unit: productForm.unit,
        negotiable: productForm.negotiable,
        location: {
          city: sellerData?.address?.city || "",
          state: sellerData?.address?.state || "",
          country: sellerData?.address?.country || "India"
        }
      }

      if (!productData.title) throw new Error("Product name is required")
      if (!productData.description) throw new Error("Product description is required")
      if (productData.price < 0) throw new Error("Price cannot be negative")
      if (productData.quantity <= 0) throw new Error("Quantity must be greater than 0")
      if (!productData.location.city || !productData.location.state) {
        throw new Error("Your seller profile must have a complete address to list products")
      }

      const response = await axios.post('/api/products', productData)
      const productId = response.data.product._id

      if (productImages.length > 0) {
        const formData = new FormData()
        productImages.forEach(image => {
          formData.append('images', image)
        })
        
        await axios.post(`/api/products/${productId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      setProductForm({
        title: "",
        category: "doors",
        condition: "good",
        description: "",
        price: "",
        negotiable: false,
        quantity: "1",
        unit: "piece",
        images: ["/product-placeholder.svg"],
      })

      setProductImages([])

      imagePreviewUrls.forEach(url => {
        if (url !== "/product-placeholder.svg") {
          URL.revokeObjectURL(url)
        }
      })
      
      setImagePreviewUrls(["/product-placeholder.svg"])
      setSubmitSuccess("Product added successfully!")

      if (sellerData?._id) {
        const productsResponse = await axios.get(`/api/products?sellerId=${sellerData._id}`)
        setSellerProducts(productsResponse.data.products || [])
      }

      setTimeout(() => {
        setSubmitSuccess("")
      }, 3000)
      
    } catch (err: any) {
      console.error("Product submission error:", err)
      setSubmitError(err.response?.data?.error || err.message || "Failed to add product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    try {
      await axios.delete(`/api/products/${productId}`)
 
      setSellerProducts(prev => prev.filter(product => product._id !== productId))
      
    } catch (err: any) {
      console.error("Failed to delete product:", err)
      alert(err.response?.data?.error || "Failed to delete product")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-6 rounded-lg max-w-md w-full text-center">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={() => router.push('/signin')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  const formattedAddress = sellerData?.address ? 
    `${sellerData.address.street}, ${sellerData.address.city}, ${sellerData.address.state}, ${sellerData.address.postalCode}, ${sellerData.address.country}` : 
    "No address on file";

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
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

          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-8">Seller Dashboard</h1>

          {/* Profile Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">Profile</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 relative rounded-lg overflow-hidden">
                <Image
                  src={sellerData?._id ? `/api/images/${sellerData._id}` : "https://github.com/shadcn.png"}
                  alt="Profile Picture"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://github.com/shadcn.png";
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 flex-1">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Display Name</p>
                  <p className="font-medium text-blue-900 dark:text-blue-300">
                    {sellerData?.businessName || "Not Set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email ID</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {sellerData?.email || "Not Set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-blue-900 dark:text-blue-300">
                    {sellerData?.username || "Not Set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">GSTIN</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {sellerData?.taxId || "Not Set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Number</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {sellerData?.phone || "Not Set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Store Description</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {sellerData?.businessDescription || "No description available"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Store Address</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {formattedAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">Password</h2>
            <button className="text-blue-900 dark:text-blue-300 hover:underline">Change Password</button>
          </div>

          {/* Product Listing Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">Add New Product</h2>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{submitError}</p>
              </div>
            )}
            
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-green-700 dark:text-green-300 text-sm">{submitSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Product Name*
                </label>
                <input
                  id="title"
                  name="title"
                  value={productForm.title}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={productForm.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                  >
                    <option value="bricks">Bricks</option>
                    <option value="doors">Doors</option>
                    <option value="windows">Windows</option>
                    <option value="metals">Metals</option>
                    <option value="wood">Wood</option>
                    <option value="tiles">Tiles</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label
                    htmlFor="condition"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Condition*
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={productForm.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                  >
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="salvage">Salvage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Price (₹)*
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={handleChange}
                    placeholder="Enter Price In Rupees"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center h-full mt-6">
                    <input
                      type="checkbox"
                      name="negotiable"
                      checked={productForm.negotiable}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <span className="text-gray-800 dark:text-gray-200">Price is negotiable</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Quantity*
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={productForm.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="unit"
                    className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                  >
                    Unit*
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={productForm.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    required
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="sqft">Square Foot</option>
                    <option value="meter">Meter</option>
                    <option value="bundle">Bundle</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                >
                  Product Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleChange}
                  placeholder="Enter detailed description of the product"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent min-h-[100px] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  required
                />
              </div>
              
              {/* Add image upload section */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Product Images
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {imagePreviewUrls.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`Product image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {url !== "/product-placeholder.svg" && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {productImages.length < 5 && (
                    <button
                      type="button"
                      onClick={handleImageSelect}
                      className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400"
                    >
                      <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can upload up to 5 images. Each image must be less than 5MB.
                </p>
              </div>
              
              <div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding product...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Your Products Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">Your Products</h2>
            
            {sellerProducts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 py-4">You haven't listed any products yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellerProducts.map(product => (
                  <div 
                    key={product._id} 
                    className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-700"
                  >
                    <div className="w-32 h-24 relative">
                      <Image 
                        src={product.images?.[0] || "/product-placeholder.svg"} 
                        alt={product.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{product.title}</p>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)} • {product.condition.replace('_', ' ').charAt(0).toUpperCase() + product.condition.replace('_', ' ').slice(1)}
                        </p>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ₹{product.price} {product.negotiable && "(Negotiable)"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {product.quantity} {product.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 dark:bg-gray-950 text-white py-8 md:py-12">
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
            <div className="sm:col-span-2 md:col-span-1 md:text-right">
              <h3 className="text-lg sm:text-xl font-bold mb-3 md:mb-4">Contact</h3>
              <p className="text-gray-300 mb-1 md:mb-2 text-sm sm:text-base">123 Recycling Lane, Eco City, Earth</p>
              <p className="text-gray-300 mb-1 md:mb-2 text-sm sm:text-base">contact@earthlygoods.com</p>
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