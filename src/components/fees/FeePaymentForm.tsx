'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, DollarSign } from 'lucide-react'

const feePaymentFormSchema = z.object({
  month: z.number().min(1, 'Month must be between 1-12').max(12, 'Month must be between 1-12'),
  year: z.number().min(2020, 'Year must be 2020 or later').max(2030, 'Year must be 2030 or earlier'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  // 👇 Make it required explicitly to avoid "undefined"
  status: z.enum(['PAID', 'UNPAID']).default('PAID').refine(val => val !== undefined, {
    message: 'Status is required'
  })
})

type FeePaymentFormData = z.infer<typeof feePaymentFormSchema> & {
  status: 'PAID' | 'UNPAID'
}

interface FeePaymentFormProps {
  studentId: string
  initialData?: Partial<FeePaymentFormData>
  onSubmit: (data: FeePaymentFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function FeePaymentForm({
  studentId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: FeePaymentFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<FeePaymentFormData>({
    resolver: zodResolver(feePaymentFormSchema) as any, // 👈 type-cast to suppress strict mismatch
    defaultValues: {
      month: currentMonth,
      year: currentYear,
      amount: 1000,
      paymentDate: currentDate.toISOString().split('T')[0],
      status: 'PAID',
      ...initialData
    }
  })

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const handleFormSubmit = async (data: FeePaymentFormData) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while recording the payment')
    }
  }

  const watchedStatus = watch('status')

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {initialData ? 'Update Fee Payment' : 'Record Fee Payment'}
      </h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Month and Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Month *
            </label>
            <select
              {...register('month', { valueAsNumber: true })}
              id="month"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>}
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <select
              {...register('year', { valueAsNumber: true })}
              id="year"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Fee Amount *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              id="amount"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        {/* Payment Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status *
          </label>
          <select
            {...register('status')}
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>

        {/* Payment Date - Only show if status is PAID */}
        {watchedStatus === 'PAID' && (
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                {...register('paymentDate')}
                type="date"
                id="paymentDate"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.paymentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>
            )}
          </div>
        )}

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? 'Saving...' : initialData ? 'Update Payment' : 'Record Payment'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}