"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PreviewStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  validateStep: (step: number, isValid: boolean) => void;
}

export function PreviewStep({
  formData,
  updateFormData,
  validateStep,
}: PreviewStepProps) {
  // const [declaration, setDeclaration] = useState(formData.declaration || false);

  // useEffect(() => {
  //   updateFormData({ declaration });
  //   validateStep(5, true); // This step is always valid, but we need the declaration for submission
  // }, [declaration, updateFormData, validateStep]);

  // const formatDate = (dateString) => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("en-NG", {
  //     day: "numeric",
  //     month: "long",
  //     year: "numeric",
  //   });
  // };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          Step 5: Review & Submit
        </h2>
        <p className="text-gray-600 mb-4">
          Please review all the information you have provided. If you need to
          make any changes, you can go back to the relevant section using the
          tabs below or the navigation buttons.
        </p>
      </div>

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="declaration">Declaration</TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Verification Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">BVN</p>
                  <p className="text-sm">{formData.bvn || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    BVN Verification Status
                  </p>
                  <p className="text-sm">
                    {formData.bvnVerified ? "Verified" : "Not verified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">NIN</p>
                  <p className="text-sm">{formData.nin || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    NIN Verification Status
                  </p>
                  <p className="text-sm">
                    {formData.ninVerified ? "Verified" : "Not verified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm">{`${formData.title || ""} ${
                    formData.surname || ""
                  } ${formData.firstName || ""} ${
                    formData.otherNames || ""
                  }`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Contact Phone
                  </p>
                  <p className="text-sm">
                    {formData.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Email Address
                  </p>
                  <p className="text-sm">{formData.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="text-sm">
                    formatDate(formData.dateOfBirth) || "Not provided"
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sex</p>
                  <p className="text-sm">{formData.sex || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Marital Status
                  </p>
                  <p className="text-sm">
                    {formData.maritalStatus || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    State of Origin
                  </p>
                  <p className="text-sm">
                    {formData.stateOfOrigin || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">LGA</p>
                  <p className="text-sm">{formData.lga || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    State of Residence
                  </p>
                  <p className="text-sm">
                    {formData.stateOfResidence || "Not provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm">
                    {formData.addressStateOfResidence || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Next of Kin Name
                  </p>
                  <p className="text-sm">
                    {formData.nextOfKinName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Next of Kin Relationship
                  </p>
                  <p className="text-sm">
                    {formData.nextOfKinRelationship || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Next of Kin Phone
                  </p>
                  <p className="text-sm">
                    {formData.nextOfKinPhoneNumber || "Not provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Next of Kin Address
                  </p>
                  <p className="text-sm">
                    {formData.nextOfKinAddress || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Employment ID
                  </p>
                  <p className="text-sm">
                    {formData.employmentIdNo || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Service No
                  </p>
                  <p className="text-sm">
                    {formData.serviceNo || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">File No</p>
                  <p className="text-sm">{formData.fileNo || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Rank/Position
                  </p>
                  <p className="text-sm">
                    {formData.rankPosition || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>
                  <p className="text-sm">
                    {formData.department || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Organization
                  </p>
                  <p className="text-sm">
                    {formData.organization || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Employment Type
                  </p>
                  <p className="text-sm">
                    {formData.employmentType || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Probation Period
                  </p>
                  <p className="text-sm">
                    {formData.probationPeriod || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Work Location
                  </p>
                  <p className="text-sm">
                    {formData.workLocation || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of First Appointment
                  </p>
                  <p className="text-sm">
                    formatDate(formData.dateOfFirstAppointment) ||
                      "Not provided"
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Grade Level
                  </p>
                  <p className="text-sm">
                    {formData.gl ? `GL ${formData.gl}` : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Step</p>
                  <p className="text-sm">
                    {formData.step ? `Step ${formData.step}` : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Salary Structure
                  </p>
                  <p className="text-sm">
                    {formData.salaryStructure || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cadre</p>
                  <p className="text-sm">{formData.cadre || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bank</p>
                  <p className="text-sm">
                    {formData.nameOfBank || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Account Number
                  </p>
                  <p className="text-sm">
                    {formData.accountNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">PFA Name</p>
                  <p className="text-sm">
                    {formData.pfaName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">RSA PIN</p>
                  <p className="text-sm">{formData.rsapin || "Not provided"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Educational Background
                  </p>
                  <p className="text-sm whitespace-pre-line">
                    {formData.educationalBackground || "Not provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Certifications
                  </p>
                  <p className="text-sm whitespace-pre-line">
                    {formData.certifications || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Appointment Letter
                  </p>
                  <p className="text-sm">
                    {formData.appointmentLetter
                      ? formData.appointmentLetter.name
                      : "Not uploaded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Educational Certificates
                  </p>
                  <p className="text-sm">
                    {formData.educationalCertificates
                      ? formData.educationalCertificates.name
                      : "Not uploaded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Promotion Letter
                  </p>
                  <p className="text-sm">
                    {formData.promotionLetter
                      ? formData.promotionLetter.name
                      : "Not uploaded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Other Documents
                  </p>
                  <p className="text-sm">
                    {formData.otherDocuments
                      ? formData.otherDocuments.name
                      : "Not uploaded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Profile Image
                  </p>
                  {formData.profileImage ? (
                    <img
                      src={
                        URL.createObjectURL(formData.profileImage) ||
                        "/placeholder.svg"
                      }
                      alt="Profile preview"
                      className="h-16 w-16 object-cover rounded-md mt-1"
                    />
                  ) : (
                    <p className="text-sm">Not uploaded</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Signature</p>
                  {formData.signature ? (
                    <img
                      src={
                        URL.createObjectURL(formData.signature) ||
                        "/placeholder.svg"
                      }
                      alt="Signature preview"
                      className="h-12 w-24 object-contain mt-1"
                    />
                  ) : (
                    <p className="text-sm">Not uploaded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="declaration">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Declaration</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-gray-700">
                    I hereby declare that the information provided in this form
                    is true, complete, and correct to the best of my knowledge.
                    I understand that any false statement or omission may
                    disqualify me from employment or lead to dismissal if
                    already employed. I authorize the verification of any or all
                    information listed above.
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="declaration"
                    // checked={declaration}
                    // onCheckedChange={(checked) =>
                    //   setDeclaration(checked as boolean)
                    // }
                  />
                  <Label
                    htmlFor="declaration"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the declaration statement above
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
