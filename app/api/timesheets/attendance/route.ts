"use server"

import { NextResponse } from "next/server"
import type {
  AttendanceListResponse,
  AttendanceRecord,
  MarkAttendancePayload,
  UpdateAttendancePayload,
} from "@/types/timesheets/attendance"

const now = () => new Date().toISOString()

let attendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    employee_name: "John Doe",
    employee_code: "EMP001",
    department: "Finance",
    attendance_date: "2026-03-09",
    clock_in: "08:45:00",
    clock_out: "17:30:00",
    status: "present",
    notes: "No issues",
    created_at: now(),
  },
  {
    id: 2,
    employee_name: "Jane Smith",
    employee_code: "EMP002",
    department: "HR",
    attendance_date: "2026-03-09",
    clock_in: "09:02:00",
    clock_out: "17:22:00",
    status: "late",
    notes: "Traffic delay",
    created_at: now(),
  },
  {
    id: 3,
    employee_name: "Michael Johnson",
    employee_code: "EMP003",
    department: "IT",
    attendance_date: "2026-03-09",
    clock_in: "08:25:00",
    clock_out: "17:10:00",
    status: "present",
    notes: "",
    created_at: now(),
  },
]

let nextId = attendanceRecords.length + 1

const listToResponse = (list: AttendanceRecord[]): AttendanceListResponse => ({
  success: true,
  data: list,
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams } = url

  const filters = {
    id: searchParams.get("id"),
    employee_code: searchParams.get("employee_code"),
    department: searchParams.get("department"),
    attendance_date: searchParams.get("attendance_date"),
  }

  let data = [...attendanceRecords]

  if (filters.id) {
    data = data.filter((record) => record.id.toString() === filters.id)
  }
  if (filters.employee_code) {
    data = data.filter(
      (record) =>
        record.employee_code?.toLowerCase() ===
        filters.employee_code?.toLowerCase()
    )
  }
  if (filters.department) {
    data = data.filter(
      (record) =>
        record.department?.toLowerCase() === filters.department?.toLowerCase()
    )
  }
  if (filters.attendance_date) {
    data = data.filter(
      (record) => record.attendance_date === filters.attendance_date
    )
  }

  return NextResponse.json(listToResponse(data))
}

export async function POST(request: Request) {
  const payload = (await request.json()) as MarkAttendancePayload
  const record: AttendanceRecord = {
    id: nextId++,
    employee_name: `Employee ${payload.employee_code}`,
    employee_code: payload.employee_code,
    department: "General",
    attendance_date: payload.attendance_date,
    clock_in: payload.clock_in,
    clock_out: payload.clock_out,
    status: payload.status,
    notes: payload.notes ?? null,
    created_at: now(),
  }

  attendanceRecords = [record, ...attendanceRecords]

  return NextResponse.json(
    {
      success: true,
      data: record,
    },
    { status: 201 }
  )
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as UpdateAttendancePayload
  const recordIndex = attendanceRecords.findIndex(
    (record) => record.id === payload.id
  )

  if (recordIndex < 0) {
    return NextResponse.json(
      { success: false, data: null },
      { status: 404 }
    )
  }

  const current = attendanceRecords[recordIndex]
  const updated: AttendanceRecord = {
    ...current,
    clock_in: payload.clock_in ?? current.clock_in,
    clock_out: payload.clock_out ?? current.clock_out,
    status: payload.status ?? current.status,
    notes: payload.notes ?? current.notes,
  }

  attendanceRecords[recordIndex] = updated

  return NextResponse.json({
    success: true,
    data: updated,
  })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get("id"))

  if (Number.isNaN(id)) {
    return NextResponse.json({ success: false, data: null }, { status: 400 })
  }

  attendanceRecords = attendanceRecords.filter((record) => record.id !== id)

  return NextResponse.json({
    success: true,
    data: null,
  })
}
