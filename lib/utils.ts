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

/**
 * Calculate the distance in kilometers between two coordinates using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
