"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Star,
  Calendar,
  User,
  Gift,
  Clock,
  Phone,
  Mail,
  CreditCard,
  LogOut,
  Plus,
  History,
  Award,
  Crown
} from "lucide-react"

interface CustomerData {
  id: string
  name: string
  phone: string
  email: string
  totalPoints: number
  membershipType: string
  membershipExpiry: string | null
  recentBookings: Array<{
    id: string
    serviceName: string
    date: string
    status: string
    total: number
  }>
  pointsHistory: Array<{
    id: string
    points: number
    type: 'EARNED' | 'REDEEMED'
    description: string
    date: string
  }>
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect admin to admin dashboard
    if (session.user?.role === 'ADMIN') {
      router.push('/admin')
      return
    }

    loadCustomerData()
  }, [session, status, router])

  const loadCustomerData = async () => {
    try {
      const response = await fetch('/api/customers/dashboard')
      if (response.ok) {
        const data = await response.json()
        setCustomerData(data)
      }
    } catch (error) {
      console.error('Error loading customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'PLATINUM': return Crown
      case 'GOLD': return Award
      case 'SILVER': return Gift
      default: return Star
    }
  }

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'PLATINUM': return 'text-purple-600 bg-purple-50'
      case 'GOLD': return 'text-yellow-600 bg-yellow-50'
      case 'SILVER': return 'text-gray-600 bg-gray-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-50'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'CANCELLED': return 'text-red-600 bg-red-50'
      case 'COMPLETED': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuatkan data...</p>
        </div>
      </div>
    )
  }

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ralat memuatkan data pelanggan</p>
          <Link href="/" className="text-rose-600 hover:text-rose-700">
            Kembali ke Laman Utama
          </Link>
        </div>
      </div>
    )
  }

  const MembershipIcon = getMembershipIcon(customerData.membershipType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Saya</h1>
            <p className="text-gray-600">Selamat datang, {customerData.name}!</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Profil
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Keluar
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tindakan Pantas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/booking"
                  className="flex items-center p-4 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors group"
                >
                  <Plus className="w-8 h-8 text-rose-600 mr-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Buat Tempahan</h3>
                    <p className="text-sm text-gray-600">Tempah servis baru</p>
                  </div>
                </Link>

                <Link
                  href="/my-bookings"
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <History className="w-8 h-8 text-blue-600 mr-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Sejarah Tempahan</h3>
                    <p className="text-sm text-gray-600">Lihat tempahan anda</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Tempahan Terkini</h2>
                <Link
                  href="/my-bookings"
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                >
                  Lihat Semua
                </Link>
              </div>

              {customerData.recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {customerData.recentBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{booking.serviceName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString('ms-MY')}
                        </div>
                        <span className="font-semibold text-rose-600">RM{booking.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Belum ada tempahan</p>
                  <Link
                    href="/booking"
                    className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Tempahan Pertama
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Membership Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMembershipColor(customerData.membershipType)}`}>
                  <MembershipIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-800">
                    Ahli {customerData.membershipType === 'BASIC' ? 'Asas' :
                          customerData.membershipType === 'SILVER' ? 'Perak' :
                          customerData.membershipType === 'GOLD' ? 'Emas' : 'Platinum'}
                  </h3>
                  {customerData.membershipExpiry && (
                    <p className="text-sm text-gray-600">
                      Tamat: {new Date(customerData.membershipExpiry).toLocaleDateString('ms-MY')}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <Link
                  href="/membership"
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                >
                  Naik Taraf Keahlian →
                </Link>
              </div>
            </div>

            {/* Points Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Mata Ganjaran</h3>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-800">{customerData.totalPoints}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">RM5 Diskaun (50 points)</span>
                  <span className={customerData.totalPoints >= 50 ? "text-green-600" : "text-gray-400"}>
                    {customerData.totalPoints >= 50 ? "✓" : `${50 - customerData.totalPoints} lagi`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Free Service (200 points)</span>
                  <span className={customerData.totalPoints >= 200 ? "text-green-600" : "text-gray-400"}>
                    {customerData.totalPoints >= 200 ? "✓" : `${200 - customerData.totalPoints} lagi`}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Link
                  href="/my-points"
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                >
                  Tebus Points →
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Maklumat Hubungan</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">{customerData.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">{customerData.email}</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Link
                  href="/profile"
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                >
                  Kemaskini Maklumat →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}