"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import PasswordResetModal from "@/components/admin/PasswordResetModal"
import CustomerImportModal from "@/components/admin/CustomerImportModal"
import {
  Users,
  Star,
  Phone,
  Mail,
  Calendar,
  Gift,
  Search,
  UserCheck,
  UserX,
  Key,
  Upload,
  Trash2
} from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  isMember: boolean
  totalPoints: number
  lastPasswordResetAt: string | null
  passwordResetByAdmin: string | null
  createdAt: string
  bookings: any[]
  pointHistories: any[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [memberFilter, setMemberFilter] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateMembershipStatus = async (customerId: string, isMember: boolean) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customerId, isMember })
      })

      if (response.ok) {
        loadCustomers()
      }
    } catch (error) {
      console.error('Error updating membership:', error)
    }
  }

  const openPasswordResetModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowPasswordResetModal(true)
  }

  const closePasswordResetModal = () => {
    setSelectedCustomer(null)
    setShowPasswordResetModal(false)
  }

  const handlePasswordReset = () => {
    // Refresh customer list after password reset
    loadCustomers()
  }

  const deleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Adakah anda pasti mahu memadam pelanggan "${customerName}"?\n\nSemua data termasuk tempahan, points, dan keahlian akan turut dipadam.`)) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadCustomers()
        alert('Pelanggan berjaya dipadam')
      } else {
        const data = await response.json()
        alert(`Ralat: ${data.error || 'Gagal memadam pelanggan'}`)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Ralat: Gagal memadam pelanggan')
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesMember = !memberFilter ||
      (memberFilter === 'member' && customer.isMember) ||
      (memberFilter === 'non-member' && !customer.isMember)

    return matchesSearch && matchesMember
  })

  return (
    <>
    <AdminLayout title="Pengurusan Pelanggan">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Pelanggan</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{customers.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ahli Aktif</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {customers.filter(c => c.isMember).length}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kadar Keahlian</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {customers.length > 0 ? Math.round((customers.filter(c => c.isMember).length / customers.length) * 100) : 0}%
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carian
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nama, telefon, email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Keahlian
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              >
                <option value="">Semua</option>
                <option value="member">Ahli</option>
                <option value="non-member">Bukan Ahli</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setMemberFilter('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filter
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV/Excel
              </button>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Senarai Pelanggan ({filteredCustomers.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Ahli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Tempahan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarikh Daftar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password Reset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {customer.isMember ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <Star className="w-3 h-3 mr-1" />
                              Ahli
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Bukan Ahli
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Gift className="w-4 h-4 mr-2 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {customer.totalPoints} points
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.bookings?.length || 0} tempahan</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(customer.createdAt).toLocaleDateString('ms-MY')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.lastPasswordResetAt ? (
                          <div className="text-xs">
                            <div className="text-red-600 font-medium">
                              Reset: {new Date(customer.lastPasswordResetAt).toLocaleDateString('ms-MY')}
                            </div>
                            <div className="text-gray-500">
                              {new Date(customer.lastPasswordResetAt).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Tiada reset</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Password Reset Button */}
                          <button
                            onClick={() => openPasswordResetModal(customer)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded flex items-center"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Membership Toggle */}
                          {customer.isMember ? (
                            <button
                              onClick={() => updateMembershipStatus(customer.id, false)}
                              className="text-red-600 hover:text-red-900 p-1 rounded flex items-center"
                              title="Batalkan keahlian"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Batal Ahli
                            </button>
                          ) : (
                            <button
                              onClick={() => updateMembershipStatus(customer.id, true)}
                              className="text-green-600 hover:text-green-900 p-1 rounded flex items-center"
                              title="Jadikan ahli"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Jadi Ahli
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteCustomer(customer.id, customer.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded flex items-center"
                            title="Padam pelanggan"
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
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tiada pelanggan dijumpai</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>

    {/* Password Reset Modal */}
    <PasswordResetModal
      customer={selectedCustomer}
      isOpen={showPasswordResetModal}
      onClose={closePasswordResetModal}
      onPasswordReset={handlePasswordReset}
    />

    {/* Customer Import Modal */}
    <CustomerImportModal
      isOpen={showImportModal}
      onClose={() => setShowImportModal(false)}
      onImportComplete={loadCustomers}
    />
  </>
  )
}