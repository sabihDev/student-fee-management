'use client'

import { useState } from 'react'
import { Student } from '@/types'
import StudentList from '@/components/students/StudentList'
import StudentForm from '@/components/students/StudentForm'
import StudentDetails from '@/components/students/StudentDetails'
import { Plus, ArrowLeft } from 'lucide-react'

type ViewMode = 'list' | 'add' | 'edit' | 'details'

export default function StudentsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    console.log('Connected to:', process.env.DATABASE_URL)


    const handleAddStudent = async (data: any) => {
        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (result.success) {
                setViewMode('list')
                setRefreshKey(prev => prev + 1) // Trigger refresh
                alert('Student added successfully!')
            } else {
                throw new Error(result.error.message)
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to add student')
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
                setViewMode('list')
                setSelectedStudent(null)
                setRefreshKey(prev => prev + 1) // Trigger refresh
                alert('Student updated successfully!')
            } else {
                throw new Error(result.error.message)
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update student')
        }
    }

    const handleDeleteStudent = async (student: Student) => {
        if (!confirm(`Are you sure you want to delete ${student.name}? This will also delete all their fee records.`)) {
            return
        }

        try {
            const response = await fetch(`/api/students/${student.id}`, {
                method: 'DELETE',
            })

            const result = await response.json()

            if (result.success) {
                setRefreshKey(prev => prev + 1) // Trigger refresh
                alert('Student deleted successfully!')
            } else {
                throw new Error(result.error.message)
            }
        } catch (error: any) {
            alert(`Failed to delete student: ${error.message}`)
        }
    }

    const renderHeader = () => {
        switch (viewMode) {
            case 'add':
                return (
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setViewMode('list')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
                    </div>
                )
            case 'edit':
                return (
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => {
                                setViewMode('list')
                                setSelectedStudent(null)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
                    </div>
                )
            case 'details':
                return null // StudentDetails component handles its own header
            default:
                return (
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                        <button
                            onClick={() => setViewMode('add')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add Student
                        </button>
                    </div>
                )
        }
    }

    const renderContent = () => {
        switch (viewMode) {
            case 'add':
                return (
                    <StudentForm
                        onSubmit={handleAddStudent}
                        onCancel={() => setViewMode('list')}
                    />
                )
            case 'edit':
                return selectedStudent ? (
                    <StudentForm
                        initialData={selectedStudent}
                        onSubmit={handleEditStudent}
                        onCancel={() => {
                            setViewMode('list')
                            setSelectedStudent(null)
                        }}
                    />
                ) : null
            case 'details':
                return selectedStudent ? (
                    <StudentDetails
                        student={selectedStudent}
                        onEdit={(student) => {
                            setSelectedStudent(student)
                            setViewMode('edit')
                        }}
                        onBack={() => {
                            setViewMode('list')
                            setSelectedStudent(null)
                        }}
                    />
                ) : null
            default:
                return (
                    <StudentList
                        key={refreshKey} // Force re-render when refreshKey changes
                        onStudentSelect={(student) => {
                            setSelectedStudent(student)
                            setViewMode('details')
                        }}
                        onStudentEdit={(student) => {
                            setSelectedStudent(student)
                            setViewMode('edit')
                        }}
                        onStudentDelete={handleDeleteStudent}
                    />
                )
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderHeader()}
            {renderContent()}
        </div>
    )
}