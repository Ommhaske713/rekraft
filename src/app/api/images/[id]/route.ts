import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await dbConnect();
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("Database connection failed");
    }
    
    const collection = mongoose.connection.db.collection("users");

    const projection = { avatar: 1 };
    const user = await collection.findOne(
      { _id: new mongoose.Types.ObjectId(id) }, 
      { projection }
    );

    if (!user || !user.avatar) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const response = new NextResponse(Buffer.from(user.avatar.data, 'base64'), {
      status: 200,
      headers: {
        'Content-Type': user.avatar.contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    });

    return response;
  } catch (error) {
    console.error("Error retrieving image:", error);
    return NextResponse.json(
      { error: "Failed to retrieve image" },
      { status: 500 }
    );
  }
}