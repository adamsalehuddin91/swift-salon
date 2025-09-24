"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Scissors,
  Star,
  Settings,
  LogOut,
  BarChart3
} from "lucide-react"

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Tempahan',
    href: '/admin/bookings',
    icon: Calendar
  },
  {
    name: 'Pelanggan',
    href: '/admin/customers',
    icon: Users
  },
  {
    name: 'Staff',
    href: '/admin/staff',
    icon: UserCheck
  },
  {
    name: 'Servis',
    href: '/admin/services',
    icon: Scissors
  },
  {
    name: 'Points',
    href: '/admin/points',
    icon: Star
  },
  {
    name: 'Laporan',
    href: '/admin/reports',
    icon: BarChart3
  },
  {
    name: 'Tetapan',
    href: '/admin/settings',
    icon: Settings
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="bg-white h-full w-64 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-rose-600">SwiftSalon</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                isActive ? 'bg-rose-50 text-rose-600 border-r-2 border-rose-600' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Keluar
        </button>
      </div>
    </div>
  )
}