"use client"

import React from "react"
import Link from "next/link"
import { Search, User, Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import MobileMenu from "./mobile-menu"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const verified = searchParams?.get("verified")
  const emailFromParams = searchParams?.get("email")

  React.useEffect(() => {
    if (emailFromParams) {
      setEmail(emailFromParams)
    }
    
    if (verified === "true") {
      setSuccess("Email verified successfully! You can now log in.")
    }
  }, [verified, emailFromParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: email,
        password,
      })
      
      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      try {
        const response = await fetch("/api/auth/session")
        const session = await response.json()
        
        if (session?.user?.role === "seller") {
          router.push("/seller-dashboard")
        } else if (session?.user?.role === "customer") {
          router.push("/products")
        } else {
          console.warn("User role not found in session, using default redirect")
          router.push("/products")
        }
      } catch (sessionErr) {
        console.error("Error fetching session:", sessionErr)
        router.push("/products")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <main className="flex-1 flex items-center justify-center py-10 px-4 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 sm:mb-8">
            Login To Your Account
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your email address"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div className="text-center">
              <Link href="/forgot-password" className="text-blue-700 dark:text-blue-400 hover:underline">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-3 rounded-md flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
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
                  Log In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <span className="text-gray-700 dark:text-gray-300">New to reKraftt?</span>
            <div className="flex space-x-2">
              <Link
                href="/seller-form"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Sign Up As Seller
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Sign Up As Customer
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}