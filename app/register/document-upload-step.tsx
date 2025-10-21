"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "./file-uploader";
import { WebcamCapture } from "./webcam-capture";
import { Camera, Upload } from "lucide-react";
import { Button } from "@tremor/react";

interface DocumentUploadStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  handleDocsUploadSubmit: (data: any) => void;
  validateStep: (step: number, isValid: boolean) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function DocumentUploadStep({
  formData,
  updateFormData,
  validateStep,
  handleDocsUploadSubmit,
}: DocumentUploadStepProps) {
  const [errors, setErrors] = useState({
    appointmentLetter: "",
    educationalCertificates: "",
    profileImage: "",
    signature: "",
  });

  const [profileImageTab, setProfileImageTab] = useState<"upload" | "webcam">(
    "upload"
  );

  useEffect(() => {
    // Check if required documents are uploaded
    const newErrors = {
      appointmentLetter: !formData.appointmentLetter
        ? "Appointment letter is required"
        : "",
      educationalCertificates: !formData.educationalCertificates
        ? "Educational certificates are required"
        : "",
      profileImage: !formData.profileImage ? "Profile image is required" : "",
      signature: !formData.signature ? "Signature is required" : "",
    };

    setErrors(newErrors);

    // Validate step if all required documents are uploaded
    const isValid =
      !!formData.appointmentLetter &&
      !!formData.educationalCertificates &&
      !!formData.profileImage &&
      !!formData.signature;

    // validateStep(4, isValid)
  }, [formData, validateStep]);

  // Save file as base64 to localStorage and update formData
  const handleFileSelect = async (fieldName: string, file: File) => {
    const base64 = await fileToBase64(file);
    updateFormData({ [fieldName]: base64 });
    localStorage.setItem(`registration_${fieldName}`, base64);
  };

  // No server upload, just notify user

  // Helper to preview image if base64 or File
  const getImageSrc = (value: any) => {
    if (!value) return "/placeholder.svg";
    if (typeof value === "string") return value;
    return URL.createObjectURL(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          Step 4: Document Upload
        </h2>
        <p className="text-gray-600 mb-4">
          Please upload the required documents. All documents must be in PDF,
          JPG, or PNG format and must not exceed 5MB in size.
        </p>
      </div>

      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="appointmentLetter" className="flex items-center">
                Appointment Letter*
                {errors.appointmentLetter && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <FileUploader
                onFileSelect={(file) =>
                  handleFileSelect("appointmentLetter", file)
                }
                accept=".pdf,.jpg,.jpeg,.png"
                error={errors.appointmentLetter}
              />
              {formData.appointmentLetter && (
                <p className="text-sm text-green-600">File selected.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="educationalCertificates"
                className="flex items-center"
              >
                Educational Certificates*
                {errors.educationalCertificates && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <FileUploader
                onFileSelect={(file) =>
                  handleFileSelect("educationalCertificates", file)
                }
                accept=".pdf,.jpg,.jpeg,.png"
                error={errors.educationalCertificates}
              />
              {formData.educationalCertificates && (
                <p className="text-sm text-green-600">File selected.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionLetter">
                Promotion Letter (if applicable)
              </Label>
              <FileUploader
                onFileSelect={(file) =>
                  handleFileSelect("promotionLetter", file)
                }
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {formData.promotionLetter && (
                <p className="text-sm text-green-600">File selected.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherDocuments">
                Other Supporting Documents (if applicable)
              </Label>
              <FileUploader
                onFileSelect={(file) =>
                  handleFileSelect("otherDocuments", file)
                }
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {formData.otherDocuments && (
                <p className="text-sm text-green-600">File selected.</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profileImage" className="flex items-center">
                Profile Image (Passport Photograph)*
                {errors.profileImage && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>

              <Tabs
                value={profileImageTab}
                onValueChange={(value) =>
                  setProfileImageTab(value as "upload" | "webcam")
                }
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upload" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" /> Upload Image
                  </TabsTrigger>
                  <TabsTrigger value="webcam" className="flex items-center">
                    <Camera className="h-4 w-4 mr-2" /> Take Photo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <FileUploader
                    onFileSelect={(file) =>
                      handleFileSelect("profileImage", file)
                    }
                    accept=".jpg,.jpeg,.png"
                    error={errors.profileImage}
                  />
                </TabsContent>

                <TabsContent value="webcam">
                  <WebcamCapture
                    onCapture={(file) => handleFileSelect("profileImage", file)}
                  />
                </TabsContent>
              </Tabs>

              {formData.profileImage && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 mb-1">
                    Profile image selected
                  </p>
                  <img
                    src={getImageSrc(formData.profileImage)}
                    alt="Profile preview"
                    className="h-24 w-24 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="signature" className="flex items-center">
                Signature*
                {errors.signature && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <FileUploader
                onFileSelect={(file) => handleFileSelect("signature", file)}
                accept=".jpg,.jpeg,.png"
                error={errors.signature}
              />
              {formData.signature && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 mb-1">
                    Signature selected
                  </p>
                  <img
                    src={getImageSrc(formData.signature)}
                    alt="Signature preview"
                    className="h-16 max-w-xs object-contain border border-gray-300 p-2 rounded-md"
                  />
                </div>
              )}
            </div>
            <Button onClick={handleDocsUploadSubmit}>Submit Documents</Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">
          Important Notes:
        </h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>All documents must be clear and legible.</li>
          <li>
            Profile image should be a recent passport photograph with a plain
            background.
          </li>
          <li>Signature should be on a white background.</li>
          <li>
            Original documents will be verified during the physical verification
            process.
          </li>
        </ul>
      </div>
    </div>
  );
}
