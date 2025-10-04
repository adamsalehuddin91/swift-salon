"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, Mail, User } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email atau kata laluan tidak sah')
      } else {
        // Check session and redirect to customer dashboard
        const session = await getSession()
        if (session) {
          // Check if user is admin or customer
          if (session.user?.role === 'ADMIN') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      setError('Ralat sistem. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Log Masuk Pelanggan</h1>
          <p className="text-gray-600">SwiftSalon Muslimah</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Kata Laluan
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Sedang masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Belum ada akaun?{' '}
            <Link href="/membership" className="text-amber-600 hover:text-amber-700 font-medium">
              Daftar sebagai ahli
            </Link>
          </p>
        </div>

        {/* Admin Login Link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Kakitangan?{' '}
            <Link href="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log masuk admin
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-amber-600 hover:text-amber-700 text-sm flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Laman Utama
          </Link>
        </div>
      </div>
    </div>
  )
}