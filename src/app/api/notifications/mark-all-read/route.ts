import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NotificationService } from "@/lib/notification-service"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await NotificationService.markAllAsRead(
      session.user.id,
      session.user.companyId
    )

    return NextResponse.json({ count: result.count })
  } catch (error) {
    console.error("Mark all read error:", error)
    return NextResponse.json(
      { error: "Error marking notifications as read" },
      { status: 500 }
    )
  }
}