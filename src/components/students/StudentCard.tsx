'use client'

import { Student } from '@/types'
import { Phone, Calendar, Edit, Trash2 } from 'lucide-react'

interface StudentCardProps {
  student: Student
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
  onClick?: (student: Student) => void
  showActions?: boolean
}

export default function StudentCard({ 
  student, 
  onEdit, 
  onDelete, 
  onClick,
  showActions = true 
}: StudentCardProps) {
  const getFeeStatusBadge = () => {
    // Placeholder logic - in real app, check current month's fee status
    // Use a deterministic approach based on student ID instead of Math.random()
    const isPaid = student.id.charCodeAt(0) % 3 !== 0 // Deterministic based on student ID
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
        isPaid 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isPaid ? 'Fee Paid' : 'Fee Pending'}
      </span>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 ${
        onClick ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : ''
      }`}
      onClick={() => onClick?.(student)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {student.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Roll: {student.rollNumber}
            </span>
            {getFeeStatusBadge()}
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1 ml-3">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(student)
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit student"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(student)
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete student"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Student Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium min-w-[60px]">Class:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
            {student.className}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{student.phoneNumber}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>Added: {formatDate(student.createdAt)}</span>
        </div>
      </div>

      {/* Quick Stats (placeholder) */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">This Year:</span>
            <div className="text-green-600">8 paid</div>
          </div>
          <div>
            <span className="font-medium">Pending:</span>
            <div className="text-red-600">4 months</div>
          </div>
        </div>
      </div>
    </div>
  )
}