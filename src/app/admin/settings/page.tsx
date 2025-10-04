"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  Settings,
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  MessageSquare,
  DollarSign
} from "lucide-react"

interface BusinessSettings {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  whatsappNumber: string | null
  pointsPerRinggit: number
  pointRedemptionRates: {
    "50": number
    "100": number
    "200": string
  }
  businessHours: {
    [key: string]: {
      isOpen: boolean
      openTime?: string
      closeTime?: string
    }
  }
  isActive: boolean
}

const daysOfWeek = [
  { key: 'monday', label: 'Isnin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Khamis' },
  { key: 'friday', label: 'Jumaat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Ahad' }
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('business')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Tetapan berjaya disimpan!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Ralat: Gagal menyimpan tetapan')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (field: string, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const updateBusinessHours = (day: string, field: string, value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        [day]: {
          ...settings.businessHours[day],
          [field]: value
        }
      }
    })
  }

  const updatePointRedemption = (points: string, value: number | string) => {
    if (!settings) return
    setSettings({
      ...settings,
      pointRedemptionRates: {
        ...settings.pointRedemptionRates,
        [points]: value
      }
    })
  }

  if (loading) {
    return (
      <AdminLayout title="Tetapan Perniagaan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout title="Tetapan Perniagaan">
        <div className="text-center py-12">
          <p className="text-gray-600">Ralat memuatkan tetapan</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Tetapan Perniagaan">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('business')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'business'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building className="w-4 h-4 inline mr-2" />
                Maklumat Perniagaan
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hours'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Waktu Operasi
              </button>
              <button
                onClick={() => setActiveTab('points')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'points'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                Sistem Mata Ganjaran
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Maklumat Perniagaan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Perniagaan *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={settings.name}
                      onChange={(e) => updateSettings('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      No. Telefon Perniagaan
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={settings.phone || ''}
                      onChange={(e) => updateSettings('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email Perniagaan
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={settings.email || ''}
                      onChange={(e) => updateSettings('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      No. WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="60123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={settings.whatsappNumber || ''}
                      onChange={(e) => updateSettings('whatsappNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Alamat Perniagaan
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={settings.address || ''}
                    onChange={(e) => updateSettings('address', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'hours' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Waktu Operasi
                </h3>

                <div className="space-y-4">
                  {daysOfWeek.map((day) => {
                    const daySettings = settings.businessHours[day.key] || { isOpen: false }
                    return (
                      <div key={day.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-20">
                            <span className="font-medium text-gray-800">{day.label}</span>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={daySettings.isOpen}
                              onChange={(e) => updateBusinessHours(day.key, 'isOpen', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Buka</span>
                          </label>
                        </div>

                        {daySettings.isOpen && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                              value={daySettings.openTime || '09:00'}
                              onChange={(e) => updateBusinessHours(day.key, 'openTime', e.target.value)}
                            />
                            <span className="text-gray-500">hingga</span>
                            <input
                              type="time"
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                              value={daySettings.closeTime || '18:00'}
                              onChange={(e) => updateBusinessHours(day.key, 'closeTime', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Points System Tab */}
            {activeTab === 'points' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Sistem Mata Ganjaran
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Mata Ganjaran per RM
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={settings.pointsPerRinggit}
                      onChange={(e) => updateSettings('pointsPerRinggit', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contoh: 1 bermakna setiap RM1 = 1 mata ganjaran
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-4">Kadar Penebusan Mata Ganjaran</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">50 Mata Ganjaran</span>
                        <p className="text-sm text-gray-600">Diskaun dalam RM</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">RM</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                          value={settings.pointRedemptionRates["50"]}
                          onChange={(e) => updatePointRedemption("50", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">100 Mata Ganjaran</span>
                        <p className="text-sm text-gray-600">Diskaun dalam RM</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">RM</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                          value={settings.pointRedemptionRates["100"]}
                          onChange={(e) => updatePointRedemption("100", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">200 Mata Ganjaran</span>
                        <p className="text-sm text-gray-600">Servis percuma (tetap)</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Servis Percuma
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 border-t">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Tetapan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}