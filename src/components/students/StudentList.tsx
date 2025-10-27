'use client'

import { useState, useEffect } from 'react'
import { Student, ClassLevel, CLASS_ORDER } from '@/types'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import ExportButton from '@/components/ui/ExportButton'

interface StudentListProps {
  onStudentSelect?: (student: Student) => void
  onStudentEdit?: (student: Student) => void
  onStudentDelete?: (student: Student) => void
}

interface FilterState {
  search: string
  className: ClassLevel | 'ALL'
  sortBy: 'name' | 'rollNumber' | 'className' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

export default function StudentList({ 
  onStudentSelect, 
  onStudentEdit, 
  onStudentDelete 
}: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    className: 'ALL',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.className !== 'ALL') params.append('className', filters.className)
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)
      
      const response = await fetch(`/api/students?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setStudents(result.data)
      } else {
        setError(result.error.message)
      }
    } catch (err) {
      setError('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [filters])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getFeeStatusBadge = (student: Student) => {
    // This is a placeholder - in a real app, you'd check the current month's fee status
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    // For now, we'll show a random status for demo purposes
    const isPaid = Math.random() > 0.3 // 70% chance of being paid
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        isPaid 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isPaid ? 'Paid' : 'Unpaid'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchStudents}
          className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          
          {/* Export Button */}
          <ExportButton
            type="students"
            className={filters.className !== 'ALL' ? filters.className : undefined}
            includeFees={true}
            variant="secondary"
            size="md"
          />
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={filters.className}
                onChange={(e) => handleFilterChange('className', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Classes</option>
                {CLASS_ORDER.map((classLevel) => (
                  <option key={classLevel} value={classLevel}>
                    {classLevel}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="rollNumber">Roll Number</option>
                <option value="className">Class</option>
                <option value="createdAt">Date Added</option>
              </select>
            </div>
            
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <button
                onClick={toggleSortOrder}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {students.length} student{students.length !== 1 ? 's' : ''} found
      </div>

      {/* Student List */}
      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No students found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onStudentSelect?.(student)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {student.name}
                    </h3>
                    {getFeeStatusBadge(student)}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Roll:</span> {student.rollNumber}
                    </div>
                    <div>
                      <span className="font-medium">Class:</span> {student.className}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {student.phoneNumber}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  {onStudentEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStudentEdit(student)
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  )}
                  {onStudentDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStudentDelete(student)
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}