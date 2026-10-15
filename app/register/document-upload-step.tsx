"use client";

import { useState, useEffect, useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileUploader } from "./file-uploader";
import { WebcamCapture } from "./webcam-capture";
import {
  FileText,
  GraduationCap,
  Award,
  Files,
  Camera,
  Upload,
  PenTool,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Info,
  ShieldCheck,
  FileCheck,
  Check,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DocumentUploadStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onSubmit: (data: any) => void;
  validateStep?: (step: number, isValid: boolean) => void;
  loading?: boolean;
  registrationIdInput?: string;
  isRegistrationIdConfirmed?: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const isBlobLike = (value: unknown): value is Blob => {
  if (typeof Blob === "undefined") return false;
  return value instanceof Blob;
};

const getImageSrc = (value: any) => {
  if (!value) return "/placeholder.svg";
  if (typeof value === "string") return value;
  if (!isBlobLike(value)) return "/placeholder.svg";
  return URL.createObjectURL(value);
};

export default function DocumentUploadStep({
  formData,
  updateFormData,
  validateStep,
  onSubmit,
  loading = false,
}: DocumentUploadStepProps) {
  // Photo source tag (e.g., "nin", "webcam", "upload")
  const [photoSource, setPhotoSource] = useState<"nin" | "webcam" | "upload" | "unknown">(() => {
    if (typeof window !== "undefined") {
      const src = localStorage.getItem("registration_profileImage_source") as any;
      if (src) return src;
    }
    return formData.profileImage ? "nin" : "unknown";
  });

  // Netapps / NIN verified photo if retrieved during verification
  const [netappsPhoto, setNetappsPhoto] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("registration_netapps_photo");
      if (stored) return stored;
      const initialSource = localStorage.getItem("registration_profileImage_source");
      const currentPhoto = localStorage.getItem("registration_profileImage");
      if ((initialSource === "nin" || !initialSource) && currentPhoto) {
        localStorage.setItem("registration_netapps_photo", currentPhoto);
        return currentPhoto;
      }
    }
    if (formData?.netappsPhoto) return formData.netappsPhoto;
    if (formData?.profileImage && (photoSource === "nin" || !photoSource)) {
      return typeof formData.profileImage === "string" ? formData.profileImage : null;
    }
    return null;
  });

  // Photo mode: "keep_netapps" | "camera" | "upload"
  const [photoMode, setPhotoMode] = useState<"keep_netapps" | "camera" | "upload">(() => {
    if (typeof window !== "undefined") {
      const src = localStorage.getItem("registration_profileImage_source");
      if (src === "nin" || (!src && localStorage.getItem("registration_netapps_photo"))) {
        return "keep_netapps";
      }
      if (src === "webcam") return "camera";
      if (src === "upload") return "upload";
    }
    if (formData?.netappsPhoto || (formData?.profileImage && photoSource === "nin")) {
      return "keep_netapps";
    }
    return "camera";
  });

  // Keep netappsPhoto synced if provided via props or localStorage
  useEffect(() => {
    if (!netappsPhoto) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("registration_netapps_photo");
        if (stored) {
          setNetappsPhoto(stored);
          return;
        }
      }
      if (formData?.netappsPhoto) {
        setNetappsPhoto(formData.netappsPhoto);
      } else if (formData?.profileImage && photoSource === "nin" && typeof formData.profileImage === "string") {
        setNetappsPhoto(formData.profileImage);
        if (typeof window !== "undefined") {
          localStorage.setItem("registration_netapps_photo", formData.profileImage);
        }
      }
    }
  }, [formData?.netappsPhoto, formData?.profileImage, photoSource, netappsPhoto]);

  // Exemption state for promotion letter (First Appointment)
  const [isFirstAppointment, setIsFirstAppointment] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("registration_isFirstAppointment") === "true";
    }
    return Boolean(formData?.isFirstAppointment);
  });

  // Track file metadata for display
  const [fileMeta, setFileMeta] = useState<{ [key: string]: { name: string; size?: string } }>(() => {
    const meta: { [key: string]: { name: string; size?: string } } = {};
    if (typeof window !== "undefined") {
      ["appointmentLetter", "educationalCertificates", "promotionLetter", "otherDocuments", "signature", "profileImage"].forEach((key) => {
        const storedName = localStorage.getItem(`registration_${key}_name`);
        const storedSize = localStorage.getItem(`registration_${key}_size`);
        if (storedName) {
          meta[key] = { name: storedName, size: storedSize || undefined };
        }
      });
    }
    return meta;
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Validate form documents
  const checkErrors = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.appointmentLetter) {
      errs.appointmentLetter = "1. Appointment Letter is required.";
    }
    if (!formData.educationalCertificates) {
      errs.educationalCertificates = "2. Educational Documents are required.";
    }
    if (!formData.promotionLetter && !isFirstAppointment) {
      errs.promotionLetter = "3. Letter of Last Promotion is required (or check First Appointment).";
    }
    if (!formData.otherDocuments) {
      errs.otherDocuments = "4. Other Related Documents are required.";
    }
    if (!formData.profileImage) {
      errs.profileImage = "5. Passport photograph is required (Keep NIN photo, Live Capture, or Upload from Computer).";
    }
    if (!formData.signature) {
      errs.signature = "6. Signature upload is required.";
    }

    return errs;
  };

  useEffect(() => {
    if (hasAttemptedSubmit) {
      setErrors(checkErrors());
    }
    if (validateStep) {
      const isValid =
        !!formData.appointmentLetter &&
        !!formData.educationalCertificates &&
        (!!formData.promotionLetter || isFirstAppointment) &&
        !!formData.otherDocuments &&
        !!formData.profileImage &&
        !!formData.signature;
      validateStep(4, isValid);
    }
  }, [formData, isFirstAppointment, hasAttemptedSubmit]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Generic document handler
  const handleDocumentSelect = async (fieldName: string, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const sizeStr = formatFileSize(file.size);

      updateFormData({ [fieldName]: base64 });

      if (typeof window !== "undefined") {
        localStorage.setItem(`registration_${fieldName}`, base64);
        localStorage.setItem(`registration_${fieldName}_name`, file.name);
        localStorage.setItem(`registration_${fieldName}_size`, sizeStr);
      }

      setFileMeta((prev) => ({
        ...prev,
        [fieldName]: { name: file.name, size: sizeStr },
      }));

      // Clear field error
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });

      toast.success(`${file.name} uploaded successfully`);
    } catch (err) {
      console.error("Error processing file:", err);
      toast.error("Failed to read the file. Please try again.");
    }
  };

  // Handler to keep the verified photo from Netapps / NIN record
  const handleKeepNetappsPhoto = () => {
    const photoToKeep = netappsPhoto || (typeof formData.profileImage === "string" ? formData.profileImage : null);
    if (!photoToKeep) return;

    updateFormData({ profileImage: photoToKeep });
    setPhotoMode("keep_netapps");
    setPhotoSource("nin");

    if (typeof window !== "undefined") {
      localStorage.setItem("registration_profileImage", photoToKeep);
      localStorage.setItem("registration_netapps_photo", photoToKeep);
      localStorage.setItem("registration_profileImage_source", "nin");
      localStorage.setItem("registration_profileImage_name", "NIN_Verified_Passport.jpg");
      localStorage.setItem("registration_profileImage_size", "Verified Record");
    }

    setFileMeta((prev) => ({
      ...prev,
      profileImage: { name: "NIN_Verified_Passport.jpg", size: "Verified Record" },
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next.profileImage;
      return next;
    });

    toast.success("Using verified passport photograph from National Identity (NIN) record");
  };

  // Passport photo handler (either camera or file upload)
  const handlePhotoSelect = async (file: File, source: "webcam" | "upload") => {
    try {
      const base64 = await fileToBase64(file);
      const sizeStr = formatFileSize(file.size);

      updateFormData({ profileImage: base64 });

      if (typeof window !== "undefined") {
        localStorage.setItem("registration_profileImage", base64);
        localStorage.setItem("registration_profileImage_name", file.name);
        localStorage.setItem("registration_profileImage_size", sizeStr);
        localStorage.setItem("registration_profileImage_source", source);
      }

      setPhotoSource(source);
      setFileMeta((prev) => ({
        ...prev,
        profileImage: { name: file.name, size: sizeStr },
      }));

      setErrors((prev) => {
        const next = { ...prev };
        delete next.profileImage;
        return next;
      });

      toast.success(source === "webcam" ? "Passport photo captured via camera!" : "Passport photo uploaded from computer!");
    } catch (err) {
      console.error("Error setting passport photo:", err);
      toast.error("Failed to process photo. Please try again.");
    }
  };

  // Remove document
  const handleRemoveDocument = (fieldName: string) => {
    updateFormData({ [fieldName]: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem(`registration_${fieldName}`);
      localStorage.removeItem(`registration_${fieldName}_name`);
      localStorage.removeItem(`registration_${fieldName}_size`);
      if (fieldName === "profileImage") {
        localStorage.removeItem("registration_profileImage_source");
        setPhotoSource("unknown");
        setPhotoMode("camera");
      }
    }
    setFileMeta((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  // Handle first appointment exemption for promotion letter
  const toggleFirstAppointment = (checked: boolean) => {
    setIsFirstAppointment(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("registration_isFirstAppointment", checked ? "true" : "false");
    }
    if (checked) {
      // Clear error for promotion letter
      setErrors((prev) => {
        const next = { ...prev };
        delete next.promotionLetter;
        return next;
      });
    }
  };

  // Handle step submission
  const handleSubmitClick = () => {
    setHasAttemptedSubmit(true);
    const validationErrors = checkErrors();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || "Please upload all six required documents before continuing.");
      return;
    }

    onSubmit(formData);
  };

  const getDisplayName = (fieldKey: string, fallback: string): string => {
    const meta = fileMeta[fieldKey];
    if (meta?.name) return meta.name;
    const formVal = formData[fieldKey];
    if (formVal instanceof File) return formVal.name;
    if (typeof formVal === "string" && formVal) return fallback;
    return fallback;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Files className="h-6 w-6 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Step 4: Document Upload</h2>
            <p className="text-emerald-100 text-sm">
              Six (6) required verification documents for employee biometric accreditation.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-emerald-600/60 flex flex-wrap items-center gap-4 text-xs text-emerald-100">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Max file size: 5MB per document
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Formats: PDF, JPG, JPEG, PNG
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Encrypted & secure storage
          </span>
        </div>
      </div>

      {/* Required Documents Summary Bar */}
      {(() => {
        const completedCount = [
          !!formData.appointmentLetter,
          !!formData.educationalCertificates,
          !!formData.promotionLetter || isFirstAppointment,
          !!formData.otherDocuments,
          !!formData.profileImage,
          !!formData.signature,
        ].filter(Boolean).length;

        return (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Six (6) Required Documents for Verification
                </p>
                <p className="text-xs text-slate-500">
                  {completedCount} of 6 required documents ready
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full self-start sm:self-center ${
                  completedCount === 6
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {completedCount === 6 ? "✓ All 6 Documents Uploaded" : `${6 - completedCount} Document${6 - completedCount > 1 ? "s" : ""} Remaining`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-3.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / 6) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              {[
                { num: "1", label: "Appointment Letter", ready: !!formData.appointmentLetter },
                { num: "2", label: "Educational Documents", ready: !!formData.educationalCertificates },
                {
                  num: "3",
                  label: "Letter of Last Promotion",
                  ready: !!formData.promotionLetter || isFirstAppointment,
                },
                { num: "4", label: "Other Related Documents", ready: !!formData.otherDocuments },
                { num: "5", label: "Passport Photograph", ready: !!formData.profileImage },
                { num: "6", label: "Signature", ready: !!formData.signature },
              ].map((item) => (
                <div
                  key={item.num}
                  className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs transition-colors ${
                    item.ready
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {item.ready ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-slate-400 text-[10px] flex items-center justify-center text-slate-600 shrink-0 font-bold bg-slate-50">
                      {item.num}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Six Documents Grid */}
      <div className="space-y-6">
        {/* DOCUMENT 1: APPOINTMENT LETTER */}
        <Card className={`transition-all border ${errors.appointmentLetter ? "border-red-400 ring-1 ring-red-300" : formData.appointmentLetter ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <Label htmlFor="appointmentLetter" className="text-base font-semibold text-slate-900 flex items-center gap-1">
                    Appointment Letter <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    Upload official Letter of First Appointment into the Service (PDF, JPG, or PNG, max 5MB).
                  </p>
                </div>
              </div>

              {formData.appointmentLetter && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full self-start">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                </span>
              )}
            </div>

            {formData.appointmentLetter ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 truncate">
                      {getDisplayName("appointmentLetter", "Appointment_Letter.pdf")}
                    </p>
                    {fileMeta.appointmentLetter?.size && (
                      <p className="text-xs text-emerald-700">Size: {fileMeta.appointmentLetter.size}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5" /> Replace
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentSelect("appointmentLetter", file);
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument("appointmentLetter")}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <FileUploader
                onFileSelect={(file) => handleDocumentSelect("appointmentLetter", file)}
                accept=".pdf,.jpg,.jpeg,.png"
                error={errors.appointmentLetter}
              />
            )}

            {errors.appointmentLetter && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.appointmentLetter}
              </p>
            )}
          </CardContent>
        </Card>

        {/* DOCUMENT 2: EDUCATIONAL DOCUMENTS */}
        <Card className={`transition-all border ${errors.educationalCertificates ? "border-red-400 ring-1 ring-red-300" : formData.educationalCertificates ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <Label htmlFor="educationalCertificates" className="text-base font-semibold text-slate-900 flex items-center gap-1">
                    Educational Documents <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    Upload primary, secondary, and tertiary certificates or degree diplomas (PDF or images, max 5MB).
                  </p>
                </div>
              </div>

              {formData.educationalCertificates && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full self-start">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                </span>
              )}
            </div>

            {formData.educationalCertificates ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 truncate">
                      {getDisplayName("educationalCertificates", "Educational_Documents.pdf")}
                    </p>
                    {fileMeta.educationalCertificates?.size && (
                      <p className="text-xs text-emerald-700">Size: {fileMeta.educationalCertificates.size}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5" /> Replace
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentSelect("educationalCertificates", file);
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument("educationalCertificates")}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <FileUploader
                onFileSelect={(file) => handleDocumentSelect("educationalCertificates", file)}
                accept=".pdf,.jpg,.jpeg,.png"
                error={errors.educationalCertificates}
              />
            )}

            {errors.educationalCertificates && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.educationalCertificates}
              </p>
            )}
          </CardContent>
        </Card>

        {/* DOCUMENT 3: LETTER OF LAST PROMOTION */}
        <Card className={`transition-all border ${errors.promotionLetter ? "border-red-400 ring-1 ring-red-300" : formData.promotionLetter || isFirstAppointment ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <Label htmlFor="promotionLetter" className="text-base font-semibold text-slate-900 flex items-center gap-1">
                    Letter of Last Promotion <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    Upload official letter of most recent promotion or appointment confirmation.
                  </p>
                </div>
              </div>

              {formData.promotionLetter ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full self-start">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                </span>
              ) : isFirstAppointment ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full self-start">
                  <Info className="h-3.5 w-3.5" /> First Appointment
                </span>
              ) : null}
            </div>

            {/* First Appointment Exemption Checkbox */}
            <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
              <input
                type="checkbox"
                id="isFirstAppointmentCheck"
                checked={isFirstAppointment}
                onChange={(e) => toggleFirstAppointment(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded border-gray-300 cursor-pointer"
              />
              <label htmlFor="isFirstAppointmentCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                First Appointment / Not Promoted Yet (Check here if newly appointed with no prior promotion)
              </label>
            </div>

            {formData.promotionLetter ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 truncate">
                      {getDisplayName("promotionLetter", "Letter_of_Last_Promotion.pdf")}
                    </p>
                    {fileMeta.promotionLetter?.size && (
                      <p className="text-xs text-emerald-700">Size: {fileMeta.promotionLetter.size}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5" /> Replace
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentSelect("promotionLetter", file);
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument("promotionLetter")}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : isFirstAppointment ? (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Exempted as First Appointment. You may optionally upload your initial appointment confirmation if available.</span>
              </div>
            ) : (
              <FileUploader
                onFileSelect={(file) => handleDocumentSelect("promotionLetter", file)}
                accept=".pdf,.jpg,.jpeg,.png"
                error={errors.promotionLetter}
              />
            )}

            {errors.promotionLetter && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.promotionLetter}
              </p>
            )}
          </CardContent>
        </Card>

        {/* DOCUMENT 4: OTHER RELATED DOCUMENTS */}
        <Card className={`transition-all border ${errors.otherDocuments ? "border-red-400 ring-1 ring-red-300" : formData.otherDocuments ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <Label htmlFor="otherDocuments" className="text-base font-semibold text-slate-900 flex items-center gap-1">
                    Other Related Documents <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    Upload birth certificate / age declaration, LGA certificate of origin, or other civil service records.
                  </p>
                </div>
              </div>

              {formData.otherDocuments && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full self-start">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                </span>
              )}
            </div>

            {formData.otherDocuments ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                    <Files className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 truncate">
                      {getDisplayName("otherDocuments", "Other_Related_Documents.pdf")}
                    </p>
                    {fileMeta.otherDocuments?.size && (
                      <p className="text-xs text-emerald-700">Size: {fileMeta.otherDocuments.size}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5" /> Replace
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentSelect("otherDocuments", file);
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument("otherDocuments")}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <FileUploader
                onFileSelect={(file) => handleDocumentSelect("otherDocuments", file)}
                accept=".pdf,.jpg,.jpeg,.png"
                error={errors.otherDocuments}
              />
            )}

            {errors.otherDocuments && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.otherDocuments}
              </p>
            )}
          </CardContent>
        </Card>

        {/* DOCUMENT 5: PASSPORT (KEEP NIN PHOTO, LIVE PHOTO CAPTURE, OR COMPUTER UPLOAD) */}
        <Card className={`transition-all border ${errors.profileImage ? "border-red-400 ring-1 ring-red-300" : formData.profileImage ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  5
                </div>
                <div>
                  <Label htmlFor="profileImage" className="text-base font-semibold text-slate-900 flex items-center gap-1">
                    Passport Photograph <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    You can decide to <strong>keep your verified photo from NIN</strong>, <strong>directly take a picture from your camera</strong>, or <strong>upload an image from your computer</strong>.
                  </p>
                </div>
              </div>

              {formData.profileImage && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full self-start">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passport Ready
                </span>
              )}
            </div>

            {/* Current Active Photo Preview Card (if photo exists) */}
            {formData.profileImage && (
              <div className="mb-5 p-4 bg-slate-50 border border-slate-300 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-xs">
                <div className="relative shrink-0">
                  <img
                    src={getImageSrc(formData.profileImage)}
                    alt="Passport Photograph Preview"
                    className="h-28 w-28 object-cover rounded-xl border-2 border-emerald-600 shadow-md bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-sm font-semibold text-slate-800">Current Passport Photo</span>
                      {photoSource === "nin" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <ShieldCheck className="h-3 w-3 text-emerald-700" /> Kept from NIN Record
                        </span>
                      ) : photoSource === "webcam" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                          <Camera className="h-3 w-3 text-blue-700" /> Live Camera Capture
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                          <Laptop className="h-3 w-3 text-purple-700" /> Uploaded from Computer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {photoSource === "nin"
                        ? "Using your verified photograph retrieved from the National Identity Database (NIN). You can keep this photo or choose to replace it below."
                        : photoSource === "webcam"
                        ? "Captured live via your device camera. You can retake it, upload from your PC, or restore your NIN photo."
                        : "Uploaded from your computer. You can browse a different image, snap a live camera photo, or restore your NIN photo."}
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {netappsPhoto && (photoSource !== "nin" || formData.profileImage !== netappsPhoto) && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleKeepNetappsPhoto}
                        className="text-xs gap-1.5 border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Revert to NIN Photo
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPhotoMode("camera")}
                      className={`text-xs gap-1.5 ${photoMode === "camera" ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold" : "border-slate-300"}`}
                    >
                      <Camera className="h-3.5 w-3.5 text-emerald-600" /> Take with Camera
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPhotoMode("upload")}
                      className={`text-xs gap-1.5 ${photoMode === "upload" ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold" : "border-slate-300"}`}
                    >
                      <Laptop className="h-3.5 w-3.5 text-emerald-600" /> Upload from Computer
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveDocument("profileImage")}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear Photo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Selection Options: Keep NIN Photo / Live Capture / Upload from Computer */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Choose Photo Option:
              </label>

              <div className={`grid grid-cols-1 ${netappsPhoto ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
                {/* Option 1 (if NIN photo exists): Keep Verified NIN Photo */}
                {netappsPhoto && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleKeepNetappsPhoto}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleKeepNetappsPhoto();
                    }}
                    className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all flex items-start gap-3 ${
                      photoMode === "keep_netapps" && formData.profileImage === netappsPhoto
                        ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={getImageSrc(netappsPhoto)}
                        alt="NIN photo thumbnail"
                        className="h-10 w-10 rounded-lg object-cover border border-emerald-500 bg-white"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                        <ShieldCheck className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-semibold text-xs text-slate-900 leading-snug">
                          Keep Verified NIN Photo
                        </h4>
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            photoMode === "keep_netapps" && formData.profileImage === netappsPhoto
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {photoMode === "keep_netapps" && formData.profileImage === netappsPhoto && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Use the verified photo retrieved from your National Identity record.
                      </p>
                    </div>
                  </div>
                )}

                {/* Option 2: Live Photo Capture */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPhotoMode("camera")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setPhotoMode("camera");
                  }}
                  className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all flex items-start gap-3 ${
                    photoMode === "camera"
                      ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      photoMode === "camera"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Camera className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-xs text-slate-900 leading-snug">
                        Live Photo Capture
                      </h4>
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          photoMode === "camera"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {photoMode === "camera" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Directly snap a new photo using your device webcam or camera.
                    </p>
                  </div>
                </div>

                {/* Option 3: Upload Image from Computer */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPhotoMode("upload")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setPhotoMode("upload");
                  }}
                  className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all flex items-start gap-3 ${
                    photoMode === "upload"
                      ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      photoMode === "upload"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-xs text-slate-900 leading-snug">
                        Upload Image from Computer
                      </h4>
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          photoMode === "upload"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {photoMode === "upload" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Upload an existing passport photo file (JPG, PNG) from your PC.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Workspace Container */}
            {photoMode === "keep_netapps" && netappsPhoto ? (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-xs text-emerald-950 leading-relaxed flex-1">
                  <strong>Verified Record Active:</strong> Your official identity photo from the National Identity Database (NIN) is selected as your passport photograph. If you wish to change it, switch to <strong>Live Photo Capture</strong> to snap a new photo or <strong>Upload Image from Computer</strong> above.
                </div>
              </div>
            ) : photoMode === "camera" ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="mb-3 text-center sm:text-left">
                  <p className="text-xs font-semibold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                    <Camera className="h-4 w-4 text-emerald-600" /> Live Webcam Photo Capture
                  </p>
                  <p className="text-xs text-slate-500">
                    Position your face within the oval guide on a plain background, then click &quot;Capture Photo&quot;.
                  </p>
                </div>
                <WebcamCapture
                  onCapture={(file) => handlePhotoSelect(file, "webcam")}
                  initialImage={typeof formData.profileImage === "string" ? formData.profileImage : null}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mb-1 text-center sm:text-left">
                  <p className="text-xs font-semibold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                    <Upload className="h-4 w-4 text-emerald-600" /> Upload Image from Computer
                  </p>
                  <p className="text-xs text-slate-500">
                    Drag and drop or browse for a clear color passport photograph from your computer.
                  </p>
                </div>
                <FileUploader
                  onFileSelect={(file) => handlePhotoSelect(file, "upload")}
                  accept=".jpg,.jpeg,.png"
                  error={errors.profileImage}
                />
                <p className="text-xs text-slate-500 text-center">
                  Accepted image formats: JPG, JPEG, PNG (max 5MB). Photo must show full face with neutral expression.
                </p>
              </div>
            )}

            {errors.profileImage && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.profileImage}
              </p>
            )}
          </CardContent>
        </Card>

        {/* DOCUMENT 6: SIGNATURE */}
        <Card className={`transition-all border ${errors.signature ? "border-red-400 ring-1 ring-red-300" : formData.signature ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  6
                </div>
                <div>
                  <Label htmlFor="signature" className="text-base font-semibold text-slate-900 flex items-center gap-1">
                    Signature <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    Upload a scanned or clear photograph of your specimen signature on a plain white background (JPG or PNG).
                  </p>
                </div>
              </div>

              {formData.signature && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full self-start">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Signature Uploaded
                </span>
              )}
            </div>

            {formData.signature ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white border border-slate-300 rounded-md shadow-sm">
                    <img
                      src={getImageSrc(formData.signature)}
                      alt="Signature specimen"
                      className="h-14 max-w-[180px] object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Specimen Signature</p>
                    <p className="text-xs text-emerald-700">Clear & verified on plain background</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5" /> Replace
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentSelect("signature", file);
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument("signature")}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <FileUploader
                onFileSelect={(file) => handleDocumentSelect("signature", file)}
                accept=".jpg,.jpeg,.png"
                error={errors.signature}
              />
            )}

            {errors.signature && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.signature}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guidance Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-amber-900">
          <Info className="h-4 w-4 text-amber-700" />
          Important Instructions for Document Verification:
        </h4>
        <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5">
          <li>
            <strong>All six documents</strong> must be clearly legible with full edges visible. Blurred or cropped documents may delay enrollment.
          </li>
          <li>
            <strong>Passport Photograph:</strong> Must be a front-facing headshot with both ears visible, neutral expression, and plain background (live capture or computer upload).
          </li>
          <li>
            <strong>Signature:</strong> Sign on a clean, blank white paper with black or blue ink before capturing or uploading.
          </li>
          <li>
            Physical originals of all uploaded credentials will be cross-referenced during biometric verification at the designated center.
          </li>
        </ul>
      </div>

      {/* Step Submission Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Ensure all uploaded documents match your registered personal information before proceeding.
        </p>

        <Button
          type="button"
          onClick={handleSubmitClick}
          disabled={loading}
          className="w-full sm:w-auto min-w-[200px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-6 shadow-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Submitting Documents...
            </span>
          ) : (
            "Submit Documents & Proceed"
          )}
        </Button>
      </div>
    </div>
  );
}
