import { useEffect, useCallback } from 'react'

interface KeyboardOptions {
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEnter?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useKeyboard(options: KeyboardOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!options.enabled) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          options.onArrowUp?.()
          break
        case 'ArrowDown':
          event.preventDefault()
          options.onArrowDown?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          options.onArrowLeft?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          options.onArrowRight?.()
          break
        case 'Enter':
          event.preventDefault()
          options.onEnter?.()
          break
        case 'Escape':
          event.preventDefault()
          options.onEscape?.()
          break
      }
    },
    [options]
  )

  useEffect(() => {
    if (options.enabled !== false) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, options.enabled])
}