'use client'

import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import type { Student, FeeRecord, ClassLevel } from '@/types'

type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

interface AppState {
  students: Student[]
  studentsStatus: FetchStatus
  feeRecordsByStudentId: Record<string, FeeRecord[]>
  feesStatusByStudentId: Record<string, FetchStatus>
  dashboard: {
    totalStudents: number
    currentMonthPayments: number
    pendingPayments: number
  } | null
  dashboardStatus: FetchStatus
}

type AppAction =
  | { type: 'students/loading' }
  | { type: 'students/success'; payload: Student[] }
  | { type: 'students/error' }
  | { type: 'fees/loading'; payload: { studentId: string } }
  | { type: 'fees/success'; payload: { studentId: string; records: FeeRecord[] } }
  | { type: 'fees/error'; payload: { studentId: string } }
  | { type: 'dashboard/loading' }
  | { type: 'dashboard/success'; payload: { totalStudents: number; currentMonthPayments: number; pendingPayments: number } }
  | { type: 'dashboard/error' }

const initialState: AppState = {
  students: [],
  studentsStatus: 'idle',
  feeRecordsByStudentId: {},
  feesStatusByStudentId: {},
  dashboard: null,
  dashboardStatus: 'idle',
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'students/loading':
      return { ...state, studentsStatus: 'loading' }
    case 'students/success':
      return { ...state, studentsStatus: 'success', students: action.payload }
    case 'students/error':
      return { ...state, studentsStatus: 'error' }
    case 'fees/loading':
      return {
        ...state,
        feesStatusByStudentId: { ...state.feesStatusByStudentId, [action.payload.studentId]: 'loading' },
      }
    case 'fees/success':
      return {
        ...state,
        feeRecordsByStudentId: { ...state.feeRecordsByStudentId, [action.payload.studentId]: action.payload.records },
        feesStatusByStudentId: { ...state.feesStatusByStudentId, [action.payload.studentId]: 'success' },
      }
    case 'fees/error':
      return {
        ...state,
        feesStatusByStudentId: { ...state.feesStatusByStudentId, [action.payload.studentId]: 'error' },
      }
    case 'dashboard/loading':
      return { ...state, dashboardStatus: 'loading' }
    case 'dashboard/success':
      return { ...state, dashboardStatus: 'success', dashboard: action.payload }
    case 'dashboard/error':
      return { ...state, dashboardStatus: 'error' }
    default:
      return state
  }
}

interface AppStateContextValue extends AppState {
  fetchStudents: (filters?: { search?: string; className?: ClassLevel | 'ALL'; sortBy?: 'name' | 'rollNumber' | 'className' | 'createdAt'; sortOrder?: 'asc' | 'desc' }) => Promise<void>
  fetchStudentFees: (studentId: string) => Promise<void>
  fetchDashboard: () => Promise<void>
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchStudents = useCallback(async (filters?: { search?: string; className?: ClassLevel | 'ALL'; sortBy?: 'name' | 'rollNumber' | 'className' | 'createdAt'; sortOrder?: 'asc' | 'desc' }) => {
    dispatch({ type: 'students/loading' })
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.className && filters.className !== 'ALL') params.append('className', filters.className)
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
      const res = await fetch(`/api/students?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        dispatch({ type: 'students/success', payload: json.data as Student[] })
      } else {
        dispatch({ type: 'students/error' })
      }
    } catch {
      dispatch({ type: 'students/error' })
    }
  }, [])

  const fetchStudentFees = useCallback(async (studentId: string) => {
    dispatch({ type: 'fees/loading', payload: { studentId } })
    try {
      const res = await fetch(`/api/students/${studentId}/fees`)
      const json = await res.json()
      if (json.success) {
        dispatch({ type: 'fees/success', payload: { studentId, records: json.data as FeeRecord[] } })
      } else {
        dispatch({ type: 'fees/error', payload: { studentId } })
      }
    } catch {
      dispatch({ type: 'fees/error', payload: { studentId } })
    }
  }, [])

  const fetchDashboard = useCallback(async () => {
    dispatch({ type: 'dashboard/loading' })
    try {
      const res = await fetch('/api/dashboard/stats')
      const json = await res.json()
      if (res.ok) {
        dispatch({ type: 'dashboard/success', payload: json })
      } else {
        dispatch({ type: 'dashboard/error' })
      }
    } catch {
      dispatch({ type: 'dashboard/error' })
    }
  }, [])

  const value = useMemo<AppStateContextValue>(() => ({
    ...state,
    fetchStudents,
    fetchStudentFees,
    fetchDashboard,
  }), [state, fetchStudents, fetchStudentFees, fetchDashboard])

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}


