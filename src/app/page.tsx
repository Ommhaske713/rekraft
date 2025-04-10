"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Phone, Mail, Twitter, Facebook, Instagram, Menu, X, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

export default function Home() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const handleBuyClick = () => {
    router.push(isAuthenticated ? "/products" : "/signup")
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const handleProfileClick = () => {
    if (isAuthenticated) {
      const userRole = session?.user?.role || 'customer'
      
      if (userRole === 'seller') {
        router.push('/seller-dashboard')
      } else {
        router.push('/products')
      }
    } else {
      router.push('/signin')
    }
  }

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false) 
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black dark:text-white">
              reKraftt.
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              About Us
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact Us
            </button>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white">
              <MapPin className="h-4 w-4" />
            </div>
            <button 
              onClick={handleProfileClick}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md hidden sm:block"
            >
              {isAuthenticated ? (session?.user?.role === 'seller' ? 'Dashboard' : 'Profile') : 'Sign In'}
            </button>
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-md hidden sm:block ml-2"
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Logout
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-800 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="container py-4 space-y-3">
              <button
                onClick={() => scrollToSection("home")}
                className="block font-medium py-2 text-gray-800 dark:text-gray-200 w-full text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block font-medium py-2 text-gray-800 dark:text-gray-200 w-full text-left"
              >
                About Us
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="block font-medium py-2 text-gray-800 dark:text-gray-200 w-full text-left"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block font-medium py-2 text-gray-800 dark:text-gray-200 w-full text-left"
              >
                Contact Us
              </button>
              <button 
                onClick={handleProfileClick}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md w-full sm:hidden"
              >
                {isAuthenticated ? (session?.user?.role === 'seller' ? 'Dashboard' : 'Profile') : 'Sign In'}
              </button>
              {isAuthenticated && (
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-md w-full sm:hidden flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative h-[350px] sm:h-[400px] md:h-[450px]">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="relative h-full bg-[url('/home.jpg?height=450&width=1200')] bg-cover bg-center">
            <div className="container relative z-20 h-full flex flex-col items-center justify-center text-white px-4">
              <div className="w-full max-w-md mx-auto mb-6 md:mb-8">
                <div className="relative">
                  <input
                    className="pl-4 pr-10 py-2 rounded-md w-full bg-white text-black dark:bg-gray-800 dark:text-white"
                    placeholder="Find your product"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 md:mb-4 px-4">
                Turn Waste Into Opportunity.
              </h1>
              <p className="text-center mb-6 md:mb-8 px-4 text-sm sm:text-base">
                From Waste To Worth - Connecting Builders, Buyers And Sustainability
              </p>
              <div className="flex space-x-4">
                <button
                  className="bg-white text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base"
                  onClick={handleBuyClick}
                >
                  Buy
                </button>
                <Link href="/signin">
                  <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base">
                    Sell
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-10 md:py-16 bg-white dark:bg-gray-900">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="h-[200px] sm:h-[250px] md:h-[300px] relative rounded-lg overflow-hidden">
                <Image
                  src="/homepage2.jpg?height=300&width=500"
                  alt="Sustainable materials"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-6 md:mt-0">
                <div className="text-sm text-blue-900 dark:text-blue-300 font-medium mb-2">About Us</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-3 md:mb-4">
                  Get Sustainable With Reusability
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm sm:text-base">
                  Welcome to our curated collection of architectural wonders and inspirations.
                </p>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start">
                    <div className="font-bold text-blue-900 dark:text-blue-300 mr-2">01.</div>
                    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">Info 1</div>
                  </div>
                  <div className="flex items-start">
                    <div className="font-bold text-blue-900 dark:text-blue-300 mr-2">02.</div>
                    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">Info 2</div>
                  </div>
                  <div className="flex items-start">
                    <div className="font-bold text-blue-900 dark:text-blue-300 mr-2">03.</div>
                    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">Info 3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-10 md:py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              Provided Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Lorem ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et
                Dolore Magna Aliqua. Ut Enim Ad Minim Veniam, Quis Nostrud Exercitation 1 Ullamco Laboris Nisi.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Lorem ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="relative group overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <Image
                  src="/bricks2.jpg?height=300&width=300"
                  alt="Bricks & Blocks"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Bricks & Blocks</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <Image
                  src="/paint.jpg?height=300&width=300"
                  alt="Paints & Chemicals"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Paints & Chemicals</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <Image
                  src="/metal.jpg?height=300&width=300"
                  alt="Metal"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Metal</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <Image
                  src="/07.jpg?height=300&width=300"
                  alt="Doors"
                  width={300}
                  height={300}
                  className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Doors</h3>
                  <button className="border border-white text-white hover:bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm">
                    Know More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-10 md:py-16 bg-white dark:bg-gray-900">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">What Our Client Says</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-4 md:mb-6">
                  Their Stories And Experiences With Our Services
                </h2>
                <button className="border border-blue-900 dark:border-blue-400 text-blue-900 dark:text-blue-400 hover:bg-blue-900/10 dark:hover:bg-blue-400/10 px-4 py-2 rounded-md text-sm sm:text-base">
                  Write A Review
                </button>
              </div>
              <div className="space-y-4 md:space-y-6 mt-6 md:mt-0">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-center mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-900 dark:bg-blue-700 text-white flex items-center justify-center mr-2">
                      <span>U</span>
                    </div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">Username 1</div>
                    <div className="ml-auto text-xs sm:text-sm text-gray-500 dark:text-gray-400">3h ago</div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm sm:text-base">
                    "Travel epic destinations and take some breathtaking images under expert guidance of Whistling
                    Wills. Travel epic destinations and take some breathtaking images under expert guidance of Whistling
                    Wills. "
                  </p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center mr-4">
                      <span className="mr-1">56</span>
                      <span>Likes</span>
                    </div>
                    <div>Reply</div>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-center mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-900 dark:bg-blue-700 text-white flex items-center justify-center mr-2">
                      <span>U</span>
                    </div>
                    <div className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">Username 1</div>
                    <div className="ml-auto text-xs sm:text-sm text-gray-500 dark:text-gray-400">3h ago</div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm sm:text-base">
                    "Travel epic destinations and take some breathtaking images under expert guidance of Whistling
                    Wills. Travel epic destinations and take some breathtaking images under expert guidance of Whistling
                    Wills."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="py-10 md:py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 text-center mb-3 md:mb-4">
              What would you say about our Service?
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6 md:mb-8 text-sm sm:text-base px-4">
              We'd love to hear from you. Fill out the form below to start the conversation.
            </p>
            <div className="max-w-md mx-auto px-4 sm:px-0">
              <form className="space-y-4">
                <input
                  placeholder="Name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <input
                  placeholder="Email"
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <textarea
                  placeholder="Message"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent min-h-[120px] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <div className="flex justify-center">
                  <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-6 sm:px-8 py-2 rounded-md text-sm sm:text-base">
                    Send
                  </button>
                </div>
              </form>
              <div className="mt-6 md:mt-8 flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email: contact@brand.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Phone: +123 456 7890</span>
                </div>
              </div>
            </div>
          </div>
        </section>
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
            <div className="text-gray-300 text-xs sm:text-sm">© 2025 reKraftt</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

