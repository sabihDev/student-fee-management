import { NextRequest, NextResponse } from 'next/server'
import { feeStore } from '@/lib/data-store'

// PUT /api/fees/[id] - Update fee record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    
    // Validate the update data
    const allowedFields = ['amount', 'paymentDate', 'status']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    // Convert paymentDate string to Date if provided
    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate)
    }
    
    // Validate status if provided
    if (updateData.status && !['PAID', 'UNPAID'].includes(updateData.status)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Status must be either PAID or UNPAID'
        }
      }, { status: 400 })
    }
    
    const { id } = await params
    const feeRecord = await feeStore.update(id, updateData)
    
    if (!feeRecord) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Fee record not found'
        }
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: feeRecord
    })
  } catch (error) {
    console.error('Error updating fee record:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update fee record',
        details: error
      }
    }, { status: 500 })
  }
}

// GET /api/fees/[id] - Get fee record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const feeRecord = await feeStore.findById(id)
    
    if (!feeRecord) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Fee record not found'
        }
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: feeRecord
    })
  } catch (error) {
    console.error('Error fetching fee record:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch fee record',
        details: error
      }
    }, { status: 500 })
  }
}