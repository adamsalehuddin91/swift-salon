"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  Clock,
  TrendingUp,
  UserCheck,
  AlertCircle
} from "lucide-react"

interface DashboardData {
  todayBookings: number
  todayRevenue: number
  weeklyBookings: number
  monthlyRevenue: number
  totalCustomers: number
  totalMembers: number
  pendingBookings: number
  recentBookings: any[]
  popularServices: any[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-12">
          <p className="text-gray-600">Ralat memuatkan data dashboard</p>
        </div>
      </AdminLayout>
    )
  }

  const stats = [
    {
      title: "Tempahan Hari Ini",
      value: data.todayBookings,
      icon: Calendar,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Pendapatan Hari Ini",
      value: `RM${data.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Tempahan Minggu Ini",
      value: data.weeklyBookings,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600"
    },
    {
      title: "Pendapatan Bulan Ini",
      value: `RM${data.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-amber-500",
      textColor: "text-amber-600"
    },
    {
      title: "Jumlah Pelanggan",
      value: data.totalCustomers,
      icon: Users,
      color: "bg-indigo-500",
      textColor: "text-indigo-600"
    },
    {
      title: "Ahli Aktif",
      value: data.totalMembers,
      icon: UserCheck,
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "Tempahan Pending",
      value: data.pendingBookings,
      icon: AlertCircle,
      color: "bg-orange-500",
      textColor: "text-orange-600"
    },
    {
      title: "Kadar Keahlian",
      value: `${((data.totalMembers / data.totalCustomers) * 100).toFixed(1)}%`,
      icon: Star,
      color: "bg-pink-500",
      textColor: "text-pink-600"
    }
  ]

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Tempahan Terkini
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.recentBookings.length > 0 ? (
                  data.recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-800">{booking.customer.name}</p>
                        <p className="text-sm text-gray-600">{booking.service.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.bookingDate).toLocaleDateString('ms-MY')} - {new Date(booking.startTime).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">RM{booking.totalAmount}</p>
                        <p className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status === 'COMPLETED' ? 'Selesai' :
                           booking.status === 'CONFIRMED' ? 'Disahkan' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Tiada tempahan terkini</p>
                )}
              </div>
            </div>
          </div>

          {/* Popular Services */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Servis Popular Bulan Ini
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.popularServices.length > 0 ? (
                  data.popularServices.map((item: any, index: number) => (
                    <div key={item.serviceId} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-amber-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.service?.name}</p>
                          <p className="text-sm text-gray-600">RM{item.service?.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{item._count.serviceId} tempahan</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Tiada data servis</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tindakan Pantas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <a
              href="/admin/bookings"
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Calendar className="w-6 h-6 text-blue-600 mr-2" />
              <span className="font-medium text-blue-600">Urus Tempahan</span>
            </a>
            <a
              href="/admin/customers"
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Users className="w-6 h-6 text-green-600 mr-2" />
              <span className="font-medium text-green-600">Urus Pelanggan</span>
            </a>
            <a
              href="/admin/services"
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Star className="w-6 h-6 text-purple-600 mr-2" />
              <span className="font-medium text-purple-600">Urus Servis</span>
            </a>
            <a
              href="/admin/points"
              className="flex items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <Star className="w-6 h-6 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-600">Urus Points</span>
            </a>
          </div>
          <div className="border-t pt-4">
            <a
              href="/qr-booking"
              className="flex items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 border-2 border-amber-600 rounded mr-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-600 rounded-sm"></div>
              </div>
              <span className="font-medium text-amber-600">Jana QR Code Tempahan</span>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}