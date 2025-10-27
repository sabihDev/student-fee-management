import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalStudents, currentMonthPayments, pendingPayments] = await Promise.all([
      prisma.student.count(),
      prisma.feeRecord.aggregate({
        where: {
          AND: [
            { paymentDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
            { paymentDate: { lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) } },
            { status: 'PAID' }
          ]
        },
        _sum: {
          amount: true
        }
      }),
      prisma.feeRecord.aggregate({
        where: {
          OR: [
            { status: 'PENDING' },
            { status: 'OVERDUE' }
          ]
        },
        _sum: {
          amount: true
        }
      })
    ])

    return NextResponse.json({
      totalStudents,
      currentMonthPayments: currentMonthPayments._sum.amount || 0,
      pendingPayments: pendingPayments._sum.amount || 0
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}