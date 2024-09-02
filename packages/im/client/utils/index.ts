export * from './time'

export function lockdown<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let lock: boolean

  return async function (...args: Parameters<T>) {
    if (!lock) {
      lock = true
      try {
        await fn.apply(this, args)
      } finally {
        lock = false
      }
    }
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  duration: number = 1000
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true
      fn.apply(this, args)
      setTimeout(() => (inThrottle = false), duration)
    }
  }
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  duration: number = 1000
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    clearTimeout(timeout!)

    timeout = setTimeout(() => fn.apply(this, args), duration)
  }
}
