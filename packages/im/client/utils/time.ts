export function formatTimestamp(ts: number, format: string = 'YMDhms'): string {
  const date = new Date(ts)

  const options: Intl.DateTimeFormatOptions = {
    year: format.includes('Y') ? 'numeric' : undefined,
    month: format.includes('M') ? 'long' : undefined,
    day: format.includes('D') ? 'numeric' : undefined,
    hour: format.includes('h') ? '2-digit' : undefined,
    minute: format.includes('m') ? '2-digit' : undefined,
    second: format.includes('s') ? '2-digit' : undefined,
  }

  const formatter = new Intl.DateTimeFormat('zh-CN', options)
  return formatter.format(date)
}

export function formatTimestampBySpan(ts: number): string {
  const now = new Date()
  const date = new Date(ts)

  const isSameDay = now.toDateString() === date.toDateString()
  const isSameMonth = now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth()
  const isSameYear = now.getFullYear() === date.getFullYear()

  let format: string = 'ymdhms'

  if (isSameDay) {
    format = 'hm'
  } else if (isSameMonth) {
    format = 'Dhm'
  } else if (isSameYear) {
    format = 'MDhm'
  } else {
    format = 'YMDhm'
  }

  return formatTimestamp(ts, format)
}
