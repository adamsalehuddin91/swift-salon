"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  Search,
  Calendar,
  Clock
} from "lucide-react"

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  customer: {
    name: string
    phone: string
  }
  service: {
    name: string
    duration: number
  }
}

interface Staff {
  id: string
  name: string
  phone: string
  email: string | null
  position: string
  isActive: boolean
  createdAt: string
  bookings?: Booking[]
}

interface StaffForm {
  name: string
  phone: string
  email: string
  position: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [staffWithBookings, setStaffWithBookings] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAvailability, setShowAvailability] = useState(false)
  const [form, setForm] = useState<StaffForm>({
    name: '',
    phone: '',
    email: '',
    position: 'Stylist'
  })

  const positions = [
    'Stylist',
    'Senior Stylist',
    'Hair Specialist',
    'Facial Specialist',
    'Henna Artist',
    'Spa Therapist',
    'Nail Technician',
    'Manager',
    'Assistant'
  ]

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      const data = await response.json()
      setStaff(data)
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStaffAvailability = async () => {
    try {
      const response = await fetch(`/api/staff?includeBookings=true&date=${selectedDate}`)
      const data = await response.json()
      setStaffWithBookings(data)
    } catch (error) {
      console.error('Error loading staff availability:', error)
    }
  }

  useEffect(() => {
    if (showAvailability) {
      loadStaffAvailability()
    }
  }, [selectedDate, showAvailability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingStaff ? 'PUT' : 'POST'
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        loadStaff()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save staff')
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      alert(`Ralat: ${error instanceof Error ? error.message : 'Gagal menyimpan maklumat staff'}`)
    }
  }

  const deleteStaff = async (staffId: string) => {
    if (!confirm('Adakah anda pasti untuk memadam staff ini?')) return

    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadStaff()
      } else {
        throw new Error('Failed to delete staff')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Ralat: Gagal memadam staff')
    }
  }

  const editStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setForm({
      name: staffMember.name,
      phone: staffMember.phone,
      email: staffMember.email || '',
      position: staffMember.position
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingStaff(null)
    setForm({
      name: '',
      phone: '',
      email: '',
      position: 'Stylist'
    })
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesPosition = !positionFilter || member.position === positionFilter

    return matchesSearch && matchesPosition && member.isActive
  })

  const activeStaffCount = staff.filter(s => s.isActive).length
  const uniquePositions = new Set(staff.filter(s => s.isActive).map(s => s.position)).size

  // Check for time conflicts between bookings
  const hasTimeConflict = (bookings: Booking[]) => {
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const booking1Start = new Date(bookings[i].startTime)
        const booking1End = new Date(bookings[i].endTime)
        const booking2Start = new Date(bookings[j].startTime)
        const booking2End = new Date(bookings[j].endTime)

        // Check if times overlap
        if (
          (booking1Start < booking2End && booking1End > booking2Start) ||
          (booking2Start < booking1End && booking2End > booking1Start)
        ) {
          return true
        }
      }
    }
    return false
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Selesai'
      case 'CONFIRMED':
        return 'Disahkan'
      case 'IN_PROGRESS':
        return 'Dalam Proses'
      case 'PENDING':
        return 'Pending'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  return (
    <AdminLayout title="Pengurusan Staff">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Staff</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{activeStaffCount}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jawatan Berbeza</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{uniquePositions}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Aktif Hari Ini</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{activeStaffCount}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Add Button */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pengurusan Staff</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Staff
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari staff..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="">Semua Jawatan</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setPositionFilter('')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Staff Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingStaff ? 'Edit Staff' : 'Tambah Staff Baru'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Penuh *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Pilihan)
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jawatan *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={form.position}
                    onChange={(e) => setForm({...form, position: e.target.value})}
                  >
                    {positions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingStaff ? 'Kemaskini' : 'Tambah'} Staff
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              </div>
            ) : filteredStaff.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jawatan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempahan Hari Ini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarikh Mula Kerja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {member.phone}
                          </div>
                          {member.email && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {member.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {member.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-green-500" />
                          {member.bookings?.length || 0} tempahan
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(member.createdAt).toLocaleDateString('ms-MY')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editStaff(member)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteStaff(member.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Padam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tiada staff dijumpai</p>
              </div>
            )}
          </div>
        </div>

        {/* Staff Availability Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Jadual Ketersediaan Staff</h2>
              <button
                onClick={() => {
                  setShowAvailability(!showAvailability)
                  if (!showAvailability) {
                    loadStaffAvailability()
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {showAvailability ? 'Tutup Jadual' : 'Papar Jadual'}
              </button>
            </div>

            {showAvailability && (
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Pilih Tarikh:</label>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {showAvailability && (
            <div className="p-6">
              {staffWithBookings.length > 0 ? (
                <div className="space-y-6">
                  {staffWithBookings.map((member) => {
                    const hasConflict = member.bookings && member.bookings.length > 1 && hasTimeConflict(member.bookings)

                    return (
                      <div key={member.id} className={`border rounded-lg p-4 ${hasConflict ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-gray-600" />
                            <h3 className="font-semibold text-gray-800">{member.name}</h3>
                            <span className="ml-3 text-sm text-gray-500">({member.position})</span>
                          </div>
                          {hasConflict && (
                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                              ⚠️ KONFLIK MASA
                            </span>
                          )}
                        </div>

                        {member.bookings && member.bookings.length > 0 ? (
                          <div className="space-y-2">
                            {member.bookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {new Date(booking.startTime).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        {' - '}
                                        {new Date(booking.endTime).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <User className="w-4 h-4 mr-1 text-gray-400" />
                                      <span className="text-sm text-gray-700">{booking.customer.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {booking.service.name} ({booking.service.duration} min)
                                    </div>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                  {getStatusText(booking.status)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Tiada tempahan pada tarikh ini</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tiada data ketersediaan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}