// Student and Fee Management Types

export enum ClassLevel {
  PLAY_GROUP = 'Play Group',
  NURSERY = 'Nursery',
  PREP = 'Prep',
  ONE = 'One',
  TWO = 'Two',
  THREE = 'Three',
  FOUR = 'Four',
  FIVE = 'Five',
  SIX = 'Six',
  SEVEN = 'Seven',
  EIGHT = 'Eight',
  NINE = 'Nine',
  TEN = 'Ten'
}

export const CLASS_ORDER = [
  ClassLevel.PLAY_GROUP,
  ClassLevel.NURSERY,
  ClassLevel.PREP,
  ClassLevel.ONE,
  ClassLevel.TWO,
  ClassLevel.THREE,
  ClassLevel.FOUR,
  ClassLevel.FIVE,
  ClassLevel.SIX,
  ClassLevel.SEVEN,
  ClassLevel.EIGHT,
  ClassLevel.NINE,
  ClassLevel.TEN
]

export interface Student {
  id: string
  rollNumber: string
  name: string
  className: ClassLevel
  phoneNumber: string
  createdAt: Date
  updatedAt: Date
  feeRecords?: FeeRecord[]
}

export interface FeeRecord {
  id: string
  studentId: string
  month: number // 1-12
  year: number
  amount: number
  paymentDate?: Date | null | undefined
  status: 'PAID' | 'UNPAID'
  createdAt: Date
  updatedAt: Date
  student?: Student
}

export interface CreateStudentData {
  rollNumber: string
  name: string
  className: ClassLevel
  phoneNumber: string
}

export interface UpdateStudentData {
  rollNumber?: string
  name?: string
  className?: ClassLevel
  phoneNumber?: string
}

export interface CreateFeeRecordData {
  studentId: string
  month: number
  year: number
  amount: number
  paymentDate?: Date
  status?: 'PAID' | 'UNPAID'
}

export interface ClassSummary {
  className: ClassLevel
  totalStudents: number
  paidStudents: number
  unpaidStudents: number
  totalAmount: number
  collectedAmount: number
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
}