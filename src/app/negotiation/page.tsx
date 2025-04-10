"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Search, User, ChevronDown, Send } from "lucide-react"
import { useState } from "react"
import Sidebar from "@/components/sidebar"
import MobileMenu from "../(auth)/signin/mobile-menu"


export default function NegotiationPage() {
  const [message, setMessage] = useState("")
  const [currentOffersOpen, setCurrentOffersOpen] = useState(false)
  const [previousOffersOpen, setPreviousOffersOpen] = useState(false)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sending message:", message)
    setMessage("")
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

      <main className="flex-1 py-10">
        <div className="container flex flex-col md:flex-row">
          {/* Sidebar Component */}
          <Sidebar activeIcon="wallet" />

          {/* Main Content */}
          <div className="flex-1 px-4 md:pl-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Sidebar - User Profiles and Negotiation Overview */}
              <div className="w-full lg:w-64 flex-shrink-0">
                {/* Buyer Profile */}
                <div className="flex items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden mr-3">
                    <Image
                      src="/placeholder.svg?height=50&width=50"
                      alt="Buyer's Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-blue-600 dark:text-blue-400 font-medium">Buyer's Name</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Online
                    </p>
                  </div>
                </div>

                {/* Seller Profile */}
                <div className="flex items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden mr-3">
                    <Image
                      src="/placeholder.svg?height=50&width=50"
                      alt="Seller's Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-blue-600 dark:text-blue-400 font-medium">Seller's Name</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Offline
                    </p>
                  </div>
                </div>

                {/* Negotiation Overview */}
                <div className="mb-6">
                  <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-4">Negotiation Overview</h3>

                  {/* Current Offers */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md mb-3">
                    <button
                      className="flex items-center justify-between w-full p-3 text-left"
                      onClick={() => setCurrentOffersOpen(!currentOffersOpen)}
                    >
                      <span className="text-blue-600 dark:text-blue-400">Current Offers</span>
                      <ChevronDown
                        className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform ${currentOffersOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {currentOffersOpen && (
                      <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300">No current offers</p>
                      </div>
                    )}
                  </div>

                  {/* Previous Offers */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md">
                    <button
                      className="flex items-center justify-between w-full p-3 text-left"
                      onClick={() => setPreviousOffersOpen(!previousOffersOpen)}
                    >
                      <span className="text-blue-600 dark:text-blue-400">Previous Offers</span>
                      <ChevronDown
                        className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform ${previousOffersOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {previousOffersOpen && (
                      <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300">No previous offers</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Content - Chat Area */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-300 mb-6 text-center lg:text-left">
                  Negotiation Chat Box
                </h1>

                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-4">Seller Name</h2>
                </div>

                {/* Chat Messages */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
                  {/* Seller Message */}
                  <div className="mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm inline-block max-w-[80%] text-gray-800 dark:text-gray-200">
                      <p>Sure the price is 1200 Rs a pair.</p>
                    </div>
                  </div>

                  {/* Buyer Message */}
                  <div className="mb-4 flex justify-end">
                    <div className="bg-blue-900 dark:bg-blue-700 text-white rounded-lg p-3 shadow-sm inline-block max-w-[80%]">
                      <p>Hey, I want to Buy a pair of these windows!</p>
                    </div>
                  </div>

                  {/* Seller Message */}
                  <div className="mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm inline-block max-w-[80%] text-gray-800 dark:text-gray-200">
                      <p>No its way too low</p>
                      <p>My final price is 1050!!</p>
                    </div>
                  </div>

                  {/* Buyer Message */}
                  <div className="mb-4 flex justify-end">
                    <div className="bg-blue-900 dark:bg-blue-700 text-white rounded-lg p-3 shadow-sm inline-block max-w-[80%]">
                      <p>I can give You 850 Rs a pair.</p>
                    </div>
                  </div>

                  {/* Seller Message */}
                  <div className="mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm inline-block max-w-[80%] text-gray-800 dark:text-gray-200">
                      <p>Okay Deal!!</p>
                    </div>
                  </div>

                  {/* Buyer Message */}
                  <div className="mb-4 flex justify-end">
                    <div className="bg-blue-900 dark:bg-blue-700 text-white rounded-lg p-3 shadow-sm inline-block max-w-[80%]">
                      <p>Okay Final lets finalize is at 1050 Rs</p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div>
                  <h3 className="text-xl font-medium text-blue-900 dark:text-blue-300 mb-3">Chat Input Box</h3>
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-l-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-r-md flex items-center"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

