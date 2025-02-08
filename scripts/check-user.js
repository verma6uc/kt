const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@example.com'
      },
      include: {
        company: true
      }
    })

    console.log('User found:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      company: {
        id: user.company.id,
        name: user.company.name,
        identifier: user.company.identifier
      }
    } : 'No user found')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()