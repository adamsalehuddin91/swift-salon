"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CreditCard,
  Star,
  Filter,
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  Eye,
  Edit2,
  Trash2
} from "lucide-react"

interface Booking {
  id: string
  serviceName: string
  serviceDescription: string | null
  staffName: string | null
  customerName: string
  customerPhone: string
  date: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  total: number
  notes: string | null
  pointsEarned: number | null
  createdAt: string
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('ALL')
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role === 'ADMIN') {
      router.push('/admin')
      return
    }

    loadBookings()
  }, [session, status, router])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, dateFilter])

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/customers/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.staffName && booking.staffName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date()
      const bookingDate = new Date()

      switch (dateFilter) {
        case 'THIS_WEEK':
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          filtered = filtered.filter(booking => new Date(booking.date) >= startOfWeek)
          break
        case 'THIS_MONTH':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          filtered = filtered.filter(booking => new Date(booking.date) >= startOfMonth)
          break
        case 'PAST':
          filtered = filtered.filter(booking => new Date(booking.date) < now)
          break
        case 'UPCOMING':
          filtered = filtered.filter(booking => new Date(booking.date) >= now)
          break
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredBookings(filtered)
  }

  const cancelBooking = async (bookingId: string) => {
    setCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      })

      if (response.ok) {
        loadBookings()
        setShowCancelModal(null)
      } else {
        alert('Ralat membatalkan tempahan')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Ralat membatalkan tempahan')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-50 border-green-200'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'COMPLETED': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200'
      case 'NO_SHOW': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Disahkan'
      case 'PENDING': return 'Menunggu'
      case 'IN_PROGRESS': return 'Sedang Berjalan'
      case 'COMPLETED': return 'Selesai'
      case 'CANCELLED': return 'Dibatalkan'
      case 'NO_SHOW': return 'Tidak Hadir'
      default: return status
    }
  }

  const canCancelBooking = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`)
    const now = new Date()
    const hoursDiff = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return (
      ['PENDING', 'CONFIRMED'].includes(booking.status) &&
      hoursDiff >= 2 // Can cancel at least 2 hours before
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuatkan tempahan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/dashboard" className="flex items-center text-rose-600 hover:text-rose-700 mr-4">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Sejarah Tempahan</h1>
          </div>

          <Link
            href="/booking"
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tempahan Baru
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari servis atau staff..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="CONFIRMED">Disahkan</option>
              <option value="IN_PROGRESS">Sedang Berjalan</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            {/* Date Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="ALL">Semua Tarikh</option>
              <option value="UPCOMING">Akan Datang</option>
              <option value="THIS_WEEK">Minggu Ini</option>
              <option value="THIS_MONTH">Bulan Ini</option>
              <option value="PAST">Lepas</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Menunjukkan {filteredBookings.length} daripada {bookings.length} tempahan
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                    setDateFilter('ALL')
                  }}
                  className="ml-2 text-rose-600 hover:text-rose-700"
                >
                  Bersihkan filter
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                  <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.serviceName}</h3>
                        {booking.serviceDescription && (
                          <p className="text-gray-600 text-sm mb-2">{booking.serviceDescription}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(booking.date).toLocaleDateString('ms-MY')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {booking.startTime} - {booking.endTime}
                          </div>
                          {booking.staffName && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {booking.staffName}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Catatan:</strong> {booking.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-rose-600">RM{booking.total}</span>
                        {booking.pointsEarned && booking.pointsEarned > 0 && (
                          <div className="flex items-center text-sm text-yellow-600">
                            <Star className="w-4 h-4 mr-1" />
                            +{booking.pointsEarned} points
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => setShowCancelModal(booking.id)}
                            className="px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
                          >
                            Batal
                          </button>
                        )}

                        {booking.status === 'COMPLETED' && (
                          <Link
                            href={`/booking?rebook=${booking.id}`}
                            className="px-3 py-1 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors text-sm"
                          >
                            Tempah Lagi
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {bookings.length === 0 ? 'Belum Ada Tempahan' : 'Tiada Tempahan Dijumpai'}
            </h3>
            <p className="text-gray-600 mb-6">
              {bookings.length === 0
                ? 'Anda belum membuat sebarang tempahan lagi.'
                : 'Cuba guna filter yang berbeza atau bersihkan carian anda.'
              }
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {bookings.length === 0 ? 'Buat Tempahan Pertama' : 'Tempahan Baru'}
            </Link>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-bold text-gray-800">Batalkan Tempahan?</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Adakah anda pasti ingin membatalkan tempahan ini? Tindakan ini tidak boleh dibatalkan.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(null)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Tidak
                </button>
                <button
                  onClick={() => cancelBooking(showCancelModal)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}