'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema, type StudentFormData } from '@/lib/validations'
import { ClassLevel, CLASS_ORDER } from '@/types'

interface StudentFormProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function StudentForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: StudentFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
  })

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while saving the student')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {initialData ? 'Edit Student' : 'Add New Student'}
      </h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-dark">
        {/* Roll Number */}
        <div>
          <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Roll Number *
          </label>
          <input
            {...register('rollNumber')}
            type="text"
            id="rollNumber"
            className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter roll number"
          />
          {errors.rollNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.rollNumber.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-3 py-2  text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter student name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Class Name */}
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
            Class *
          </label>
          <select
            {...register('className')}
            id="className"
            className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a class</option>
            {CLASS_ORDER.map((classLevel) => (
              <option key={classLevel} value={classLevel}>
                {classLevel}
              </option>
            ))}
          </select>
          {errors.className && (
            <p className="mt-1 text-sm text-red-600">{errors.className.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            {...register('phoneNumber')}
            type="tel"
            id="phoneNumber"
            className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter phone number"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? 'Saving...' : (initialData ? 'Update Student' : 'Add Student')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}