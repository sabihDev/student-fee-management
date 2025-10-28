
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [totalStudents, currentMonthPayments, pendingPayments] = await Promise.all([
      prisma.student.count(),
      prisma.feeRecord.aggregate({
        where: {
          paymentDate: { gte: firstDay, lt: nextMonth },
          status: 'PAID',
        },
        _sum: { amount: true },
      }),
      prisma.feeRecord.aggregate({
        where: {
          status: { in: ['PENDING', 'OVERDUE'] },
        },
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      totalStudents,
      currentMonthPayments: currentMonthPayments._sum.amount ?? 0,
      pendingPayments: pendingPayments._sum.amount ?? 0,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
