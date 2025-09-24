import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Cuci Rambut',
        description: 'Cuci rambut dengan shampo dan conditioner premium',
        price: 15,
        duration: 30,
        category: 'Rambut'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Cuci + Blow Dry',
        description: 'Cuci rambut dan blow dry styling',
        price: 25,
        duration: 45,
        category: 'Rambut'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Potong Rambut',
        description: 'Potong rambut mengikut kehendak pelanggan',
        price: 20,
        duration: 30,
        category: 'Rambut'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Rebonding',
        description: 'Rawatan rebonding untuk rambut lurus dan licin',
        price: 120,
        duration: 180,
        category: 'Rambut'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Facial Basic',
        description: 'Facial pembersihan asas untuk kulit wajah',
        price: 35,
        duration: 60,
        category: 'Wajah'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Facial Premium',
        description: 'Facial dengan mask premium dan rawatan khusus',
        price: 55,
        duration: 90,
        category: 'Wajah'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Henna Tangan',
        description: 'Lukisan henna pada tangan dengan corak cantik',
        price: 30,
        duration: 45,
        category: 'Henna'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Henna Kaki',
        description: 'Lukisan henna pada kaki dengan corak tradisional',
        price: 25,
        duration: 30,
        category: 'Henna'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Spa Kaki',
        description: 'Rawatan spa santai untuk kaki yang penat',
        price: 40,
        duration: 60,
        category: 'Spa'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Manicure',
        description: 'Rawatan dan hiasan kuku tangan',
        price: 20,
        duration: 45,
        category: 'Kuku'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Pedicure',
        description: 'Rawatan dan hiasan kuku kaki',
        price: 25,
        duration: 60,
        category: 'Kuku'
      }
    })
  ])

  // Create staff
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        name: 'Siti Aminah',
        phone: '01123456781',
        email: 'siti@swiftsalon.my',
        position: 'Senior Stylist'
      }
    }),
    prisma.staff.create({
      data: {
        name: 'Nurul Huda',
        phone: '01123456782',
        position: 'Hair Specialist'
      }
    }),
    prisma.staff.create({
      data: {
        name: 'Fatimah Zahra',
        phone: '01123456783',
        position: 'Facial Specialist'
      }
    }),
    prisma.staff.create({
      data: {
        name: 'Khadijah Ahmad',
        phone: '01123456784',
        position: 'Henna Artist'
      }
    })
  ])

  // Create business settings
  await prisma.businessSettings.create({
    data: {
      name: 'SwiftSalon Muslimah',
      address: 'No. 123, Jalan Harmoni, Taman Sejahtera, 47000 Sungai Buloh, Selangor',
      phone: '03-12345678',
      email: 'info@swiftsalon.my',
      whatsappNumber: '60123456789',
      pointsPerRinggit: 1,
      pointRedemptionRates: {
        "50": 5,
        "100": 15,
        "200": "free_service"
      },
      businessHours: {
        "monday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
        "tuesday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
        "wednesday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
        "thursday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
        "friday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
        "saturday": { "isOpen": true, "openTime": "09:00", "closeTime": "17:00" },
        "sunday": { "isOpen": false }
      }
    }
  })

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Aisha Rahman',
        phone: '01987654321',
        email: 'aisha@email.com',
        isMember: true,
        totalPoints: 45
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Maryam Ali',
        phone: '01987654322',
        isMember: true,
        totalPoints: 120
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Zainab Hassan',
        phone: '01987654323',
        email: 'zainab@email.com',
        isMember: false,
        totalPoints: 0
      }
    })
  ])

  // Create memberships for members
  await Promise.all([
    prisma.membership.create({
      data: {
        customerId: customers[0].id,
        type: 'BASIC'
      }
    }),
    prisma.membership.create({
      data: {
        customerId: customers[1].id,
        type: 'SILVER'
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created:`)
  console.log(`   - ${services.length} services`)
  console.log(`   - ${staff.length} staff members`)
  console.log(`   - ${customers.length} customers`)
  console.log(`   - 1 business settings`)
  console.log(`   - 2 memberships`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })