import { NextRequest, NextResponse } from 'next/server'
import { studentStore, feeStore } from '@/lib/data-store'
import { ClassLevel } from '@/types'

// GET /api/reports/class/[className] - Generate class report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ className: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    const { className: classNameParam } = await params
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
        success: true,
        data: {
          className,
          totalStudents: 0,
          paidStudents: 0,
          unpaidStudents: 0,
          students: [],
          summary: {
            totalAmount: 0,
            collectedAmount: 0,
            pendingAmount: 0
          }
        }
      })
    }
    
    // If month and year are provided, get fee records for that period
    let feeRecords: any[] = []
    if (month && year) {
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)
      
      if (monthNum >= 1 && monthNum <= 12 && yearNum >= 2020) {
        for (const student of classStudents) {
          const studentFees = await feeStore.findByStudentId(student.id)
          const monthlyFee = studentFees.find(f => f.month === monthNum && f.year === yearNum)
          feeRecords.push({
            student,
            feeRecord: monthlyFee || null
          })
        }
      }
    } else {
      // Get all fee records for students in the class
      for (const student of classStudents) {
        const studentFees = await feeStore.findByStudentId(student.id)
        feeRecords.push({
          student,
          feeRecords: studentFees
        })
      }
    }
    
    // Calculate statistics
    let paidStudents = 0
    let totalAmount = 0
    let collectedAmount = 0
    
    if (month && year) {
      // Statistics for specific month
      feeRecords.forEach(record => {
        if (record.feeRecord) {
          totalAmount += record.feeRecord.amount
          if (record.feeRecord.status === 'PAID') {
            paidStudents++
            collectedAmount += record.feeRecord.amount
          }
        }
      })
    } else {
      // Overall statistics
      feeRecords.forEach(record => {
        const paidFees = record.feeRecords.filter((f: any) => f.status === 'PAID')
        if (paidFees.length > 0) {
          paidStudents++
        }
        record.feeRecords.forEach((f: any) => {
          totalAmount += f.amount
          if (f.status === 'PAID') {
            collectedAmount += f.amount
          }
        })
      })
    }
    
    const report = {
      className,
      totalStudents: classStudents.length,
      paidStudents,
      unpaidStudents: classStudents.length - paidStudents,
      students: feeRecords,
      summary: {
        totalAmount,
        collectedAmount,
        pendingAmount: totalAmount - collectedAmount
      },
      generatedAt: new Date().toISOString(),
      period: month && year ? { month: parseInt(month), year: parseInt(year) } : null
    }
    
    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Error generating class report:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: 'Failed to generate class report',
        details: error
      }
    }, { status: 500 })
  }
}