import type {
  CreatePermissionRequest,
  CreatePermissionResponse,
  DeletePermissionResponse,
  GetUserPermissionsResponse,
  GetPermissionResponse,
  GetPermissionsResponse,
  PermissionActionRequest,
  PermissionActionResponse,
  UpdatePermissionRequest,
  UpdatePermissionResponse,
} from "@/types/permissions"

const PERMISSIONS_ENDPOINT = "/api/permissions"

const getAuthToken = () => {
  if (typeof window === "undefined") return null

  return (
    localStorage.getItem("token") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("ippis_token="))
      ?.split("=")[1] ||
    null
  )
}

const getResponseMessage = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return "Unexpected HTML response from permissions API"
  }

  try {
    const parsed = JSON.parse(trimmed) as { message?: string; error?: string }
    return parsed.message || parsed.error || trimmed
  } catch {
    return trimmed
  }
}

const request = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers)
  headers.set("accept", "application/json")

  const token = getAuthToken()
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  })

  const text = await response.text()
  const contentType = response.headers.get("content-type") || ""
  const isJsonResponse = contentType.includes("application/json") || contentType.includes("+json")

  if (!text.trim()) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    return {} as T
  }

  if (!response.ok) {
    throw new Error(getResponseMessage(text) || "Request failed")
  }

  if (!isJsonResponse) {
    throw new Error(getResponseMessage(text) || "Unexpected non-JSON response")
  }

  const data = JSON.parse(text)
  return data as T
}

const buildPermissionQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      query.set(key, String(value))
    }
  })

  return query.toString()
}

export const performPermissionAction = async (
  payload: PermissionActionRequest,
): Promise<PermissionActionResponse> => {
  const query = buildPermissionQuery({ id: payload.permission_id })
  return request<PermissionActionResponse>(`${PERMISSIONS_ENDPOINT}?${query}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
}

export const getUserPermissions = async (
  userId: string,
): Promise<GetUserPermissionsResponse> => {
  const query = buildPermissionQuery({ user_id: userId })
  return request<GetUserPermissionsResponse>(`${PERMISSIONS_ENDPOINT}?${query}`)
}

export const getPermissions = async (): Promise<GetPermissionsResponse> => {
  return request<GetPermissionsResponse>(PERMISSIONS_ENDPOINT)
}

export const getPermission = async (id: string | number): Promise<GetPermissionResponse> => {
  const query = new URLSearchParams({ id: String(id) })
  return request<GetPermissionResponse>(`${PERMISSIONS_ENDPOINT}?${query.toString()}`)
}

export const createPermission = async (
  payload: CreatePermissionRequest,
): Promise<CreatePermissionResponse> => {
  return request<CreatePermissionResponse>(PERMISSIONS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
}

export const updatePermission = async (
  payload: UpdatePermissionRequest,
): Promise<UpdatePermissionResponse> => {
  const { id, ...body } = payload
  const query = new URLSearchParams({ id: String(id) })
  return request<UpdatePermissionResponse>(`${PERMISSIONS_ENDPOINT}?${query.toString()}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...body }),
  })
}

export const deletePermission = async (
  id: string | number,
): Promise<DeletePermissionResponse> => {
  const query = new URLSearchParams({ id: String(id) })
  return request<DeletePermissionResponse>(`${PERMISSIONS_ENDPOINT}?${query.toString()}`, {
    method: "DELETE",
  })
}
