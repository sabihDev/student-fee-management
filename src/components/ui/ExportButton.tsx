'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { ClassLevel } from '@/types'

interface ExportButtonProps {
  type: 'students' | 'class'
  className?: ClassLevel
  month?: number
  year?: number
  includeFees?: boolean
  label?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export default function ExportButton({
  type,
  className,
  month,
  year,
  includeFees = false,
  label,
  variant = 'primary',
  size = 'md'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setError(null)

      let url = ''
      const params = new URLSearchParams()

      if (type === 'students') {
        url = '/api/export/students'
        if (className) params.append('className', className)
        if (includeFees) params.append('includeFees', 'true')
      } else if (type === 'class' && className) {
        url = `/api/export/class/${encodeURIComponent(className)}`
        if (month) params.append('month', month.toString())
        if (year) params.append('year', year.toString())
      } else {
        throw new Error('Invalid export configuration')
      }

      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url
      
      const response = await fetch(fullUrl)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Export failed')
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `export-${Date.now()}.csv`

      // Create blob and download
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000) // Clear error after 5 seconds
    } finally {
      setIsExporting(false)
    }
  }

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base'
    }
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300'
    }
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`
  }

  const getDefaultLabel = () => {
    if (type === 'students') {
      return className ? `Export ${className} Students` : 'Export Students'
    } else if (type === 'class') {
      return month && year 
        ? `Export ${className} (${month}/${year})`
        : `Export ${className} Report`
    }
    return 'Export CSV'
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={getButtonClasses()}
        title={error || undefined}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {label || getDefaultLabel()}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-200 rounded-md shadow-lg z-10 min-w-max">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}