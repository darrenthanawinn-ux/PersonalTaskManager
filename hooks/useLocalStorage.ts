"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SetValue<T> = (value: T | ((prev: T) => T)) => void

/**
 * A hydration-safe localStorage hook with JSON error handling.
 *
 * - Returns `initialValue` on the server and first client render to avoid
 *   hydration mismatches, then syncs the persisted value in after mount.
 * - Silently recovers from malformed / unparseable JSON by falling back to
 *   the initial value instead of throwing.
 * - Keeps multiple tabs / components in sync via the `storage` event.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean] {
  const [hydrated, setHydrated] = useState(false)
  const [value, setValue] = useState<T>(initialValue)
  const initialRef = useRef(initialValue)

  const read = useCallback((): T => {
    if (typeof window === "undefined") return initialRef.current
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return initialRef.current
      return JSON.parse(raw) as T
    } catch (error) {
      console.log("[v0] useLocalStorage read failed for key:", key, error)
      return initialRef.current
    }
  }, [key])

  // Hydrate from storage after mount.
  useEffect(() => {
    setValue(read())
    setHydrated(true)
  }, [read])

  const setStoredValue = useCallback<SetValue<T>>(
    (next) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(resolved))
          }
        } catch (error) {
          console.log("[v0] useLocalStorage write failed for key:", key, error)
        }
        return resolved
      })
    },
    [key],
  )

  // Sync across tabs / windows.
  useEffect(() => {
    if (typeof window === "undefined") return
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      try {
        setValue(event.newValue === null ? initialRef.current : (JSON.parse(event.newValue) as T))
      } catch (error) {
        console.log("[v0] useLocalStorage sync failed for key:", key, error)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [key])

  return [value, setStoredValue, hydrated]
}

/** Trigger a browser download of the given data as a formatted JSON file. */
export function exportJson(data: unknown, filename = "mission-control-backup.json") {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.log("[v0] exportJson failed:", error)
  }
}

/** Read + parse a user-selected JSON file, resolving to the parsed object. */
export function importJson<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as T)
      } catch (error) {
        console.log("[v0] importJson parse failed:", error)
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
