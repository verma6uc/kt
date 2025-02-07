import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NotificationService } from "@/lib/notification-service"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const count = await NotificationService.getUnreadCount(
      session.user.id,
      session.user.companyId
    )

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Unread count error:", error)
    return NextResponse.json(
      { error: "Error fetching unread count" },
      { status: 500 }
    )
  }
}