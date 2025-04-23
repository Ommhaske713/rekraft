import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { ProductModel } from "@/model/product.model";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/user.model";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await dbConnect();

    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = resolvedParams.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = resolvedParams.id;

    const product = await ProductModel.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Email is missing in session" }, { status: 400 });
    }
    const user = await UserModel.getByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (product.sellerId.toString() !== (user._id as string).toString()) {
      return NextResponse.json({ error: "You can only delete your own products" }, { status: 403 });
    }

    await ProductModel.findByIdAndDelete(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}