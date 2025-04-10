"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import axios from "axios"
import { signIn } from "next-auth/react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [verificationCode, setVerificationCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [redirectStatus, setRedirectStatus] = useState("")
  
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const emailParam = searchParams?.get("email")
    const passwordParam = searchParams?.get("password")
    
    if (emailParam) {
      setEmail(emailParam)
    }
    
    if (passwordParam) {
      setPassword(passwordParam)
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !verificationCode) return
    
    setIsSubmitting(true)
    setError("")
    setRedirectStatus("")
    
    try {
      const response = await axios.post("/api/verify-code", {
        email,
        code: verificationCode
      })
      
      setSuccess("Email successfully verified!")

      const userRole = response.data?.role

      try {
        if (password) {
          setRedirectStatus("Signing you in...")

          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const result = await signIn("credentials", {
            redirect: false,
            identifier: email,
            password,
          })
          
          if (result?.ok) {
            try {
              setRedirectStatus("Getting your account details...")

              await new Promise(resolve => setTimeout(resolve, 2000))
              
              const userResponse = await axios.get("/api/user/me")
              const fetchedRole = userResponse.data?.role || userRole
              
              setRedirectStatus(`Redirecting to ${fetchedRole === 'seller' ? 'seller dashboard' : 'products page'}...`)

              setTimeout(() => {
                if (fetchedRole === 'seller') {
                  router.push('/seller-dashboard')
                } else {
                  router.push('/products')
                }
              }, 1000)
              
            } catch (userErr) {
              console.error("Failed to get user details:", userErr)

              setTimeout(() => {
                if (userRole === 'seller') {
                  router.push('/seller-dashboard')
                } else {
                  router.push('/products')
                }
              }, 1000)
            }
          } else {
            setRedirectStatus("Login failed. Redirecting to sign in page...")
            setTimeout(() => {
              router.push(`/signin?verified=true&email=${encodeURIComponent(email)}`)
            }, 1500)
          }
        } else {
          setRedirectStatus("Redirecting to sign in page...")
          setTimeout(() => {
            router.push(`/signin?verified=true&email=${encodeURIComponent(email)}`)
          }, 1500)
        }
      } catch (err) {
        console.error("Auto-login error:", err)
        setRedirectStatus("Something went wrong. Redirecting to sign in page...")
        setTimeout(() => {
          router.push(`/signin?verified=true&email=${encodeURIComponent(email)}`)
        }, 1500)
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.response?.data?.error || 'Verification failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (isResending || !canResend || !email) return
    
    setIsResending(true)
    setError('')
    
    try {
      await axios.post('/api/resend-verification', {
        email,
      })
      
      setCountdown(60)
      setCanResend(false)
      setSuccess('Verification code resent successfully!')

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-8 left-8 z-20">
        <Link 
          href="/"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center"
        >
          <span className="text-xl font-bold">reKraftt.</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Verify Your Email</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm dark:bg-red-900 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm dark:bg-green-900 dark:border-green-800 dark:text-green-300">
              {success}
            </div>
          )}
          
          {redirectStatus && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300 flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {redirectStatus}
            </div>
          )}
          
          <p className="text-gray-600 text-center mb-6 dark:text-gray-400">
            We've sent a verification code to <strong className="font-medium text-gray-800 dark:text-gray-200">{email}</strong>. 
            Please enter the code below to verify your email.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                maxLength={6}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !!redirectStatus}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md flex items-center justify-center dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm dark:text-gray-400">
              Didn't receive the code?{' '}
              {canResend ? (
                <button 
                  onClick={handleResendCode}
                  disabled={isResending || isSubmitting || !!redirectStatus}
                  className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              ) : (
                <span className="text-gray-500 dark:text-gray-500">
                  Resend code in {countdown}s
                </span>
              )}
            </p>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-gray-500 text-sm text-center dark:text-gray-400">
              Already verified? <Link href="/signin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}