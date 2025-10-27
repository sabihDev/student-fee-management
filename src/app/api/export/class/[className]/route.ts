import { NextRequest, NextResponse } from 'next/server'
import { studentStore, feeStore } from '@/lib/data-store'
import { ClassLevel } from '@/types'

// GET /api/export/class/[className] - Export class report as CSV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ className: string }> }
) {
  try {
    const { className: classNameParam } = await params
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Validate className
    const className = decodeURIComponent(classNameParam) as ClassLevel
    if (!Object.values(ClassLevel).includes(className)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CLASS',
          message: 'Invalid class name'
        }
      }, { status: 400 })
    }

    // Get all students in the class
    const classStudents = await studentStore.findAll({ className })

    if (classStudents.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_DATA',
          message: 'No students found in this class'
        }
      }, { status: 404 })
    }

    // Prepare CSV headers
    const headers = [
      'Roll Number',
      'Name',
      'Phone Number',
      'Fee Status',
      'Amount',
      'Payment Date',
      'Created Date'
    ]

    // Prepare CSV data
    const csvData = []
    
    for (const student of classStudents) {
      const feeRecords = await feeStore.findByStudentId(student.id)
      
      if (month && year) {
        // Export specific month data
        const monthNum = parseInt(month)
        const yearNum = parseInt(year)
        const monthlyFee = feeRecords.find(f => f.month === monthNum && f.year === yearNum)
        
        csvData.push([
          student.rollNumber,
          student.name,
          student.phoneNumber,
          monthlyFee ? monthlyFee.status : 'NO RECORD',
          monthlyFee ? monthlyFee.amount.toFixed(2) : '0.00',
          monthlyFee?.paymentDate ? new Date(monthlyFee.paymentDate).toLocaleDateString() : 'N/A',
          new Date(student.createdAt).toLocaleDateString()
        ])
      } else {
        // Export all fee records for each student
        if (feeRecords.length === 0) {
          csvData.push([
            student.rollNumber,
            student.name,
            student.phoneNumber,
            'NO RECORDS',
            '0.00',
            'N/A',
            new Date(student.createdAt).toLocaleDateString()
          ])
        } else {
          feeRecords.forEach(record => {
            csvData.push([
              student.rollNumber,
              student.name,
              student.phoneNumber,
              record.status,
              record.amount.toFixed(2),
              record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'N/A',
              new Date(student.createdAt).toLocaleDateString()
            ])
          })
        }
      }
    }

    // Generate CSV content
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const periodSuffix = month && year ? `-${year}-${month.padStart(2, '0')}` : ''
    const filename = `class-${className.replace(' ', '-')}${periodSuffix}-${timestamp}.csv`

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting class report:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export class report',
        details: error
      }
    }, { status: 500 })
  }
}