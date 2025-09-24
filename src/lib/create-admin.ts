// Script to create admin user
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'admin@swiftsalon.my'
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('✅ Admin user already exists!')
      return
    }

    await prisma.user.create({
      data: {
        name: 'Admin SwiftSalon',
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@swiftsalon.my')
    console.log('🔑 Password: admin123')
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()