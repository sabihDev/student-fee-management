'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClassLevel } from '@/types'
import ClassOverview from '@/components/classes/ClassOverview'

export default function ClassesPage() {
  const router = useRouter()

  const handleClassSelect = (className: ClassLevel) => {
    router.push(`/classes/${encodeURIComponent(className)}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-2">
            Overview of all classes with student counts and fee collection statistics
          </p>
        </div>
        
        <ClassOverview onClassSelect={handleClassSelect} />
      </div>
  )
}