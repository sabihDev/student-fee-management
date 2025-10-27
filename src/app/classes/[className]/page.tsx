'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ClassLevel, Student } from '@/types'
import ClassDetails from '@/components/classes/ClassDetails'
import StudentDetails from '@/components/students/StudentDetails'
import StudentForm from '@/components/students/StudentForm'

type ViewMode = 'class' | 'student' | 'edit'

export default function ClassDetailPage() {
  const router = useRouter()
  const params = useParams()
  const className = decodeURIComponent(params.className as string) as ClassLevel
  
  const [viewMode, setViewMode] = useState<ViewMode>('class')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setViewMode('student')
  }

  const handleStudentEdit = (student: Student) => {
    setSelectedStudent(student)
    setViewMode('edit')
  }

  const handleStudentDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}? This will also delete all their fee records.`)) {
      return
    }

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('Student deleted successfully!')
        // Refresh the class view
        setViewMode('class')
        setSelectedStudent(null)
      } else {
        throw new Error(result.error.message)
      }
    } catch (error: any) {
      alert(`Failed to delete student: ${error.message}`)
    }
  }

  const handleEditStudent = async (data: any) => {
    if (!selectedStudent) return

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setViewMode('class')
        setSelectedStudent(null)
        alert('Student updated successfully!')
      } else {
        throw new Error(result.error.message)
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update student')
    }
  }

  const handleBack = () => {
    if (viewMode === 'student' || viewMode === 'edit') {
      setViewMode('class')
      setSelectedStudent(null)
    } else {
      router.push('/classes')
    }
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'student':
        return selectedStudent ? (
          <StudentDetails
            student={selectedStudent}
            onEdit={handleStudentEdit}
            onBack={handleBack}
          />
        ) : null

      case 'edit':
        return selectedStudent ? (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <StudentForm
                initialData={selectedStudent}
                onSubmit={handleEditStudent}
                onCancel={handleBack}
              />
            </div>
          </div>
        ) : null

      default:
        return (
          <ClassDetails
            className={className}
            onBack={handleBack}
            onStudentSelect={handleStudentSelect}
            onStudentEdit={handleStudentEdit}
            onStudentDelete={handleStudentDelete}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  )
}