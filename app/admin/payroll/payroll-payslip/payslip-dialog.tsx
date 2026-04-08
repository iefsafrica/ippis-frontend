"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { format } from "date-fns"
import { formatCurrency as formatPayslipCurrency } from "@/app/admin/payroll/payroll-payslip/payslip-utils"

export type PayslipPayment = {
  payment_id?: string
  employee_name?: string
  employee_id?: string
  grade?: string
  step?: string | number
  gender?: string
  tax_state?: string
  location?: string
  position?: string
  appointment?: string
  dob?: string
  bank_name?: string
  account?: string
  pfa?: string
  pension?: string
  month?: string
  appointment_date?: string
  [key: string]: any
}

type PayslipDialogProps = {
  payment: PayslipPayment | null
  open: boolean
  onClose: () => void
}

const detailRows = (payment: PayslipPayment) => [
  {
    leftLabel: "Employee Name",
    leftValue: payment.employee_name ?? "—",
    rightLabel: "Grade",
    rightValue: payment.grade ?? "GL11_CONPASS",
  },
  {
    leftLabel: "IPPIS Number",
    leftValue: payment.employee_id ?? "—",
    rightLabel: "Step",
    rightValue: payment.step ?? "5",
  },
  {
    leftLabel: "Legacy ID",
    leftValue: payment.legacy_id ?? "—",
    rightLabel: "Gender",
    rightValue: payment.gender ?? "MALE",
  },
  {
    leftLabel: "MD/School/Command",
    leftValue:
      payment.command ?? payment.department ?? "Nigeria Security and Civil Defence Corps",
    rightLabel: "Tax State",
    rightValue: payment.tax_state ?? "ONDO",
  },
]

const locationRows = (payment: PayslipPayment) => [
  {
    leftLabel: "Location",
    leftValue: payment.location ?? "NSCDC_ONDO",
    rightLabel: "Date of Appointment",
    rightValue: payment.appointment ?? "16-APR-2012",
  },
  {
    leftLabel: "Job",
    leftValue: payment.position ?? "—",
    rightLabel: "Date of Birth",
    rightValue: payment.dob ?? "—",
  },
]

const bankRows = (payment: PayslipPayment) => [
  {
    leftLabel: "Bank Name",
    leftValue: payment.bank_name ?? "First Bank of Nigeria Plc",
    rightLabel: "PFA Name",
    rightValue: payment.pfa ?? "FCMB Pensions Limited",
  },
  {
    leftLabel: "Account Number",
    leftValue: payment.account ?? "1234567890",
    rightLabel: "Pension PIN",
    rightValue: payment.pension ?? "PIN-12345678",
  },
]

const calculateEarnings = (grossAmount: number) => {
  const basic = parseFloat((grossAmount * 0.65).toFixed(2))
  const housing = parseFloat((grossAmount * 0.15).toFixed(2))
  const transport = parseFloat((grossAmount * 0.1).toFixed(2))
  const otherEarning = Math.max(grossAmount - (basic + housing + transport), 0)
  return [
    { label: "Basic Salary", amount: basic },
    { label: "Housing Allowance", amount: housing },
    { label: "Transport Allowance", amount: transport },
    { label: "Other Allowance", amount: otherEarning },
  ]
}

const calculateDeductions = (deductionAmount: number) => {
  const pension = parseFloat((deductionAmount * 0.35).toFixed(2))
  const nhis = parseFloat((deductionAmount * 0.15).toFixed(2))
  const tax = parseFloat((deductionAmount * 0.25).toFixed(2))
  const otherDeduction = Math.max(deductionAmount - (pension + nhis + tax), 0)
  return [
    { label: "Pension", amount: pension },
    { label: "NHIS", amount: nhis },
    { label: "PAYE/Tax", amount: tax },
    { label: "Other Deductions", amount: otherDeduction },
  ]
}

