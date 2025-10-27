import { NextRequest, NextResponse } from 'next/server'
import { studentStore, feeStore } from '@/lib/data-store'
import { ClassLevel } from '@/types'

// GET /api/export/students - Export student data as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('className') as ClassLevel | null
    const includeFeesParam = searchParams.get('includeFees')
    const includeFees = includeFeesParam === 'true'

    // Fetch students with optional class filter
    const students = await studentStore.findAll(
      className ? { className } : undefined
    )

    if (students.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_DATA',
          message: 'No students found to export'
        }
      }, { status: 404 })
    }

    // Prepare CSV headers
    const headers = [
      'Roll Number',
      'Name',
      'Class',
      'Phone Number',
      'Created Date'
    ]

    if (includeFees) {
      headers.push(
        'Total Fee Records',
        'Paid Records',
        'Unpaid Records',
        'Total Amount',
        'Paid Amount',
        'Pending Amount'
      )
    }

    // Prepare CSV data
    const csvData = []
    
    for (const student of students) {
      const row = [
        student.rollNumber,
        student.name,
        student.className,
        student.phoneNumber,
        new Date(student.createdAt).toLocaleDateString()
      ]

      if (includeFees) {
        const feeRecords = await feeStore.findByStudentId(student.id)
        const paidRecords = feeRecords.filter(f => f.status === 'PAID')
        const totalAmount = feeRecords.reduce((sum, f) => sum + f.amount, 0)
        const paidAmount = paidRecords.reduce((sum, f) => sum + f.amount, 0)

        row.push(
          feeRecords.length.toString(),
          paidRecords.length.toString(),
          (feeRecords.length - paidRecords.length).toString(),
          totalAmount.toFixed(2),
          paidAmount.toFixed(2),
          (totalAmount - paidAmount).toFixed(2)
        )
      }

      csvData.push(row)
    }

    // Generate CSV content
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const classFilter = className ? `-${className.replace(' ', '-')}` : ''
    const filename = `students${classFilter}-${timestamp}.csv`

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting students:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export student data',
        details: error
      }
    }, { status: 500 })
  }
}