"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, User, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

     if (response.ok) {
    // Small delay to ensure cookie is set
    setTimeout(() => {
      router.push('/admin')
    }, 100) // <- Added missing comma and closing parenthesis
  } else {
    const error = await response.json()
    setError(error.message || 'Username atau password tidak betul')
  }
    } catch (error) {
      console.error('Login error:', error)
      setError('Ralat sambungan. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-rose-600 hover:text-rose-700 mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Kembali
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Kawasan Admin</h2>
          <p className="text-gray-600 text-sm">
            Sila log masuk untuk mengakses dashboard admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Masukkan username"
              />
            </div>
          </div>


          <button
            type="submit"
            disabled={loading || !formData.email}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : null}
            {loading ? 'Memeriksa...' : 'Log Masuk'}
          </button>
        </form>

      </div>
    </div>
  )
}
