"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  Save,
  Bell,
  Shield,
  CreditCard,
  Crown,
  Award,
  Gift,
  Star,
  Check,
  AlertCircle
} from "lucide-react"

interface ProfileData {
  id: string
  name: string
  phone: string
  email: string
  membershipType: string
  membershipExpiry: string | null
  preferences: {
    whatsappNotifications: boolean
    emailNotifications: boolean
    marketingEmails: boolean
  }
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'membership' | 'password'>('profile')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    whatsappNotifications: true,
    emailNotifications: true,
    marketingEmails: false
  })

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

    loadProfileData()
  }, [session, status, router])

  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/customers/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        setProfileForm({
          name: data.name,
          phone: data.phone,
          email: data.email
        })
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/customers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        setSuccessMessage('Profil berjaya dikemaskini!')
        loadProfileData()
      } else {
        setErrorMessage('Ralat mengemaskini profil')
      }
    } catch (error) {
      setErrorMessage('Ralat sistem. Sila cuba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const updatePreferences = async () => {
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/customers/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        setSuccessMessage('Keutamaan berjaya dikemaskini!')
      } else {
        setErrorMessage('Ralat mengemaskini keutamaan')
      }
    } catch (error) {
      setErrorMessage('Ralat sistem. Sila cuba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const updatePassword = async () => {
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Kata laluan baru tidak sepadan')
      setSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Kata laluan baru mesti sekurang-kurangnya 6 aksara')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/customers/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        setSuccessMessage('Kata laluan berjaya dikemaskini!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        setErrorMessage(error.message || 'Ralat mengemaskini kata laluan')
      }
    } catch (error) {
      setErrorMessage('Ralat sistem. Sila cuba lagi.')
    } finally {
      setSaving(false)
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
      case 'PLATINUM': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'GOLD': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'SILVER': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const membershipTiers = [
    { type: 'BASIC', name: 'Ahli Asas', price: 'PERCUMA', benefits: ['1x Points', 'Basic Support'] },
    { type: 'SILVER', name: 'Ahli Perak', price: 'RM50/tahun', benefits: ['1.5x Points', '5% Diskaun', 'Priority Support'] },
    { type: 'GOLD', name: 'Ahli Emas', price: 'RM100/tahun', benefits: ['2x Points', '10% Diskaun', 'Free Monthly Service'] },
    { type: 'PLATINUM', name: 'Ahli Platinum', price: 'RM200/tahun', benefits: ['3x Points', '15% Diskaun', 'VIP Treatment'] }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuatkan profil...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ralat memuatkan profil</p>
          <Link href="/dashboard" className="text-rose-600 hover:text-rose-700">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="flex items-center text-rose-600 hover:text-rose-700 mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Maklumat Asas
                </button>

                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'preferences'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Keutamaan
                </button>

                <button
                  onClick={() => setActiveTab('membership')}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'membership'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  Keahlian
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'password'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  Kata Laluan
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Maklumat Asas</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Penuh *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telefon *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Email *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <button
                      onClick={updateProfile}
                      disabled={saving}
                      className="flex items-center px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Keutamaan Notifikasi</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-800">WhatsApp Notifications</h3>
                        <p className="text-sm text-gray-600">Terima notifikasi appointment melalui WhatsApp</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.whatsappNotifications}
                          onChange={(e) => setPreferences({...preferences, whatsappNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-800">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Terima notifikasi appointment melalui email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-800">Marketing Emails</h3>
                        <p className="text-sm text-gray-600">Terima promosi dan tawaran istimewa</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketingEmails}
                          onChange={(e) => setPreferences({...preferences, marketingEmails: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <button
                      onClick={updatePreferences}
                      disabled={saving}
                      className="flex items-center px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Menyimpan...' : 'Simpan Keutamaan'}
                    </button>
                  </div>
                </div>
              )}

              {/* Membership Tab */}
              {activeTab === 'membership' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Status Keahlian</h2>

                  {/* Current Membership */}
                  <div className={`p-6 rounded-lg border-2 mb-8 ${getMembershipColor(profileData.membershipType)}`}>
                    <div className="flex items-center mb-4">
                      {(() => {
                        const Icon = getMembershipIcon(profileData.membershipType)
                        return <Icon className="w-8 h-8 mr-3" />
                      })()}
                      <div>
                        <h3 className="text-xl font-bold">
                          {profileData.membershipType === 'BASIC' ? 'Ahli Asas' :
                           profileData.membershipType === 'SILVER' ? 'Ahli Perak' :
                           profileData.membershipType === 'GOLD' ? 'Ahli Emas' : 'Ahli Platinum'}
                        </h3>
                        {profileData.membershipExpiry && (
                          <p className="text-sm opacity-75">
                            Tamat: {new Date(profileData.membershipExpiry).toLocaleDateString('ms-MY')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Options */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Naik Taraf Keahlian</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {membershipTiers
                      .filter(tier => tier.type !== profileData.membershipType)
                      .map((tier) => {
                        const Icon = getMembershipIcon(tier.type)
                        return (
                          <div key={tier.type} className={`p-4 rounded-lg border ${getMembershipColor(tier.type)}`}>
                            <div className="flex items-center mb-3">
                              <Icon className="w-6 h-6 mr-2" />
                              <div>
                                <h4 className="font-semibold">{tier.name}</h4>
                                <p className="text-sm opacity-75">{tier.price}</p>
                              </div>
                            </div>
                            <ul className="text-sm space-y-1 mb-4">
                              {tier.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center">
                                  <Check className="w-3 h-3 mr-2" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                            <button className="w-full px-4 py-2 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-75 transition-colors text-sm font-medium">
                              Naik Taraf
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Tukar Kata Laluan</h2>

                  <div className="max-w-md space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kata Laluan Semasa *
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kata Laluan Baru *
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Sekurang-kurangnya 6 aksara</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sahkan Kata Laluan Baru *
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <button
                      onClick={updatePassword}
                      disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      className="flex items-center px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {saving ? 'Menyimpan...' : 'Tukar Kata Laluan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}