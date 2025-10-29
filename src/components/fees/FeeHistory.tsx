'use client'

import { useState, useEffect } from 'react'
import { FeeRecord } from '@/types'
import { Calendar, Filter, Download, Search } from 'lucide-react'

interface FeeHistoryProps {
  studentId: string
  showFilters?: boolean
}

interface FilterState {
  year: number | 'ALL'
  status: 'PAID' | 'UNPAID' | 'ALL'
  startDate: string
  endDate: string
}

export default function FeeHistory({ studentId, showFilters = true }: FeeHistoryProps) {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    year: 'ALL',
    status: 'ALL',
    startDate: '',
    endDate: ''
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  useEffect(() => {
    fetchFeeRecords()
  }, [studentId])

  useEffect(() => {
    applyFilters()
  }, [feeRecords, filters])

  const fetchFeeRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/students/${studentId}/fees`)
      const result = await response.json()
      
      if (result.success) {
        setFeeRecords(result.data)
      } else {
        setError(result.error.message)
      }
    } catch (err) {
      setError('Failed to fetch fee records')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...feeRecords]

    // Filter by year
    if (filters.year !== 'ALL') {
      filtered = filtered.filter(record => record.year === filters.year)
    }

    // Filter by status
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(record => record.status === filters.status)
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate)
      filtered = filtered.filter(record => {
        const recordDate = record.paymentDate ? new Date(record.paymentDate) : new Date(record.createdAt)
        return recordDate >= startDate
      })
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      filtered = filtered.filter(record => {
        const recordDate = record.paymentDate ? new Date(record.paymentDate) : new Date(record.createdAt)
        return recordDate <= endDate
      })
    }

    // Sort by year and month (most recent first)
    filtered.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    setFilteredRecords(filtered)
  }

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      year: 'ALL',
      status: 'ALL',
      startDate: '',
      endDate: ''
    })
  }

  const exportToCSV = () => {
    const headers = ['Month', 'Year', 'Amount', 'Status', 'Payment Date', 'Created Date']
    const csvData = filteredRecords.map(record => [
      getMonthName(record.month),
      record.year,
      record.amount,
      record.status,
      record.paymentDate ? formatDate(record.paymentDate) : 'N/A',
      formatDate(record.createdAt)
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fee-history-${studentId}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const calculateSummary = () => {
    const totalRecords = filteredRecords.length
    const paidRecords = filteredRecords.filter(r => r.status === 'PAID')
    const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0)
    const paidAmount = paidRecords.reduce((sum, r) => sum + r.amount, 0)

    return {
      totalRecords,
      paidRecords: paidRecords.length,
      unpaidRecords: totalRecords - paidRecords.length,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount
    }
  }

  const summary = calculateSummary()

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
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Fee History</h3>
          <div className="flex items-center gap-2">
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.paidRecords}</div>
            <div className="text-sm text-gray-600">Paid ({formatCurrency(summary.paidAmount)})</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.unpaidRecords}</div>
            <div className="text-sm text-gray-600">Unpaid ({formatCurrency(summary.pendingAmount)})</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.totalRecords}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="p-6">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No fee records found matching your criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'PAID' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {getMonthName(record.month)} {record.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount: {formatCurrency(record.amount)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    record.status === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                  {record.paymentDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Paid: {formatDate(record.paymentDate)}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {formatDate(record.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}