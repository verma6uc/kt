import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AuthService } from "@/lib/auth-service"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()
    
    // Get request headers
    const ipAddress = req.headers.get('x-forwarded-for')
    const userAgent = req.headers.get('user-agent')

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        company: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    try {
      // Change password with all validations
      await AuthService.changePassword({
        userId: user.id.toString(),
        companyId: user.company_id.toString(),
        newPassword,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined
      })

      return NextResponse.json({ message: "Password changed successfully" })
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json(
      { error: "Error changing password" },
      { status: 500 }
    )
  }
}