import { NextRequest, NextResponse } from 'next/server'
import { updateStudentSchema } from '@/lib/validations'
import { studentStore } from '@/lib/data-store'

// GET /api/students/[id] - Get student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    
    return NextResponse.json({
      success: true,
      data: student
    })
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch student',
        details: error
      }
    }, { status: 500 })
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateStudentSchema.parse(body)
    
    // Check if roll number already exists (if being updated)
    if (validatedData.rollNumber) {
      const existingStudent = await studentStore.findByRollNumber(validatedData.rollNumber)
      if (existingStudent && existingStudent.id !== id) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'DUPLICATE_ROLL_NUMBER',
            message: 'A student with this roll number already exists'
          }
        }, { status: 400 })
      }
    }
    
    const student = await studentStore.update(id, validatedData)
    
    if (!student) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Student not found'
        }
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: student
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update student',
        details: error
      }
    }, { status: 500 })
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await studentStore.delete(id)
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Student not found'
        }
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { message: 'Student deleted successfully' }
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete student',
        details: error
      }
    }, { status: 500 })
  }
}