'use client'

import { useState, useEffect } from 'react'
import { ClassLevel, CLASS_ORDER, Student } from '@/types'
import { Users, DollarSign, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ExportButton from '@/components/ui/ExportButton'

interface ClassSummary {
  className: ClassLevel
  totalStudents: number
  paidStudents: number
  unpaidStudents: number
  totalAmount: number
  collectedAmount: number
}

interface ClassOverviewProps {
  onClassSelect?: (className: ClassLevel) => void
}

export default function ClassOverview({ onClassSelect }: ClassOverviewProps) {
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClassSummaries()
  }, [])

  const fetchClassSummaries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all students first
      const studentsResponse = await fetch('/api/students')
      const studentsResult = await studentsResponse.json()
      
      if (!studentsResult.success) {
        throw new Error(studentsResult.error.message)
      }

      const students: Student[] = studentsResult.data
      
      // Group students by class and calculate summaries
      const summaries: ClassSummary[] = []
      
      for (const classLevel of CLASS_ORDER) {
        const classStudents = students.filter(s => s.className === classLevel)
        
        if (classStudents.length > 0) {
          // For now, we'll use mock data for fee calculations
          // In a real implementation, you'd fetch fee records for each student
          const paidStudents = Math.floor(classStudents.length * 0.7) // 70% paid (mock)
          const unpaidStudents = classStudents.length - paidStudents
          const totalAmount = classStudents.length * 1000 // $1000 per student (mock)
          const collectedAmount = paidStudents * 1000
          
          summaries.push({
            className: classLevel,
            totalStudents: classStudents.length,
            paidStudents,
            unpaidStudents,
            totalAmount,
            collectedAmount
          })
        }
      }
      
      setClassSummaries(summaries)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch class summaries'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateOverallStats = () => {
    const totalStudents = classSummaries.reduce((sum, c) => sum + c.totalStudents, 0)
    const totalPaid = classSummaries.reduce((sum, c) => sum + c.paidStudents, 0)
    const totalAmount = classSummaries.reduce((sum, c) => sum + c.totalAmount, 0)
    const totalCollected = classSummaries.reduce((sum, c) => sum + c.collectedAmount, 0)
    
    return {
      totalStudents,
      totalPaid,
      totalUnpaid: totalStudents - totalPaid,
      totalAmount,
      totalCollected,
      totalPending: totalAmount - totalCollected,
      collectionRate: totalStudents > 0 ? (totalPaid / totalStudents) * 100 : 0
    }
  }

  const overallStats = calculateOverallStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600 mb-2">{error}</p>
        <button 
          onClick={fetchClassSummaries}
          className="text-sm text-red-800 hover:text-red-900 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{overallStats.totalStudents}</p>
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
              <p className="text-2xl font-bold text-green-600">{overallStats.totalPaid}</p>
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
              <p className="text-2xl font-bold text-red-600">{overallStats.totalUnpaid}</p>
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
              <p className="text-2xl font-bold text-purple-600">{overallStats.collectionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class-wise Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Classes Overview</h2>
          <p className="text-gray-600 mt-1">Students organized by class levels from lowest to highest</p>
        </div>

        <div className="p-6">
          {classSummaries.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No students have been added yet.</p>
              <Link 
                href="/students"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add First Student
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {classSummaries.map((summary) => (
                <div
                  key={summary.className}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onClassSelect?.(summary.className)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Class {summary.className}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {summary.totalStudents} students
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Paid:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {summary.paidStudents}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Unpaid:</span>
                          <span className="ml-1 font-medium text-red-600">
                            {summary.unpaidStudents}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Collected:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {formatCurrency(summary.collectedAmount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Pending:</span>
                          <span className="ml-1 font-medium text-red-600">
                            {formatCurrency(summary.totalAmount - summary.collectedAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Payment Progress</span>
                          <span>{((summary.paidStudents / summary.totalStudents) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(summary.paidStudents / summary.totalStudents) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center gap-2">
                      <ExportButton
                        type="class"
                        className={summary.className}
                        variant="secondary"
                        size="sm"
                        label="Export"
                      />
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}