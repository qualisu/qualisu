// hooks/use-debounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(
  value: T,
  delay: number,
  immediate?: boolean
): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (immediate && !debouncedValue) {
      setDebouncedValue(value)
      return
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay, immediate])

  return debouncedValue
}
