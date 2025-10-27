import { z } from 'zod'
import { ClassLevel } from '@/types'

export const studentSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required').max(20, 'Roll number too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  className: z.nativeEnum(ClassLevel, { errorMap: () => ({ message: 'Invalid class level' }) }),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long')
})

export const updateStudentSchema = studentSchema.partial()

export const feeRecordSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  month: z.number().min(1, 'Month must be between 1-12').max(12, 'Month must be between 1-12'),
  year: z.number().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  amount: z.number().min(0, 'Amount must be positive'),
  paymentDate: z.union([z.date(), z.null()]).optional(),
  status: z.enum(['PAID', 'UNPAID']).default('UNPAID')
})

export const queryParamsSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  className: z.nativeEnum(ClassLevel).optional(),
  feeStatus: z.enum(['PAID', 'UNPAID', 'ALL']).optional(),
  sortBy: z.enum(['name', 'rollNumber', 'className', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export type StudentFormData = z.infer<typeof studentSchema>
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>
export type FeeRecordFormData = z.infer<typeof feeRecordSchema>
export type QueryParams = z.infer<typeof queryParamsSchema>