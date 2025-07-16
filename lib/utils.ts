import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchStoreHours() {
  const res = await fetch('/api/config?type=storeSettings')
  const data = await res.json()
  const openTime = data?.storeSettings?.openTime || '08:00'
  const closeTime = data?.storeSettings?.closeTime || '23:00'
  return { openTime, closeTime }
}

export function isStoreClosed(openTime: string, closeTime: string) {
  // Get current time in Africa/Algiers
  const now = dayjs().tz('Africa/Algiers')
  const [openHour, openMinute] = openTime.split(':').map(Number)
  const [closeHour, closeMinute] = closeTime.split(':').map(Number)
  const open = now.set('hour', openHour).set('minute', openMinute).set('second', 0)
  const close = now.set('hour', closeHour).set('minute', closeMinute).set('second', 0)
  // If closeTime is after midnight (e.g. 23:00), handle wrap-around
  if (close.isBefore(open)) {
    // Store closes after midnight
    return !(now.isAfter(open) || now.isBefore(close))
  } else {
    return !(now.isAfter(open) && now.isBefore(close))
  }
}
