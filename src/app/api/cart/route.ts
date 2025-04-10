import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { UserModel } from '@/model/user.model'
import { ProductModel } from '@/model/product.model'
import mongoose from 'mongoose'

interface CartItem {
  productId: string;
  quantity: number;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  images?: string[];
  category: string;
  sellerId: string;
  negotiable: boolean;
}

interface CartItemWithDetails {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  sellerId: string;
  negotiable: boolean;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log("Fetching cart for user:", userId)
    const user = await UserModel.getCustomerById(userId);
    
    if (!user || user.role !== 'customer') {
      console.log("User not found or not a customer")
      return NextResponse.json({ error: 'User not found or not a customer' }, { status: 404 })
    }
    
    const cart = user.cart || []
    console.log("Raw cart data:", JSON.stringify(cart))
    
    if (cart.length === 0) {
      console.log("Cart is empty")
      return NextResponse.json({ items: [] })
    }

    try {
      const productIds = cart.map(item => {
        try {
          return item.productId.toString().trim();
        } catch (err) {
          console.error("Error converting productId to string:", err);
          return item.productId;
        }
      });
      
      console.log("Looking for products with IDs:", productIds);

      const allProducts = await ProductModel.find({}) as Product[];
      console.log(`Retrieved ${allProducts.length} total products from database`);

      if (allProducts.length > 0) {
        console.log("Sample product:", {
          id: allProducts[0]._id.toString(),
          title: allProducts[0].title
        });
      }
      const cartItems = [];

      for (const item of cart) {
        const cartProductId = item.productId.toString().trim();

        const matchingProduct = allProducts.find(product => 
          product._id.toString().trim() === cartProductId
        );
        
        if (matchingProduct) {
          console.log(`Found product for cart item: ${matchingProduct.title}`);
          cartItems.push({
            id: cartProductId,
            productId: cartProductId,
            title: matchingProduct.title || "Unknown Product",
            price: matchingProduct.price || 0,
            quantity: item.quantity || 1,
            image: matchingProduct.images?.[0] || "https://via.placeholder.com/200",
            category: matchingProduct.category || "Uncategorized",
            sellerId: matchingProduct.sellerId.toString(),
            negotiable: matchingProduct.negotiable || false
          });
        } else {
          console.log(`No matching product found for ID: ${cartProductId}`);
        }
      }
      
      console.log(`Found ${cartItems.length} products out of ${cart.length} cart items`);
      return NextResponse.json({ items: cartItems });
    } catch (error) {
      console.error("Error processing cart items:", error);
      return NextResponse.json({ 
        error: 'Failed to process cart items', 
        details: String(error) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    const user = await UserModel.getCustomerById(userId)
    
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'User not found or not a customer' }, { status: 404 })
    }

    const product = await ProductModel.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (quantity > product.quantity) {
      return NextResponse.json({ 
        error: 'Requested quantity exceeds available stock', 
        availableQuantity: product.quantity 
      }, { status: 400 })
    }

    if (product.sellerId.toString() === userId) {
      return NextResponse.json({ 
        error: 'Sellers cannot add their own products to cart' 
      }, { status: 403 });
    }

    const cart = user.cart || []
    const existingItemIndex = cart.findIndex((item: CartItem) => item.productId === productId)
    
    if (existingItemIndex >= 0) {
      const newTotalQuantity = cart[existingItemIndex].quantity + quantity

      if (newTotalQuantity > product.quantity) {
        return NextResponse.json({ 
          error: 'Total quantity exceeds available stock', 
          availableQuantity: product.quantity,
          currentCartQuantity: cart[existingItemIndex].quantity
        }, { status: 400 })
      }
      
      cart[existingItemIndex].quantity = newTotalQuantity
    } else {
      cart.push({ productId, quantity })
    }
    
    await UserModel.updateUser(userId, { cart })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item added to cart',
      cart
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    const user = await UserModel.getCustomerById(userId)
    
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'User not found or not a customer' }, { status: 404 })
    }

    const product = await ProductModel.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (quantity > product.quantity) {
      return NextResponse.json({ 
        error: 'Requested quantity exceeds available stock', 
        availableQuantity: product.quantity 
      }, { status: 400 })
    }

    const cart = user.cart || []
    const existingItemIndex = cart.findIndex((item: CartItem) => item.productId === productId)
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity = quantity
    } else {
      cart.push({ productId, quantity })
    }
    
    await UserModel.updateUser(userId, { cart })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cart item updated',
      cart
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }
    
    const user = await UserModel.getCustomerById(userId)
    
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'User not found or not a customer' }, { status: 404 })
    }
    
    let cart = user.cart || []

    cart = cart.filter((item: CartItem) => item.productId !== productId)

    await UserModel.updateUser(userId, { cart })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from cart',
      cart
    })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 })
  }
}