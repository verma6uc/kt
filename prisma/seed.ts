import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  // Create test notification for admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      email: 'admin@example.com'
    }
  })

  if (adminUser) {
    // Create a test notification
    await prisma.notification.create({
      data: {
        uuid: crypto.randomUUID(),
        title: 'Test Notification',
        message: 'This is a test notification',
        status: 'unread',
        priority: 'medium',
        user_id: adminUser.id,
        company_id: adminUser.company_id
      }
    })

    console.log('Created test notification for admin user')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })