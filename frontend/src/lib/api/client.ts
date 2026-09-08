/**
 * Minimal typed fetch wrapper shared by every API module.
 *
 * Kept dependency-free on purpose: this project talks to one first-party
 * API, so a small wrapper is easier to audit than pulling in a full HTTP
 * client. All API modules (see `orders.ts`) build on top of `apiRequest`.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Milliseconds before the request is aborted. Defaults to 10s. */
  timeoutMs?: number
}

function getAuthToken(): string | null {
  // The admin panel authenticates with a short-lived bearer token issued
  // after Telegram-based operator login (see auth flow docs in README).
  return localStorage.getItem('b2b_admin_token')
}

export async function apiRequest<T>(
  path: string,
  { body, timeoutMs = 10_000, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const token = getAuthToken()

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`
      let code: string | undefined
      try {
        const payload = await response.json()
        message = payload.message ?? message
        code = payload.code
      } catch {
        // Response had no JSON body — fall back to the generic message.
      }
      throw new ApiError(message, response.status, code)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 0, 'TIMEOUT')
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR',
    )
  } finally {
    clearTimeout(timeout)
  }
}
