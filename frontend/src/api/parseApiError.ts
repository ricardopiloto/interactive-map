export class ApiError extends Error {
  readonly codigo: string | null
  readonly detalhes: Record<string, unknown>
  readonly status: number

  constructor(
    message: string,
    opts: { codigo?: string | null; detalhes?: Record<string, unknown>; status: number },
  ) {
    super(message)
    this.name = 'ApiError'
    this.codigo = opts.codigo ?? null
    this.detalhes = opts.detalhes ?? {}
    this.status = opts.status
  }
}

export function parseApiError(body: string, status: number): ApiError {
  if (!body.trim()) {
    return new ApiError('', { codigo: null, status })
  }
  try {
    const parsed = JSON.parse(body) as { detail?: unknown }
    const detail = parsed.detail
    if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
      const obj = detail as { erro?: string; detalhes?: Record<string, unknown> }
      if (typeof obj.erro === 'string') {
        return new ApiError(obj.erro, {
          codigo: obj.erro,
          detalhes: obj.detalhes ?? {},
          status,
        })
      }
    }
    if (typeof detail === 'string') {
      return new ApiError(detail, { codigo: null, status })
    }
  } catch {
    /* legacy plain text */
  }
  return new ApiError(body, { codigo: null, status })
}
