'use client'

import { useState, useEffect } from 'react'
import { FeeRecord } from '@/types'
import { Check, X, Calendar } from 'lucide-react'

interface FeeTrackerProps {
  studentId: string
  year?: number
  onFeeUpdate?: () => void
}

export default function FeeTracker({ studentId, year = new Date().getFullYear(), onFeeUpdate }: FeeTrackerProps) {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingMonth, setUpdatingMonth] = useState<number | null>(null)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchFeeRecords()
  }, [studentId, year])

  const fetchFeeRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/students/${studentId}/fees`)
      const result = await response.json()
      
      if (result.success) {
        setFeeRecords(result.data.filter((record: FeeRecord) => record.year === year))
      } else {
        setError(result.error.message)
      }
    } catch (err) {
      setError('Failed to fetch fee records')
    } finally {
      setLoading(false)
    }
  }

  const getFeeRecordForMonth = (month: number): FeeRecord | null => {
    return feeRecords.find(record => record.month === month) || null
  }

  const toggleFeeStatus = async (month: number) => {
    const existingRecord = getFeeRecordForMonth(month)
    setUpdatingMonth(month)

    try {
      if (existingRecord) {
        // Update existing record
        const newStatus = existingRecord.status === 'PAID' ? 'UNPAID' : 'PAID'
        const response = await fetch(`/api/fees/${existingRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            paymentDate: newStatus === 'PAID' ? new Date().toISOString() : null
          }),
        })

        const result = await response.json()
        if (result.success) {
          await fetchFeeRecords()
          onFeeUpdate?.()
        } else {
          throw new Error(result.error.message)
        }
      } else {
        // Create new record
        const response = await fetch(`/api/students/${studentId}/fees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            month,
            year,
            amount: 1000, // Default amount - should be configurable
            status: 'PAID',
            paymentDate: new Date().toISOString()
          }),
        })

        const result = await response.json()
        if (result.success) {
          await fetchFeeRecords()
          onFeeUpdate?.()
        } else {
          throw new Error(result.error.message)
        }
      }
    } catch (error: any) {
      alert(`Failed to update fee: ${error.message}`)
    } finally {
      setUpdatingMonth(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchFeeRecords}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Fee Tracker - {year}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Click to toggle payment status</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((monthName, index) => {
            const monthNumber = index + 1
            const feeRecord = getFeeRecordForMonth(monthNumber)
            const isPaid = feeRecord?.status === 'PAID'
            const isCurrentMonth = monthNumber === currentMonth && year === currentYear
            const isUpdating = updatingMonth === monthNumber

            return (
              <div
                key={monthNumber}
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isPaid
                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                } ${isCurrentMonth ? 'ring-2 ring-blue-300' : ''}`}
                onClick={() => !isUpdating && toggleFeeStatus(monthNumber)}
              >
                {isUpdating && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{monthName}</h4>
                  <div className={`p-1 rounded-full ${
                    isPaid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {isPaid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      isPaid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  {feeRecord && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatCurrency(feeRecord.amount)}</span>
                      </div>

                      {feeRecord.paymentDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid on:</span>
                          <span className="font-medium">{formatDate(feeRecord.paymentDate)}</span>
                        </div>
                      )}
                    </>
                  )}

                  {!feeRecord && (
                    <div className="text-gray-500 text-xs">
                      Click to mark as paid
                    </div>
                  )}
                </div>

                {isCurrentMonth && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Current
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {feeRecords.filter(r => r.status === 'PAID').length}
              </div>
              <div className="text-sm text-gray-600">Months Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {12 - feeRecords.filter(r => r.status === 'PAID').length}
              </div>
              <div className="text-sm text-gray-600">Months Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(feeRecords.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}