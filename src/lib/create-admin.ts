// Script to create admin user
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  // Get credentials from environment variables or prompt
  const email = process.env.ADMIN_EMAIL || 'admin@swiftsalon.my'
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    console.error('❌ ADMIN_PASSWORD environment variable is required!')
    console.log('💡 Set ADMIN_PASSWORD=your_secure_password before running this script')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters long!')
    process.exit(1)
  }

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
    console.log(`📧 Email: ${email}`)
    console.log('🔑 Password: [SECURE - NOT LOGGED]')
    console.log('⚠️  Please change password on first login!')
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()