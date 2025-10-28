import { NextRequest, NextResponse } from 'next/server'
import { studentSchema, queryParamsSchema } from '@/lib/validations'
import { studentStore } from '@/lib/data-store'
import { ClassLevel } from '@/types'

// GET /api/students - Retrieve students with filtering/sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())

    const validatedParams = queryParamsSchema.parse(params)

    const students = await studentStore.findAll({
      search: validatedParams.search,
      className: validatedParams.className as ClassLevel | undefined,
      sortBy: validatedParams.sortBy,
      sortOrder: validatedParams.sortOrder,
    })

    return NextResponse.json(
      {
        success: true,
        data: students,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching dashboard stats:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    })

    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = studentSchema.parse(body)

    // Check if roll number already exists
    const existingStudent = await studentStore.findByRollNumber(validatedData.rollNumber)
    if (existingStudent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_ROLL_NUMBER',
            message: 'A student with this roll number already exists',
          },
        },
        { status: 400 }
      )
    }

    const student = await studentStore.create(validatedData)

    return NextResponse.json(
      {
        success: true,
        data: student,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error fetching dashboard stats:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    })

    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}