"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { Search, Filter, ChevronDown, ShoppingCart, Loader2, Edit, X, Plus } from "lucide-react"

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

const categories = [
  { id: "all", label: "All Categories" },
  { id: "bricks", label: "Bricks" },
  { id: "doors", label: "Doors" },
  { id: "windows", label: "Windows" },
  { id: "metals", label: "Metals" },
  { id: "wood", label: "Wood" },
  { id: "tiles", label: "Tiles" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical" },
  { id: "other", label: "Other" }
]

const conditions = [
  { id: "all", label: "All Conditions" },
  { id: "new", label: "New" },
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "salvage", label: "Salvage" }
]

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get("condition") || "all")
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || ""
  })
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [sortBy, setSortBy] = useState("newest")
  const [cartCount, setCartCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<{ id: string, role: string } | null>(null)
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(["/product-placeholder.svg"])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/session')
        if (response.data && response.data.user) {
          setCurrentUser({
            id: response.data.user.id,
            role: response.data.user.role
          })
          console.log("Current user:", response.data.user)
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    const fetchCart = async () => {
      try {
        console.log("Fetching cart data...")
        const response = await axios.get('/api/cart', { withCredentials: true })
        console.log("Cart response:", response.data)

        const cartItems = response.data.items || []
        console.log("Cart items:", cartItems)

        const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
        console.log("Total items in cart:", totalItems)
        setCartCount(totalItems)
      } catch (err) {
        console.error("Failed to fetch cart:", err)
      }
    }

    fetchCart()

    const intervalId = setInterval(fetchCart, 30000) 

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError("")

      try {
        const params = new URLSearchParams()
        if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)
        if (selectedCondition && selectedCondition !== "all") params.append("condition", selectedCondition)
        if (priceRange.min) params.append("minPrice", priceRange.min)
        if (priceRange.max) params.append("maxPrice", priceRange.max)
        if (location) params.append("location", location)
        if (searchQuery) params.append("query", searchQuery)

        const response = await axios.get(`/api/products?${params.toString()}`)
        let productList = response.data.products || []

        if (sortBy === "newest") {
          productList = productList.sort((a: Product, b: Product) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        } else if (sortBy === "price-low") {
          productList = productList.sort((a: Product, b: Product) => a.price - b.price)
        } else if (sortBy === "price-high") {
          productList = productList.sort((a: Product, b: Product) => b.price - a.price)
        }

        setProducts(productList)
      } catch (err: any) {
        console.error("Failed to fetch products:", err)
        setError(err.response?.data?.error || "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, selectedCondition, priceRange.min, priceRange.max, location, sortBy, searchQuery])

  const handleAddToCart = async (productId: string) => {
    try {
      console.log("Adding product to cart:", productId)

      const response = await axios.post('/api/cart', {
        productId,
        quantity: 1
      }, { withCredentials: true })

      console.log("Add to cart response:", response.data)

      const cartResponse = await axios.get('/api/cart', { withCredentials: true })
      console.log("Updated cart:", cartResponse.data)

      const cartItems = cartResponse.data.items || []
      const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
      console.log("New cart count:", totalItems)

      setCartCount(totalItems)

      alert("Product added to cart!")
    } catch (err: any) {
      console.error("Failed to add to cart:", err)
      alert(err.response?.data?.error || "Failed to add product to cart")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append("query", searchQuery)
    if (selectedCategory !== "all") params.append("category", selectedCategory)
    if (selectedCondition !== "all") params.append("condition", selectedCondition)
    if (priceRange.min) params.append("minPrice", priceRange.min)
    if (priceRange.max) params.append("maxPrice", priceRange.max)
    if (location) params.append("location", location)

    router.push(`/products?${params.toString()}`)
  }

  const isOwnProduct = (productSellerId: string) => {
    return currentUser?.role === 'seller' && currentUser.id === productSellerId
  }

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentCount = imagePreviewUrls[0] === "/product-placeholder.svg" ? 0 : imagePreviewUrls.length
    const newFilesCount = files.length

    if (currentCount + newFilesCount > 5) {
      alert("You can only upload a maximum of 5 images")
      return
    }

    const newImageUrls: string[] = []

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }

      newImageUrls.push(URL.createObjectURL(file))
    })

    if (imagePreviewUrls[0] === "/product-placeholder.svg") {
      setImagePreviewUrls(newImageUrls)
    } else {
      setImagePreviewUrls(prev => [...prev, ...newImageUrls])
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImagePreviewUrls(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        return ["/product-placeholder.svg"]
      }
      return updated
    })
  }

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        if (url !== "/product-placeholder.svg") {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [imagePreviewUrls])

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

          <form
            onSubmit={handleSearch}
            className="hidden md:flex relative mx-4 flex-1 max-w-md"
          >
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 dark:border-gray-600 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-gray-200"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </button>
          </form>

          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {!currentUser && (
              <Link
                href="/signin"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <form
          onSubmit={handleSearch}
          className="relative flex"
        >
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-300 dark:border-gray-600 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-gray-200"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </button>
        </form>
      </div>

      <main className="flex-1 container py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Marketplace Products
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-between border border-gray-300 dark:border-gray-700 p-3 rounded-md mb-4"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filters</span>
            </span>
            <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
            {/* Categories */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Condition</h3>
              <div className="space-y-2">
                {conditions.map(condition => (
                  <label key={condition.id} className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      checked={selectedCondition === condition.id}
                      onChange={() => setSelectedCondition(condition.id)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{condition.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300"
                />
              </div>
            </div>

            {/* Location */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Location</h3>
              <input
                type="text"
                placeholder="City or state"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300"
              />
            </div>

            {/* Apply filters button */}
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Apply Filters
            </button>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {/* Sort controls */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-gray-300"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <div className="py-12 text-center">
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && products.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No products found matching your criteria.</p>
              </div>
            )}

            {/* Products grid */}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div
                    key={product._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition hover:shadow-md"
                  >
                    <Link href={`/products/${product._id}`}>
                      <div className="relative h-48 w-full">
                        <Image
                          src={product.images?.[0] || "/07.jpg"}
                          alt={product.title}
                          fill
                          unoptimized={true}
                          className="object-cover"
                          // Add this:
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/products/${product._id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-1 truncate">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)} • {
                          product.condition.replace('_', ' ').charAt(0).toUpperCase() +
                          product.condition.replace('_', ' ').slice(1)
                        }
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
                        {product.location.city}, {product.location.state}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">
                          ₹{product.price.toLocaleString()}
                          {product.negotiable && (
                            <span className="ml-1 text-xs font-normal text-blue-600 dark:text-blue-400">
                              (Negotiable)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.quantity} {product.unit}
                        </p>
                      </div>

                      {/* Conditionally render Add to Cart or Your Product button */}
                      {isOwnProduct(product.sellerId) ? (
                        <div className="mt-3 flex gap-2">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-center text-sm">
                            Your Product
                          </div>
                          <Link
                            href={`/seller-dashboard/edit-product/${product._id}`}
                            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product._id);
                          }}
                          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                          disabled={product.quantity < 1}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {product.quantity < 1 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      )}
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
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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