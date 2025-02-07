import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { subDays, subHours, subMinutes } from 'date-fns'

const prisma = new PrismaClient()

const notificationTemplates = {
  info: [
    { title: "System Update", message: "A new system update is available" },
    { title: "Maintenance Notice", message: "Scheduled maintenance in 24 hours" },
    { title: "API Status", message: "All systems operational" },
    { title: "New Feature", message: "Check out our latest features" },
    { title: "Usage Report", message: "Your monthly usage report is ready" },
  ],
  warning: [
    { title: "API Usage", message: "Approaching API usage limit" },
    { title: "Storage Space", message: "Storage space is running low" },
    { title: "Performance Alert", message: "High latency detected" },
    { title: "Security Update", message: "Important security patch available" },
    { title: "Certificate Expiry", message: "SSL certificate expires soon" },
  ],
  error: [
    { title: "Connection Failed", message: "Database connection error" },
    { title: "API Error", message: "API endpoint not responding" },
    { title: "Authentication Failed", message: "Multiple failed login attempts" },
    { title: "Data Sync Error", message: "Failed to sync data" },
    { title: "Service Down", message: "Critical service unavailable" },
  ],
  success: [
    { title: "Backup Complete", message: "Data backup completed successfully" },
    { title: "Deployment Success", message: "New version deployed successfully" },
    { title: "Integration Complete", message: "API integration successful" },
    { title: "Update Success", message: "System update completed" },
    { title: "Data Migration", message: "Data migration completed" },
  ],
}

const companyNames = [
  "TechCorp Solutions",
  "DataFlow Systems",
  "CloudNet Services",
  "SecureIT Pro",
  "DevOps Masters",
  "Digital Dynamics",
  "InnoTech Solutions",
  "ByteForge Systems",
  "NetPrime Services",
  "CodeCraft Labs",
]

async function main() {
  // Create default company if not exists
  const defaultCompany = await prisma.company.upsert({
    where: { identifier: 'default-company' },
    update: {},
    create: {
      name: 'Default Company',
      identifier: 'default-company',
      type: 'enterprise',
      status: 'active',
    },
  })

  // Create admin user if not exists
  const adminEmail = 'admin@yuvi.io'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: await hash('admin123', 12),
        role: 'super_admin',
        status: 'active',
        company: {
          connect: { id: defaultCompany.id }
        }
      },
    })
  }

  // Create companies
  for (const name of companyNames) {
    const existingCompany = await prisma.company.findFirst({
      where: { name }
    })

    if (!existingCompany) {
      await prisma.company.create({
        data: {
          name,
          identifier: name.toLowerCase().replace(/\s+/g, '-'),
          type: 'small_business',
          status: 'active',
        }
      })
    }
  }

  // Generate 5000 notifications for user 1
  const notifications = []
  const priorities = ['low', 'medium', 'high'] as const
  const statuses = ['unread', 'read', 'archived'] as const

  // Delete existing notifications for user 1
  await prisma.notification.deleteMany({
    where: { user_id: 1 }
  })

  for (let i = 0; i < 5000; i++) {
    const categories = ['info', 'warning', 'error', 'success'] as const
    const category = categories[Math.floor(Math.random() * categories.length)]
    const template = notificationTemplates[category][Math.floor(Math.random() * notificationTemplates[category].length)]
    
    // Generate a random date within the last 30 days
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)
    const date = subMinutes(
      subHours(
        subDays(new Date(), daysAgo),
        hoursAgo
      ),
      minutesAgo
    )

    // Add some variety to the messages
    const companyName = companyNames[Math.floor(Math.random() * companyNames.length)]
    const messageVariations = [
      `${template.message} for ${companyName}`,
      `${companyName}: ${template.message}`,
      `${template.message} [${companyName}]`,
      template.message
    ]
    const message = messageVariations[Math.floor(Math.random() * messageVariations.length)]

    // Add some variety to the titles
    const titleVariations = [
      template.title,
      `${companyName} - ${template.title}`,
      `[${companyName}] ${template.title}`,
      `${template.title} Alert`
    ]
    const title = titleVariations[Math.floor(Math.random() * titleVariations.length)]

    notifications.push({
      title,
      message,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      read_at: Math.random() > 0.5 ? date : null,
      link: Math.random() > 0.7 ? `/dashboard/companies/${Math.floor(Math.random() * 10) + 1}` : null,
      created_at: date,
      user_id: 1,
      company_id: defaultCompany.id
    })
  }

  // Insert notifications in batches
  const BATCH_SIZE = 100
  for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
    const batch = notifications.slice(i, i + BATCH_SIZE)
    await prisma.notification.createMany({
      data: batch
    })
  }

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })