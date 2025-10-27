import { NextRequest, NextResponse } from 'next/server'
import { feeRecordSchema } from '@/lib/validations'
import { studentStore, feeStore } from '@/lib/data-store'

// GET /api/students/[id]/fees - Get student fee history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if student exists
    const student = await studentStore.findById(id)
    if (!student) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Student not found'
        }
      }, { status: 404 })
    }
    
    const feeRecords = await feeStore.findByStudentId(id)
    
    return NextResponse.json({
      success: true,
      data: feeRecords
    })
  } catch (error) {
    console.error('Error fetching fee records:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch fee records',
        details: error
      }
    }, { status: 500 })
  }
}

// POST /api/students/[id]/fees - Record fee payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if student exists
    const student = await studentStore.findById(id)
    if (!student) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Student not found'
        }
      }, { status: 404 })
    }
    
    const body = await request.json()
    
    // Transform and validate the data
    const dataToValidate = {
      ...body,
      studentId: id,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : null
    }
    
    const validatedData = feeRecordSchema.parse(dataToValidate)
    
    // Check if fee record already exists for this month/year
    const existingRecords = await feeStore.findByStudentId(id)
    const existingRecord = existingRecords.find(
      r => r.month === validatedData.month && r.year === validatedData.year
    )
    
    if (existingRecord) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DUPLICATE_RECORD',
          message: 'Fee record already exists for this month and year'
        }
      }, { status: 400 })
    }
    
    const feeRecord = await feeStore.create(validatedData)
    
    return NextResponse.json({
      success: true,
      data: feeRecord
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating fee record:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create fee record',
        details: error
      }
    }, { status: 500 })
  }
}