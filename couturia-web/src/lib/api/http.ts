/** Erreur HTTP renvoyée par l’API (message lisible pour l’UI). */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

/**
 * Petit client fetch typé.
 * - baseUrl : ex. http://localhost:8001
 * - token   : JWT Bearer (optionnel, pour /me plus tard)
 */
export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const controller = new AbortController()
  const timeoutMs = 20_000
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(408, 'Le serveur met trop de temps à répondre. Réessaie.')
    }
    throw err
  } finally {
    window.clearTimeout(timer)
  }

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    try {
      const data = (await response.json()) as { detail?: string | { msg?: string }[] }
      if (typeof data.detail === 'string') {
        message = data.detail
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg
      }
    } catch {
      // corps non-JSON : on garde le message par défaut
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
