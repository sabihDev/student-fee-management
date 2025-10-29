'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAppState } from '@/context/AppStateProvider'
import ClassOverview from '@/components/classes/ClassOverview'
import { ClassLevel } from '@/types'

interface DashboardStats {
  totalStudents: number
  currentMonthPayments: number
  pendingPayments: number
}

export default function Home() {
  const router = useRouter()
  const { dashboard, dashboardStatus, fetchDashboard } = useAppState()
  const [stats] = useState<DashboardStats>({
    totalStudents: 0,
    currentMonthPayments: 0,
    pendingPayments: 0
  })
  console.log('Connected to:', process.env.POSTGRES_URL ?? 'No database URL found')

  const [loading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleClassSelect = (className: ClassLevel) => {
    router.push(`/classes/${encodeURIComponent(className)}`)
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student Fee Management System
          </h1>
          <p className="text-lg text-gray-600">
            Manage student information and track monthly fee payments
          </p>
        </div>

        {/* Simple dashboard stats preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-blue-600">{dashboard?.totalStudents ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Payments (This Month)</p>
            <p className="text-2xl font-bold text-green-600">{dashboard?.currentMonthPayments ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-red-600">{dashboard?.pendingPayments ?? 0}</p>
          </div>
        </div>


        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/students" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Students</h3>
              <p className="text-gray-600 mb-4">
                Add, edit, and view student information. Track individual fee records and payment history.
              </p>
              <div className="text-blue-600 font-medium">View Students →</div>
            </div>
          </Link>

          <Link href="/classes" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Class Overview</h3>
              <p className="text-gray-600 mb-4">
                View students organized by class levels. Generate reports and export data as CSV files.
              </p>
              <div className="text-blue-600 font-medium">View Classes →</div>
            </div>
          </Link>
        </div>

        {/* Class Overview Section */}
        <div className="mt-8">
          <ClassOverview onClassSelect={handleClassSelect} />
        </div>
      </div>
  )
}