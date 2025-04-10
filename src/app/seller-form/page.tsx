"use client"

import type React from "react"
import Link from "next/link"
import { MapPin, User, Loader2, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import MobileMenu from "../(auth)/signin/mobile-menu"
import Image from "next/image"

export default function SellerFormPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: "",
    mobileNumber: "",
    emailId: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    storeLocation: "",
    storeDescription: "",
    password: "",
    profileImage: null as File | null,
  })

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setFormData((prev) => ({ ...prev, profileImage: file }))

      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
    }
  }

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, profileImage: null }))
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    try {
      const userData = {
        username: formData.fullName,
        phone: formData.mobileNumber,
        email: formData.emailId,
        password: formData.password,
        role: 'seller',
        address: {
          street: formData.address || formData.storeLocation,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country || "India"
        },
        businessName: formData.displayName || formData.fullName,
        businessDescription: formData.storeDescription,
        negotiable: true
      }

      const response = await axios.post('/api/sign-up', userData)

      if (formData.profileImage && response.data?.id) {
        try {
          const imageFormData = new FormData()
          imageFormData.append('avatar', formData.profileImage)
          
          await axios.patch(
            `/api/users/${response.data.id}/initial-profile-image`, 
            imageFormData, 
            { headers: { 'Content-Type': 'multipart/form-data' }}
          )
        } catch (imageError) {
          console.error("Failed to upload profile image:", imageError)
        }
      }

      router.push(`/verify?email=${encodeURIComponent(formData.emailId)}&password=${encodeURIComponent(formData.password)}`)
      
    } catch (err: any) {
      console.error("Seller signup error:", err)
      setError(err.response?.data?.error || "Failed to create seller account")
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4">
        {/* Header content remains the same */}
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black dark:text-white">
              reKraftt.
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-12">
            <Link href="/" className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <Link href="/about" className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              About Us
            </Link>
            <Link href="/services" className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              Services
            </Link>
            <Link href="/deliver" className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              Deliver
            </Link>
            <Link href="/contact" className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md hidden sm:flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Be a Seller</h1>

          {/* Progress Steps */}
          <div className="flex justify-center mb-10">
            <div className="flex flex-wrap justify-center gap-2 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-blue-900 dark:text-blue-300 font-medium">
                  1
                </div>
                <span className="text-sm mt-1 text-gray-800 dark:text-gray-200">Display Info</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-900 dark:bg-blue-700 text-white flex items-center justify-center font-medium">
                  2
                </div>
                <span className="text-sm mt-1 text-gray-800 dark:text-gray-200">Email ID & GST</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-blue-900 dark:text-blue-300 font-medium">
                  3
                </div>
                <span className="text-sm mt-1 text-gray-800 dark:text-gray-200">Store Details</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-blue-900 dark:text-blue-300 font-medium">
                  4
                </div>
                <span className="text-sm mt-1 text-gray-800 dark:text-gray-200">Password</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Personal Information</h2>
              <div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter Full Name*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Enter Business Name*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {imagePreview ? "Change Profile Picture" : "Insert Your Display Picture"}
                  </button>
                  
                  {/* Image preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <div className="flex items-start gap-2">
                        <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                          <Image 
                            src={imagePreview} 
                            alt="Profile preview" 
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Number & Email ID */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Mobile Number & Email ID</h2>
              <div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter Mobile Number*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  placeholder="Enter Email ID*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {/* Store Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Store Details</h2>
              <div>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  placeholder="Store Description*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={3}
                  required
                />
              </div>
              
              {/* Address fields */}
              <div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street Address*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State/Province*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {/* Create Password */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-blue-900 dark:text-blue-300">Create Password</h2>
              <div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Password*"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={suggestPassword}
                  className="text-blue-900 dark:text-blue-300 hover:underline"
                >
                  Suggest Password
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-md bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-3 rounded-md flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v3m0 0l-3-3m3 3l3-3m-3-3V3m0 0L9 6m3-3l3 3"
                      />
                    </svg>
                    Sign Up
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}