export function PayslipDialog({ payment, open, onClose }: PayslipDialogProps) {
  const paymentDateValue = payment?.payment_date ?? payment?.paymentDate
  const formattedPaymentDate = paymentDateValue ? format(new Date(paymentDateValue), "PPP") : "—"
  const payslipDateValue =
    payment?.created_at ?? payment?.createdAt ?? paymentDateValue ?? payment?.month
  const formattedPayslipDate = payslipDateValue ? format(new Date(payslipDateValue), "PPP") : "—"
  const grossAmount = Number(payment?.amount ?? 0) || 0
  const deductionAmount =
    Number(payment?.deduction_amount ?? payment?.deductions ?? 0) || 0
  const netAmount = Math.max(grossAmount - deductionAmount, 0)
  const payslipIdentifier =
    payment?.payment_id ?? (payment?.id ? `#${payment.id}` : "—")

  const earnings = calculateEarnings(grossAmount)
  const deductions = calculateDeductions(deductionAmount)
  const tax = deductions.find((item) => item.label === "PAYE/Tax")?.amount ?? 0

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  if (!payment) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) onClose()
      }}
    >
      <DialogContent
        data-hide-close
        className="w-full max-w-[860px] px-2 py-6 sm:px-4 sm:py-6 overflow-hidden"
      >
        <div className="relative mx-auto w-full max-w-[860px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[26px] border border-slate-200 bg-white px-10 pb-10 pt-12 shadow-[0_25px_45px_rgba(15,23,42,0.25)]">
          <div className="pointer-events-none absolute inset-4 flex items-center justify-center">
            <span className="text-[90px] font-black uppercase tracking-[0.9em] text-slate-200 leading-none opacity-20 -rotate-12">
              CONFIDENTIAL
            </span>
          </div>
          <div className="relative space-y-10 text-slate-700">
            <header className="space-y-1 text-center">
              <img
                src="/images/coat-of-arms.jpg"
                alt="Nigeria coat of arms"
                className="mx-auto h-20 w-auto"
                loading="lazy"
              />
              <p className="payslip-serif text-2xl font-bold tracking-[0.22em] leading-snug text-slate-800">
                NIGERIAN SECURITY AND CIVIL DEFENCE CORPS
              </p>
              <p className="payslip-normal text-xs uppercase tracking-[0.2em] font-bold leading-tight text-slate-500">
                EMPLOYEE PAYSLIP
              </p>
              <p className="payslip-serif text-lg font-bold tracking-[0.15em] leading-tight text-slate-600">
                {payment.month
                  ? payment.month.toString().toUpperCase()
                  : paymentDateValue
                  ? format(new Date(paymentDateValue), "LLLL yyyy").toUpperCase()
                  : "CURRENT MONTH"}
              </p>
            </header>

            <section className="grid gap-3 border-b border-slate-200 pb-6 text-sm text-slate-700">
              {detailRows(payment).map((row) => (
                <div
                  key={`${row.leftLabel}-${row.rightLabel}`}
                  className="grid grid-cols-[190px_minmax(0,1fr)_140px_minmax(0,1fr)] items-center gap-8"
                >
                  <span className="payslip-normal text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
                    {row.leftLabel}
                  </span>
                  <span className="payslip-normal text-sm font-semibold text-slate-900">{row.leftValue}</span>
                  <span className="payslip-normal text-[0.65rem] uppercase tracking-[0.35em] text-slate-500 text-right">
                    {row.rightLabel}
                  </span>
                  <span className="payslip-normal text-sm font-semibold text-slate-900 text-right">
                    {row.rightValue}
                  </span>
                </div>
              ))}
            </section>

            <section className="grid gap-3 border-b border-slate-200 pb-6 text-sm text-slate-700">
              {locationRows(payment).map((row) => (
                <div
                  key={`${row.leftLabel}-${row.rightLabel}`}
                  className="grid grid-cols-[190px_minmax(0,1fr)_140px_minmax(0,1fr)] items-center gap-8"
                >
                  <span className="payslip-normal text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
                    {row.leftLabel}
                  </span>
                  <span className="payslip-normal text-sm font-semibold text-slate-900">{row.leftValue}</span>
                  <span className="payslip-normal text-[0.65rem] uppercase tracking-[0.35em] text-slate-500 text-right">
                    {row.rightLabel}
                  </span>
                  <span className="payslip-normal text-sm font-semibold text-slate-900 text-right">
                    {row.rightValue}
                  </span>
                </div>
              ))}
            </section>

            <section className="grid gap-3 border-b border-slate-200 pb-6 text-sm text-slate-700">
              {bankRows(payment).map((row) => (
                <div
                  key={`${row.leftLabel}-${row.rightLabel}`}
                  className="grid grid-cols-[190px_minmax(0,1fr)_140px_minmax(0,1fr)] items-center gap-8"
                >
                  <span className="payslip-normal text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">
                    {row.leftLabel}
                  </span>
                  <span className="payslip-normal text-sm font-semibold text-slate-900">{row.leftValue}</span>
                  <span className="payslip-normal text-[0.65rem] uppercase tracking-[0.35em] text-slate-500 text-right">
                    {row.rightLabel}
                  </span>
                  <span className="payslip-normal text-sm font-semibold text-slate-900 text-right">
                    {row.rightValue}
                  </span>
                </div>
              ))}
            </section>

            <section className="grid gap-6 border-b border-slate-200 pb-6 text-sm md:grid-cols-[repeat(2,minmax(0,1fr))]">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.5em] text-slate-500">Gross Earnings Information</p>
                <div className="mt-3 space-y-2 text-slate-700">
                  {earnings.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-b-0"
                    >
                      <span className="text-sm">{item.label}</span>
                      <span className="font-semibold text-slate-900">{formatPayslipCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.5em] text-slate-500">Gross Deduction Information</p>
                <div className="mt-3 space-y-2 text-slate-700">
                  {deductions.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-b-0"
                    >
                      <span className="text-sm">{item.label}</span>
                      <span className="font-semibold text-slate-900">{formatPayslipCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border-b border-slate-200 pb-6 text-sm text-slate-700">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.5em] text-slate-500">Summary of Payments</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Total Gross Earnings</span>
                      <span className="font-semibold text-slate-900">{formatPayslipCurrency(grossAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Income Tax</span>
                      <span className="font-semibold text-slate-900">{formatPayslipCurrency(tax)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Gross Deductions</span>
                      <span className="font-semibold text-slate-900">{formatPayslipCurrency(deductionAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Net Earnings</span>
                      <span className="font-semibold text-slate-900">{formatPayslipCurrency(netAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[0.65rem] text-slate-500">
                  <p className="text-[0.65rem] uppercase tracking-[0.5em] text-slate-500">Generated By</p>
                  <p className="font-semibold text-slate-900 text-xs">IPPIS - SoftSuite</p>
                  <p>Payslip ID: {payslipIdentifier}</p>
                  <p>Payment Date: {formattedPaymentDate}</p>
                  <p>Payslip Date: {formattedPayslipDate}</p>
                </div>
              </div>
            </section>

            <DialogFooter className="justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handlePrint}>Print payslip</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
