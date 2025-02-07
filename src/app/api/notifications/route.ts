import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NotificationService } from "@/lib/notification-service"
import { NotificationStatus } from "@/types/notification"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as NotificationStatus || 'unread'

    const notifications = await NotificationService.getNotifications(
      session.user.id,
      session.user.companyId,
      status
    )

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json(
      { error: "Error fetching notifications" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, status } = await req.json()

    const notification = await NotificationService.updateNotificationStatus(
      id,
      session.user.id,
      session.user.companyId,
      status
    )

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json(
      { error: "Error updating notification" },
      { status: 500 }
    )
  }
}