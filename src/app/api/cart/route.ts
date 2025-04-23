import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { UserModel } from '@/model/user.model'
import { ProductModel } from '@/model/product.model'
import mongoose from 'mongoose'
import dbConnect from "@/lib/dbConnect";
import { NegotiationModel } from '@/model/order.model'

interface CartItem {
  productId: string | mongoose.Types.ObjectId;
  quantity: number;
  negotiatedPrice?: number; 
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!mongoose.connection.db) {
      await dbConnect();
    }

    if (!mongoose.connection.readyState) {
      await dbConnect();
    }
    const user = await mongoose.connection.db?.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(userId)
    });
    
    if (!user || user.role !== 'customer') {
      console.log("User not found or not a customer")
      return NextResponse.json({ error: 'User not found or not a customer' }, { status: 404 })
    }

    const cart = user.cart || []
    
    if (cart.length === 0) {
      console.log("Cart is empty")
      return NextResponse.json({ items: [] })
    }

    interface CartItem {
      productId: string | mongoose.Types.ObjectId;
      quantity: number;
      negotiatedPrice?: number; 
    }

    const productIds: mongoose.Types.ObjectId[] = cart.map((item: CartItem) => {
      try {
      return new mongoose.Types.ObjectId(item.productId);
      } catch (e) {
      return item.productId as mongoose.Types.ObjectId;
      }
    });
 
    const products = await ProductModel.find({
      _id: { $in: productIds }
    }, {
      title: 1,
      price: 1,
      images: 1,
      category: 1,
      sellerId: 1,
      negotiable: 1
    }) as Array<{
      _id: mongoose.Types.ObjectId,
      title: string,
      price: number,
      images: string[],
      category: string,
      sellerId: mongoose.Types.ObjectId,
      negotiable: boolean
    }>
 
    interface CartItem {
      productId: string | mongoose.Types.ObjectId;
      quantity: number;
    }

    interface Product {
      _id: mongoose.Types.ObjectId;
      title: string;
      price: number;
      images: string[];
      category: string;
      sellerId: mongoose.Types.ObjectId;
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

    const cartItems: CartItemWithDetails[] = cart.map((cartItem: CartItem) => {
      const matchedProduct = products.find((p: Product) => 
      p._id.toString() === cartItem.productId.toString()
      )
      
      if (!matchedProduct) {
      console.log("Product not found for cart item:", cartItem.productId)
      return null
      }
      
      return {
      id: cartItem.productId.toString(),
      productId: cartItem.productId.toString(),
      title: matchedProduct.title,
      price: matchedProduct.price,
      negotiatedPrice: cartItem.negotiatedPrice, 
      quantity: cartItem.quantity,
      image: matchedProduct.images?.[0] || "/product-placeholder.svg",
      category: matchedProduct.category,
      sellerId: matchedProduct.sellerId.toString(),
      negotiable: matchedProduct.negotiable
      }
    }).filter((item: CartItemWithDetails | null): item is CartItemWithDetails => item !== null)
    interface CartResponse {
      items: CartItemWithDetails[];
    }
    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity, price } = await request.json();

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

    let finalPrice = product.price;
    if (price) {
      const negotiation = await NegotiationModel.findOne({
        productId,
        customerId: userId,
        status: 'accepted'
      });
      
      if (negotiation) {
        finalPrice = negotiation.counterOffer || negotiation.initialPrice;
      }
    }

    const cart = Array.isArray(user.cart) ? [...user.cart] : [];

    const productIdString = productId.toString()
    const existingItemIndex = cart.findIndex(
      item => item.productId && item.productId.toString() === productIdString
    )
    
    if (existingItemIndex >= 0) {
      const newTotalQuantity = cart[existingItemIndex].quantity + quantity

      if (newTotalQuantity > product.quantity) {
        return NextResponse.json({ 
          error: 'Total quantity exceeds available stock', 
          availableQuantity: product.quantity,
          currentCartQuantity: cart[existingItemIndex].quantity
        }, { status: 400 })
      }
      
      cart[existingItemIndex].quantity = newTotalQuantity;

      if (finalPrice !== product.price) {
        (cart[existingItemIndex] as CartItem).negotiatedPrice = finalPrice;
      }

    } else {
      const cartItem: { productId: string; quantity: number; negotiatedPrice?: number } = {
        productId: productIdString,
        quantity
      };

      if (finalPrice !== product.price) {
        cartItem.negotiatedPrice = finalPrice;
      }
      
      cart.push(cartItem);
    }

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { cart: cart } }
    );

    const updatedUser = await mongoose.connection.db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) }
    );
        
    return NextResponse.json({ 
      success: true, 
      message: 'Item added to cart',
      cart: updatedUser?.cart || []  
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

    const cart = Array.isArray(user.cart) ? [...user.cart] : []
    
    const productIdString = productId.toString()
    const existingItemIndex = cart.findIndex(
      item => item.productId && item.productId.toString() === productIdString
    )
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity = quantity
    } else {
      cart.push({ 
        productId: productIdString, 
        quantity 
      })
    }

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { cart: cart } }
    );
    
    const updatedUser = await mongoose.connection.db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cart item updated',
      cart: updatedUser?.cart || []
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
    
    const cart = Array.isArray(user.cart) ? [...user.cart] : []
    const productIdString = productId.toString()

    const updatedCart = cart.filter(
      item => item.productId && item.productId.toString() !== productIdString
    );

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { cart: updatedCart } }
    );
    
    const updatedUser = await mongoose.connection.db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from cart',
      cart: updatedUser?.cart || []
    })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 })
  }
}