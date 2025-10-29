'use client'

import { useState, useEffect } from 'react'
import { Student, FeeRecord } from '@/types'
import { Phone, Calendar, Edit, ArrowLeft, CreditCard } from 'lucide-react'
import FeeTracker from '@/components/fees/FeeTracker'
import FeeHistory from '@/components/fees/FeeHistory'

interface StudentDetailsProps {
  student: Student
  onEdit?: (student: Student) => void
  onBack?: () => void
}

export default function StudentDetails({ student, onEdit, onBack }: StudentDetailsProps) {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeeRecords()
  }, [student.id])

  const fetchFeeRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/students/${student.id}/fees`)
      const result = await response.json()
      
      if (result.success) {
        setFeeRecords(result.data)
      } else {
        setError(result.error.message)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch fee records'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1]
  }

  const calculateStats = () => {
    const totalPaid = feeRecords.filter(f => f.status === 'PAID').length
    const totalAmount = feeRecords.reduce((sum, f) => sum + f.amount, 0)
    const paidAmount = feeRecords
      .filter(f => f.status === 'PAID')
      .reduce((sum, f) => sum + f.amount, 0)
    
    return {
      totalRecords: feeRecords.length,
      totalPaid,
      totalPending: feeRecords.length - totalPaid,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount
    }
  }

  const stats = calculateStats()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
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
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600">Roll Number: {student.rollNumber}</p>
            </div>
          </div>
          
          {onEdit && (
            <button
              onClick={() => onEdit(student)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              Edit Student
            </button>
          )}
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Class:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
              {student.className}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{student.phoneNumber}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Added: {formatDate(student.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Fee Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Fees</p>
              <p className="text-xl font-semibold text-green-600">
                {stats.totalPaid} / {stats.totalRecords}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-xl font-semibold text-blue-600">
                {formatCurrency(stats.paidAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-xl font-semibold text-red-600">
                {formatCurrency(stats.pendingAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Tracker */}
      <FeeTracker 
        studentId={student.id} 
        onFeeUpdate={fetchFeeRecords}
      />

      {/* Fee History */}
      <FeeHistory studentId={student.id} />
    </div>
  )
}