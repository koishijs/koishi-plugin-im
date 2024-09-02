export function formatTimestamp(ts: number, format: string = 'ymdhms'): string {
  const date = new Date(ts)
  const lowerFormat = format.toLowerCase()

  const options: Intl.DateTimeFormatOptions = {
    year: format.includes('y') ? 'numeric' : undefined,
    month: format.includes('m') ? 'long' : undefined,
    day: format.includes('d') ? 'numeric' : undefined,
    hour: format.includes('h') ? '2-digit' : undefined,
    minute: format.includes('m') ? '2-digit' : undefined,
    second: format.includes('s') ? '2-digit' : undefined,
  }

  const formatter = new Intl.DateTimeFormat('zh-CN', options)
  return formatter.format(date)
}
