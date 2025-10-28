import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const students = await prisma.student.count()
    return NextResponse.json({ ok: true, students })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: (e as Error).message })
  }
}
