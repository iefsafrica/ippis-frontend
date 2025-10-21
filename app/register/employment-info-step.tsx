"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface EmploymentInfoStepProps {
  formData: any
  updateFormData: (data: any) => void
  validateStep: (step: number, isValid: boolean) => void
}

const validateStep = (step: number, isValid: boolean) => {
  console.log(`Step ${step} is valid? ${isValid}`);
};

export function EmploymentInfoStep({ formData, updateFormData, validateStep }: EmploymentInfoStepProps) {
  const [formState, setFormState] = useState({
    employmentIdNo: formData.employmentIdNo || "EMP12345",
    serviceNo: formData.serviceNo || "SVC12345",
    fileNo: formData.fileNo || "FILE12345",
    rankPosition: formData.rankPosition || "Senior Officer",
    department: formData.department || "Administration",
    organization: formData.organization || "Federal Ministry of Finance",
    employmentType: formData.employmentType || "Permanent",
    probationPeriod: formData.probationPeriod || "6 Months",
    workLocation: formData.workLocation || "Abuja",
    dateOfFirstAppointment: formData.dateOfFirstAppointment || "2020-01-01",
    gl: formData.gl || "10",
    step: formData.step || "5",
    salaryStructure: formData.salaryStructure || "CONPSS",
    cadre: formData.cadre || "Senior",
    nameOfBank: formData.nameOfBank || "Access Bank",
    accountNumber: formData.accountNumber || "0123456789",
    pfaName: formData.pfaName || "ARM Pension",
    rsapin: formData.rsapin || "PEN123456789012",
    educationalBackground: formData.educationalBackground || "BSc Computer Science, University of Lagos, 2015",
    certifications: formData.certifications || "Project Management Professional (PMP), 2018",
  })

  const [errors, setErrors] = useState({})

  // Validate the form when fields change
  useEffect(() => {
    const requiredFields = [
      "employmentIdNo",
      "serviceNo",
      "fileNo",
      "rankPosition",
      "department",
      "organization",
      "employmentType",
      "workLocation",
      "dateOfFirstAppointment",
      "gl",
      "step",
      "salaryStructure",
      "cadre",
      "nameOfBank",
      "accountNumber",
      "pfaName",
      "rsapin",
    ]

    const isValid = requiredFields.every((field) => formState[field] && formState[field].toString().trim() !== "")

    // Validate account number (simple check for now)
    const isAccountValid = formState.accountNumber.length === 10

    validateStep(3, isValid && isAccountValid)

    // Update parent form data
    updateFormData(formState)
  }, [formState, validateStep, updateFormData])

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-6">Step 3: Employment Information</h2>
        <p className="text-gray-600 mb-4">
          Please provide your employment details. All fields marked with an asterisk (*) are required.
        </p>
      </div>

      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employmentIdNo">Employment ID No*</Label>
              <Input
                id="employmentIdNo"
                value={formState.employmentIdNo}
                onChange={(e) => handleChange("employmentIdNo", e.target.value)}
                className={errors.employmentIdNo ? "border-red-500" : ""}
              />
              {errors.employmentIdNo && <p className="text-red-500 text-xs mt-1">{errors.employmentIdNo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceNo">Service No*</Label>
              <Input
                id="serviceNo"
                value={formState.serviceNo}
                onChange={(e) => handleChange("serviceNo", e.target.value)}
                className={errors.serviceNo ? "border-red-500" : ""}
              />
              {errors.serviceNo && <p className="text-red-500 text-xs mt-1">{errors.serviceNo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileNo">File No*</Label>
              <Input
                id="fileNo"
                value={formState.fileNo}
                onChange={(e) => handleChange("fileNo", e.target.value)}
                className={errors.fileNo ? "border-red-500" : ""}
              />
              {errors.fileNo && <p className="text-red-500 text-xs mt-1">{errors.fileNo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rankPosition">Rank/Position*</Label>
              <Select value={formState.rankPosition} onValueChange={(value) => handleChange("rankPosition", value)}>
                <SelectTrigger id="rankPosition" className={errors.rankPosition ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select rank/position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior Officer">Junior Officer</SelectItem>
                  <SelectItem value="Senior Officer">Senior Officer</SelectItem>
                  <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Senior Manager">Senior Manager</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              {errors.rankPosition && <p className="text-red-500 text-xs mt-1">{errors.rankPosition}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department*</Label>
              <Select value={formState.department} onValueChange={(value) => handleChange("department", value)}>
                <SelectTrigger id="department" className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Research and Development">Research and Development</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization*</Label>
              <Input
                id="organization"
                value={formState.organization}
                onChange={(e) => handleChange("organization", e.target.value)}
                className={errors.organization ? "border-red-500" : ""}
              />
              {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type*</Label>
              <Select value={formState.employmentType} onValueChange={(value) => handleChange("employmentType", value)}>
                <SelectTrigger id="employmentType" className={errors.employmentType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Probationary">Probationary</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentType && <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="probationPeriod">Probation Period*</Label>
              <Select
                value={formState.probationPeriod}
                onValueChange={(value) => handleChange("probationPeriod", value)}
              >
                <SelectTrigger id="probationPeriod" className={errors.probationPeriod ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select probation period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="3 Months">3 Months</SelectItem>
                  <SelectItem value="6 Months">6 Months</SelectItem>
                  <SelectItem value="1 Year">1 Year</SelectItem>
                </SelectContent>
              </Select>
              {errors.probationPeriod && <p className="text-red-500 text-xs mt-1">{errors.probationPeriod}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workLocation">Work Location*</Label>
              <Input
                id="workLocation"
                value={formState.workLocation}
                onChange={(e) => handleChange("workLocation", e.target.value)}
                className={errors.workLocation ? "border-red-500" : ""}
              />
              {errors.workLocation && <p className="text-red-500 text-xs mt-1">{errors.workLocation}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfFirstAppointment">Date of 1st Appointment*</Label>
              <Input
                id="dateOfFirstAppointment"
                type="date"
                value={formState.dateOfFirstAppointment}
                onChange={(e) => handleChange("dateOfFirstAppointment", e.target.value)}
                className={errors.dateOfFirstAppointment ? "border-red-500" : ""}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.dateOfFirstAppointment && (
                <p className="text-red-500 text-xs mt-1">{errors.dateOfFirstAppointment}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gl">Grade Level (GL)*</Label>
              <Select value={formState.gl} onValueChange={(value) => handleChange("gl", value)}>
                <SelectTrigger id="gl" className={errors.gl ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 17 }, (_, i) => i + 1).map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      GL {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gl && <p className="text-red-500 text-xs mt-1">{errors.gl}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="step">Step*</Label>
              <Select value={formState.step} onValueChange={(value) => handleChange("step", value)}>
                <SelectTrigger id="step" className={errors.step ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((step) => (
                    <SelectItem key={step} value={step.toString()}>
                      Step {step}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.step && <p className="text-red-500 text-xs mt-1">{errors.step}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryStructure">Salary Structure*</Label>
              <Select
                value={formState.salaryStructure}
                onValueChange={(value) => handleChange("salaryStructure", value)}
              >
                <SelectTrigger id="salaryStructure" className={errors.salaryStructure ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select salary structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONPSS">CONPSS</SelectItem>
                  <SelectItem value="CONMESS">CONMESS</SelectItem>
                  <SelectItem value="CONHESS">CONHESS</SelectItem>
                  <SelectItem value="CONTISS">CONTISS</SelectItem>
                  <SelectItem value="CONAFSS">CONAFSS</SelectItem>
                  <SelectItem value="CONPASS">CONPASS</SelectItem>
                  <SelectItem value="CONPCASS">CONPCASS</SelectItem>
                </SelectContent>
              </Select>
              {errors.salaryStructure && <p className="text-red-500 text-xs mt-1">{errors.salaryStructure}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cadre">Cadre*</Label>
              <Select value={formState.cadre} onValueChange={(value) => handleChange("cadre", value)}>
                <SelectTrigger id="cadre" className={errors.cadre ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select cadre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              {errors.cadre && <p className="text-red-500 text-xs mt-1">{errors.cadre}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Banking and Pension Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nameOfBank">Name of Bank*</Label>
              <Select value={formState.nameOfBank} onValueChange={(value) => handleChange("nameOfBank", value)}>
                <SelectTrigger id="nameOfBank" className={errors.nameOfBank ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Access Bank">Access Bank</SelectItem>
                  <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                  <SelectItem value="First Bank">First Bank</SelectItem>
                  <SelectItem value="UBA">UBA</SelectItem>
                  <SelectItem value="GTBank">GTBank</SelectItem>
                  <SelectItem value="Fidelity Bank">Fidelity Bank</SelectItem>
                  <SelectItem value="Union Bank">Union Bank</SelectItem>
                  <SelectItem value="Ecobank">Ecobank</SelectItem>
                  <SelectItem value="FCMB">FCMB</SelectItem>
                  <SelectItem value="Sterling Bank">Sterling Bank</SelectItem>
                </SelectContent>
              </Select>
              {errors.nameOfBank && <p className="text-red-500 text-xs mt-1">{errors.nameOfBank}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">NUBAN Account Number*</Label>
              <Input
                id="accountNumber"
                value={formState.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                maxLength={10}
                className={errors.accountNumber ? "border-red-500" : ""}
              />
              {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pfaName">PFA Name*</Label>
              <Select value={formState.pfaName} onValueChange={(value) => handleChange("pfaName", value)}>
                <SelectTrigger id="pfaName" className={errors.pfaName ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select PFA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARM Pension">ARM Pension</SelectItem>
                  <SelectItem value="Stanbic IBTC Pension">Stanbic IBTC Pension</SelectItem>
                  <SelectItem value="Premium Pension">Premium Pension</SelectItem>
                  <SelectItem value="Leadway Pensure">Leadway Pensure</SelectItem>
                  <SelectItem value="FCMB Pensions">FCMB Pensions</SelectItem>
                  <SelectItem value="Trustfund Pensions">Trustfund Pensions</SelectItem>
                  <SelectItem value="Sigma Pensions">Sigma Pensions</SelectItem>
                  <SelectItem value="Crusader Sterling Pensions">Crusader Sterling Pensions</SelectItem>
                  <SelectItem value="AIICO Pension">AIICO Pension</SelectItem>
                  <SelectItem value="NLPC Pension">NLPC Pension</SelectItem>
                </SelectContent>
              </Select>
              {errors.pfaName && <p className="text-red-500 text-xs mt-1">{errors.pfaName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsapin">RSA PIN*</Label>
              <Input
                id="rsapin"
                value={formState.rsapin}
                onChange={(e) => handleChange("rsapin", e.target.value)}
                placeholder="PEN followed by 12 digits"
                className={errors.rsapin ? "border-red-500" : ""}
              />
              {errors.rsapin && <p className="text-red-500 text-xs mt-1">{errors.rsapin}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Educational Background and Certifications</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="educationalBackground">Educational Background</Label>
              <Textarea
                id="educationalBackground"
                value={formState.educationalBackground}
                onChange={(e) => handleChange("educationalBackground", e.target.value)}
                placeholder="List your educational qualifications (e.g., BSc Computer Science, University of Lagos, 2010)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={formState.certifications}
                onChange={(e) => handleChange("certifications", e.target.value)}
                placeholder="List any professional certifications you have obtained"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
