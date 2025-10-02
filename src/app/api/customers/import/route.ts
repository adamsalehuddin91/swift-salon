import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

interface CustomerImportData {
  name: string
  phone: string
  email?: string
  isMember?: boolean | string
}

export async function POST(request: NextRequest) {
  try {
    const { customers } = await request.json()

    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { error: "Data pelanggan tidak sah" },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i] as CustomerImportData
      const rowNumber = i + 2 // +2 because of header row and 0-index

      try {
        // Validate required fields
        if (!customer.name || !customer.phone) {
          results.failed++
          results.errors.push(
            `Baris ${rowNumber}: Nama dan telefon adalah wajib`
          )
          continue
        }

        // Clean phone number (remove spaces, dashes, etc)
        const cleanPhone = customer.phone.toString().replace(/[\s-]/g, '')

        // Validate phone number format (Malaysian format)
        if (!/^(01[0-9]{8,9}|60[0-9]{9,10})$/.test(cleanPhone)) {
          results.failed++
          results.errors.push(
            `Baris ${rowNumber}: Format telefon tidak sah (${customer.phone})`
          )
          continue
        }

        // Check if customer already exists (by phone)
        const existing = await prisma.customer.findUnique({
          where: { phone: cleanPhone }
        })

        if (existing) {
          results.failed++
          results.errors.push(
            `Baris ${rowNumber}: Pelanggan dengan telefon ${cleanPhone} sudah wujud`
          )
          continue
        }

        // Validate email if provided
        if (customer.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(customer.email)) {
            results.failed++
            results.errors.push(
              `Baris ${rowNumber}: Format email tidak sah (${customer.email})`
            )
            continue
          }

          // Check if email already exists
          const existingEmail = await prisma.customer.findUnique({
            where: { email: customer.email }
          })

          if (existingEmail) {
            results.failed++
            results.errors.push(
              `Baris ${rowNumber}: Email ${customer.email} sudah digunakan`
            )
            continue
          }
        }

        // Parse isMember field (handle string "true"/"false" or boolean)
        let isMember = false
        if (typeof customer.isMember === 'boolean') {
          isMember = customer.isMember
        } else if (typeof customer.isMember === 'string') {
          isMember = customer.isMember.toLowerCase() === 'true'
        }

        // Generate default password (phone number)
        const hashedPassword = await bcrypt.hash(cleanPhone, 10)

        // Create customer
        await prisma.customer.create({
          data: {
            name: customer.name.trim(),
            phone: cleanPhone,
            email: customer.email?.trim() || null,
            password: hashedPassword,
            isMember: isMember,
            totalPoints: isMember ? 0 : 0
          }
        })

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(
          `Baris ${rowNumber}: ${error.message || 'Ralat tidak diketahui'}`
        )
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Ralat semasa import pelanggan", details: error.message },
      { status: 500 }
    )
  }
}
