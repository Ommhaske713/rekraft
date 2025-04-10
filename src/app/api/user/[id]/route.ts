import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { UserModel } from "@/model/user.model"

interface RequestContext {
  params: {
    id: string;
  }
}

interface SessionUser {
  id: string;
  email: string;
}

interface Session {
  user?: SessionUser;
}

interface BaseUser {
  role: "seller" | "customer";
  email: string;
}

interface UserData {
  password?: string;
  verificationCode?: string;
  verificationExpires?: Date;
  [key: string]: any;
}

export async function GET(
  request: Request,
  context: RequestContext
) {
  try {
    const { id } = await context.params

    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await UserModel.getByEmail(session.user.email as string) as BaseUser | null
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let userData: UserData | null = null
    if (user.role === "seller") {
      userData = await UserModel.getSellerById(id)
    } else if (user.role === "customer") {
      userData = await UserModel.getCustomerById(id)
    }

    if (!userData) {
      return NextResponse.json({ error: "User details not found" }, { status: 404 })
    }

    const obj = JSON.parse(JSON.stringify(userData))
    const { password, verificationCode, verificationExpires, ...clean } = obj

    return NextResponse.json({ user: clean, role: user.role })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}