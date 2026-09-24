/** Snapshot helper for dirty detection (spec 107). */
export function formSnapshot(value: unknown): string {
  return JSON.stringify(value)
}

export function isFormDirty(baseline: string, current: unknown): boolean {
  return baseline !== formSnapshot(current)
}
