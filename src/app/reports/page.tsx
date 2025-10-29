'use client'

import { useState } from 'react'
import { ClassLevel, CLASS_ORDER } from '@/types'
import { Calendar, FileText, Users } from 'lucide-react'
import ExportButton from '@/components/ui/ExportButton'

export default function ReportsPage() {
  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'ALL'>('ALL')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [includeFees, setIncludeFees] = useState(true)

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
          <p className="text-gray-600 mt-2">
            Generate and download reports for students, classes, and fee collections
          </p>
        </div>

        <div className="grid gap-8">
          {/* Quick Export Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">All Students</h3>
                  <p className="text-sm text-gray-600">Complete student database</p>
                </div>
              </div>
              <div className="space-y-3">
                <ExportButton
                  type="students"
                  includeFees={false}
                  label="Export Basic Info"
                  variant="secondary"
                  size="md"
                />
                <ExportButton
                  type="students"
                  includeFees={true}
                  label="Export with Fee Data"
                  variant="primary"
                  size="md"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Reports</h3>
                  <p className="text-sm text-gray-600">Fee collection by month</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-2 py-1 text-gray-500 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} className='text-gray-500' value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-2 py-1 text-gray-500 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {years.map((year) => (
                      <option key={year} className='text-gray-500' value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedClass !== 'ALL' && (
                  <ExportButton
                    type="class"
                    className={selectedClass}
                    month={selectedMonth}
                    year={selectedYear}
                    label={`Export ${selectedClass}`}
                    variant="primary"
                    size="md"
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Custom Reports</h3>
                  <p className="text-sm text-gray-600">Filtered by class and period</p>
                </div>
              </div>
              <div className="space-y-3">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as ClassLevel | 'ALL')}
                  className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Classes</option>
                  {CLASS_ORDER.map((classLevel) => (
                    <option key={classLevel} value={classLevel}>
                      {classLevel}
                    </option>
                  ))}
                </select>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeFees"
                    checked={includeFees}
                    onChange={(e) => setIncludeFees(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="includeFees" className="text-sm text-gray-700">
                    Include fee data
                  </label>
                </div>

                <ExportButton
                  type="students"
                  className={selectedClass !== 'ALL' ? selectedClass : undefined}
                  includeFees={includeFees}
                  label="Generate Report"
                  variant="primary"
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Class-wise Export */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Class-wise Reports</h2>
              <p className="text-gray-600 mt-1">Export individual class reports with fee details</p>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                {CLASS_ORDER.map((classLevel) => (
                  <div
                    key={classLevel}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">Class {classLevel}</h3>
                      <p className="text-sm text-gray-600">
                        Export all students and fee records for this class
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ExportButton
                        type="class"
                        className={classLevel}
                        month={selectedMonth}
                        year={selectedYear}
                        variant="secondary"
                        size="sm"
                        label="Monthly"
                      />
                      <ExportButton
                        type="class"
                        className={classLevel}
                        variant="primary"
                        size="sm"
                        label="All Records"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Report Information</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Student Reports:</strong> Include roll number, name, class, phone number, and optional fee summary</p>
              <p>• <strong>Class Reports:</strong> Include all students in a class with their fee payment status</p>
              <p>• <strong>Monthly Reports:</strong> Show fee collection status for a specific month and year</p>
              <p>• <strong>CSV Format:</strong> All reports are exported in CSV format for easy import into spreadsheet applications</p>
            </div>
          </div>
        </div>
      </div>
  )
}