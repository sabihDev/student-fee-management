// Simple in-memory data store for development
// This will be replaced with Prisma database operations

import { Student, FeeRecord, ClassLevel } from '@/types'

// In-memory storage
let students: Student[] = []
let feeRecords: FeeRecord[] = []
let nextId = 1

// Helper function to generate IDs
const generateId = () => `id_${nextId++}`

// Student operations
export const studentStore = {
  async findAll(filters?: {
    search?: string
    className?: ClassLevel
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<Student[]> {
    let result = [...students]
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.rollNumber.toLowerCase().includes(search)
      )
    }
    
    if (filters?.className) {
      result = result.filter(s => s.className === filters.className)
    }
    
    if (filters?.sortBy) {
      result.sort((a, b) => {
        const aVal: string | Date | FeeRecord[] | undefined = a[filters.sortBy as keyof Student]
        const bVal: string | Date | FeeRecord[] | undefined = b[filters.sortBy as keyof Student]
        const order = filters.sortOrder === 'desc' ? -1 : 1

        if (aVal !== undefined && bVal !== undefined && aVal < bVal) return -1 * order
        if (aVal !== undefined && bVal !== undefined && aVal > bVal) return 1 * order
        return 0
      })
    }
    
    return result
  },

  async findById(id: string): Promise<Student | null> {
    return students.find(s => s.id === id) || null
  },

  async findByRollNumber(rollNumber: string): Promise<Student | null> {
    return students.find(s => s.rollNumber === rollNumber) || null
  },

  async create(data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    const student: Student = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    students.push(student)
    return student
  },

  async update(id: string, data: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Student | null> {
    const index = students.findIndex(s => s.id === id)
    if (index === -1) return null
    
    students[index] = {
      ...students[index],
      ...data,
      updatedAt: new Date()
    }
    return students[index]
  },

  async delete(id: string): Promise<boolean> {
    const index = students.findIndex(s => s.id === id)
    if (index === -1) return false
    
    students.splice(index, 1)
    // Also delete associated fee records
    feeRecords = feeRecords.filter(f => f.studentId !== id)
    return true
  }
}

// Fee record operations
export const feeStore = {
  async findByStudentId(studentId: string): Promise<FeeRecord[]> {
    return feeRecords.filter(f => f.studentId === studentId)
  },

  async findById(id: string): Promise<FeeRecord | null> {
    return feeRecords.find(f => f.id === id) || null
  },

  async create(data: Omit<FeeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeeRecord> {
    const feeRecord: FeeRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    feeRecords.push(feeRecord)
    return feeRecord
  },

  async update(id: string, data: Partial<Omit<FeeRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FeeRecord | null> {
    const index = feeRecords.findIndex(f => f.id === id)
    if (index === -1) return null
    
    feeRecords[index] = {
      ...feeRecords[index],
      ...data,
      updatedAt: new Date()
    }
    return feeRecords[index]
  },

  async findByClassAndMonth(className: ClassLevel, month: number, year: number): Promise<FeeRecord[]> {
    const classStudents = students.filter(s => s.className === className)
    const studentIds = classStudents.map(s => s.id)
    return feeRecords.filter(f => 
      studentIds.includes(f.studentId) && 
      f.month === month && 
      f.year === year
    )
  }
}