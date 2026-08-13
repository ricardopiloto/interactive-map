import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export interface PinchZoomHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void
}

export function usePinchZoom(onPinch: (scaleFactor: number) => void): {
  handlers: PinchZoomHandlers
  isPinching: () => boolean
} {
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const lastDistanceRef = useRef<number | null>(null)
  const pinchingRef = useRef(false)

  const clearPointer = useCallback((pointerId: number) => {
    pointersRef.current.delete(pointerId)
    if (pointersRef.current.size < 2) {
      pinchingRef.current = false
      lastDistanceRef.current = null
    }
  }, [])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (pointersRef.current.size >= 2) return
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointersRef.current.size === 2) {
        const pts = [...pointersRef.current.values()]
        pinchingRef.current = true
        lastDistanceRef.current = pointerDistance(pts[0], pts[1])
        e.currentTarget.setPointerCapture(e.pointerId)
      }
    },
    [],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const map = pointersRef.current
      if (!map.has(e.pointerId)) return
      map.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (!pinchingRef.current || map.size < 2) return
      const pts = [...map.values()]
      const dist = pointerDistance(pts[0], pts[1])
      const last = lastDistanceRef.current
      if (last != null && last > 0 && dist > 0) {
        onPinch(dist / last)
      }
      lastDistanceRef.current = dist
    },
    [onPinch],
  )

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      clearPointer(e.pointerId)
    },
    [clearPointer],
  )

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      clearPointer(e.pointerId)
    },
    [clearPointer],
  )

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    isPinching: () => pinchingRef.current,
  }
}
