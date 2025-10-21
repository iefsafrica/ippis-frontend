"use client"

import { useEffect, useState } from "react"
import { PendingContent } from "./pending-content"

export default function ClientWrapper() {
  const [pendingEmployees, setPendingEmployees] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })

  const fetchPending = async (page = 1) => {
    const res = await fetch(`/api/admin/dashboard/recent?type=pending&page=${page}`)
    const json = await res.json()
    if (json.success) {
      setPendingEmployees(json.data || [])
      //  pagination info,
      setPagination(json.pagination || { total: json.data?.length || 0, page, limit: 10, totalPages: 1 })
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  return (
    <PendingContent
      pendingEmployees={pendingEmployees}
      pagination={pagination}
      onPageChange={fetchPending}
      onRefresh={() => fetchPending(pagination.page)}
    />
  )
}
