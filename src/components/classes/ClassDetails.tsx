'use client'

import { useState, useEffect } from 'react'
import { ClassLevel, Student } from '@/types'
import { ArrowLeft, Users, DollarSign, CheckCircle, XCircle, Calendar } from 'lucide-react'
import StudentCard from '@/components/students/StudentCard'
import ExportButton from '@/components/ui/ExportButton'

interface ClassDetailsProps {
  className: ClassLevel
  onBack?: () => void
  onStudentSelect?: (student: Student) => void
  onStudentEdit?: (student: Student) => void
  onStudentDelete?: (student: Student) => void
}

interface ClassStats {
  totalStudents: number
  paidStudents: number
  unpaidStudents: number
  totalAmount: number
  collectedAmount: number
  pendingAmount: number
}

export default function ClassDetails({
  className,
  onBack,
  onStudentSelect,
  onStudentEdit,
  onStudentDelete
}: ClassDetailsProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  useEffect(() => {
    fetchClassStudents()
  }, [className])

  const fetchClassStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/students?className=${encodeURIComponent(className)}`)
      const result = await response.json()
      
      if (result.success) {
        setStudents(result.data)
      } else {
        setError(result.error.message)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch class students'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (): ClassStats => {
    // Mock calculation - in real app, you'd fetch actual fee records
    const totalStudents = students.length
    const paidStudents = Math.floor(totalStudents * 0.7) // 70% paid (mock)
    const unpaidStudents = totalStudents - paidStudents
    const totalAmount = totalStudents * 1000 // $1000 per student
    const collectedAmount = paidStudents * 1000
    const pendingAmount = totalAmount - collectedAmount

    return {
      totalStudents,
      paidStudents,
      unpaidStudents,
      totalAmount,
      collectedAmount,
      pendingAmount
    }
  }

  const stats = calculateStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchClassStudents}
            className="text-sm text-red-800 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class {className}</h1>
            <p className="text-gray-600">{stats.totalStudents} students enrolled</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton
            type="class"
            className={className}
            month={selectedMonth}
            year={selectedYear}
            variant="secondary"
            label="Export Monthly"
          />
          <ExportButton
            type="class"
            className={className}
            variant="primary"
            label="Export All"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fees Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paidStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fees Pending</p>
              <p className="text-2xl font-bold text-red-600">{stats.unpaidStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalStudents > 0 ? ((stats.paidStudents / stats.totalStudents) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Expected</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Amount Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.collectedAmount)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Amount Pending</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.pendingAmount)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Collection Progress</span>
            <span>{stats.totalStudents > 0 ? ((stats.paidStudents / stats.totalStudents) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{
                width: `${stats.totalStudents > 0 ? (stats.paidStudents / stats.totalStudents) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Period Selector for Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Report Period:</span>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Students in Class {className}</h2>
        </div>

        <div className="p-6">
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found in this class.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={onStudentSelect}
                  onEdit={onStudentEdit}
                  onDelete={onStudentDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}