"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StepIndicator } from "./step-indicator";
import VerificationStep from "./verification-step";
import PersonalInfoStepII from "./personal-info-step";
import EmploymentInfoStep from "@/app/register/employment-info-stepII";
// import { FileUploader } from "./file-uploader";
import DocumentUploadStep from "./document-upload-step";
import { PreviewStep } from "./preview-step";
import { VerifyNinData } from "@/types/verify";
import { useRegisterEmployee } from "@/services/hooks/employees/useEmployees";
import type { EmployeeRegistrationPayload } from "@/types/employees/employee-management";

const SKIP_VERIFICATION_STEP = false;

export default function RegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(SKIP_VERIFICATION_STEP ? 2 : 1);
  const [registrationId, setRegistrationId] = useState("");
  const [ninVerified, setNinVerified] = useState(false);
  const [maxVisitedStep, setMaxVisitedStep] = useState(
    SKIP_VERIFICATION_STEP ? 2 : 1
  );

  const [formData, setFormData] = useState({
    // Verification step
    bvn: "",
    nin: "",
    bvnVerified: false,
    ninVerified: false,

    // Personal info step
    title: "",
    surname: "",
    firstName: "",
    otherNames: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    sex: "",
    maritalStatus: "",
    stateOfOrigin: "",
    lga: "",
    stateOfResidence: "",
    addressStateOfResidence: "",
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinPhoneNumber: "",
    nextOfKinAddress: "",

    // Employment info step
    employmentIdNo: "",
    serviceNo: "",
    fileNo: "",
    rankPosition: "",
    department: "",
    organization: "",
    employmentType: "",
    probationPeriod: "",
    workLocation: "",
    dateOfFirstAppointment: "",
    gl: "",
    step: "",
    salaryStructure: "",
    cadre: "",
    nameOfBank: "",
    accountNumber: "",
    pfaName: "",
    rsapin: "",
    educationalBackground: "",
    certifications: "",

    // Document upload step
    appointmentLetter: null as File | null,
    educationalCertificates: null as File | null,
    promotionLetter: null as File | null,
    otherDocuments: null as File | null,
    profileImage: null as File | null,
    signature: null as File | null,

    // Review step
    declaration: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const registerMutation = useRegisterEmployee();
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize registration when form loads
  useEffect(() => {
    const initializeRegistration = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/register/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
           body: JSON.stringify({ action: "createRegistration" }),
        });

        // if (!response.ok) {
        //   throw new Error(`Server responded with status: ${response.status}`);
        // }

        const data = await response.json();

        if (data.success) {
          setRegistrationId(data.registrationId);
        } else {
          setError(data.error || "Failed to initialize registration");
          // console.error("Registration initialization failed:", data.details);
        }
      } catch (err) {
        // setError("An error occurred while initializing registration. Please try again.")
        console.error("Registration initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeRegistration();
  }, []);

  const handleVerificationSubmit = async (verificationData: any) => {
    const manualContinue = verificationData.manualVerification ?? false;
    if (manualContinue) {
      setCurrentStep(2);
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/register/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          ...verificationData,
        }),
      });

      const data = await response
        .json()
        .catch(() => ({ success: false } as Record<string, unknown>));

      if (!data) {
        setError("Invalid verification response");
        return;
      }

      const {
        success: verificationSuccess,
        verified,
        message,
        bvnVerified,
        ninVerified,
        error: responseError,
      } = data as {
        success?: boolean
        verified?: boolean
        message?: string
        bvnVerified?: boolean
        ninVerified?: boolean
        error?: string
      };

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          ...verificationData,
          bvnVerified,
          ninVerified,
        }));

        setSuccess(
          verificationSuccess
            ? "Verification successful"
            : message || "Could not verify NIN; please continue manually.",
        );

        setCurrentStep(2);
      } else {
        console.warn("Register verification endpoint unavailable:", responseError);
      }
    } catch (err) {
      console.error("Verification submit failed:", err);
      if (manualContinue) {
        setCurrentStep(2);
      }
    } finally {
      setLoading(false);
      setCurrentStep((prev) => (prev < 2 ? 2 : prev));
    }
  };

  const handlePersonalInfoSubmit = async (personalData: any) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/register/personal-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          ...personalData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...personalData,
        }));
        setSuccess("Personal information saved successfully");
        setCurrentStep(3);
      } else {
        setError(data.error || "Failed to save personal information");
      }
    } catch (err) {
      setError("An error occurred while saving personal information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmploymentInfoSubmit = async (employmentData: any) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/register/employment-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          ...employmentData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...employmentData,
        }));
        setSuccess("Employment information saved successfully");
        setCurrentStep(4);
      } else {
        setError(data.error || "Failed to save employment information");
      }
    } catch (err) {
      setError("An error occurred while saving employment information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // console.log("Uploader:", FileUploader);

  const handleDocumentUploadSubmit = async (documentData: any) => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("registrationId", registrationId);

      // Append all files
      if (documentData.appointmentLetter) {
        formData.append("appointmentLetter", documentData.appointmentLetter);
      }

      if (documentData.educationalCertificates) {
        formData.append(
          "educationalCertificates",
          documentData.educationalCertificates
        );
      }

      if (documentData.promotionLetter) {
        formData.append("promotionLetter", documentData.promotionLetter);
      }

      if (documentData.otherDocuments) {
        formData.append("otherDocuments", documentData.otherDocuments);
      }

      if (documentData.profileImage) {
        formData.append("profileImage", documentData.profileImage);
      }

      if (documentData.signature) {
        formData.append("signature", documentData.signature);
      }

      const response = await fetch("/api/register/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...documentData,
        }));
        setSuccess("Documents uploaded successfully");
        setCurrentStep(5);
      } else {
        setError(data.error || "Failed to upload documents");
      }
    } catch (err) {
      setError("An error occurred while uploading documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildRegistrationPayload = (
    declaration: boolean,
  ): EmployeeRegistrationPayload => ({
    registration_id: registrationId,
    nin: formData.nin,
    firstname: formData.firstName,
    surname: formData.surname,
    middlename: formData.otherNames || undefined,
    email: formData.email,
    gender: formData.sex,
    telephoneno: formData.phoneNumber,
    birthdate: formData.dateOfBirth,
    state_of_origin: formData.stateOfOrigin,
    residence_address: formData.addressStateOfResidence,
    residence_state: formData.stateOfResidence,
    residence_lga: formData.lga,
    profession: formData.rankPosition,
    maritalstatus: formData.maritalStatus,
    employment_id: formData.employmentIdNo,
    service_number: formData.serviceNo,
    file_number: formData.fileNo,
    rank_position: formData.rankPosition,
    department: formData.department,
    organization: formData.organization,
    employment_type: formData.employmentType,
    probation_period: formData.probationPeriod,
    work_location: formData.workLocation,
    date_of_first_appointment: formData.dateOfFirstAppointment,
    grade_level: formData.gl,
    salary_structure: formData.salaryStructure,
    cadre: formData.cadre,
    bank_name: formData.nameOfBank,
    account_number: formData.accountNumber,
    pfa_name: formData.pfaName,
    rsapin: formData.rsapin,
    educational_background: formData.educationalBackground,
    certifications: formData.certifications,
    next_of_kin_name: formData.nextOfKinName,
    next_of_kin_relationship: formData.nextOfKinRelationship,
    next_of_kin_phone_number: formData.nextOfKinPhoneNumber,
    next_of_kin_address: formData.nextOfKinAddress,
    declaration,
  });

  const handleFinalSubmit = async (finalData: any) => {
    try {
      setLoading(true);
      setError("");
      setShowSuccessCard(false);

      const payload = buildRegistrationPayload(finalData.declaration);
      const response = await registerMutation.mutateAsync(payload);

      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          declaration: finalData.declaration,
        }));

        const successMessage = "Registration submitted successfully";
        setSuccess(successMessage);
        toast.success(successMessage, { icon: "🎉" });
        setShowSuccessCard(true);
        successTimeoutRef.current = window.setTimeout(() => {
          router.push(`/track?id=${registrationId}`);
        }, 1200);
      } else {
        setError(response.message || "Failed to submit registration");
      }
    } catch (err) {
      console.error("Registration submission failed:", err);
      setShowSuccessCard(false);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting registration",
      );
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while submitting registration";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (ninVerified === true) {
        setCurrentStep(2); // Instead of assigning the component
      }
    }, 3000);
  }, [ninVerified]);

  const stepThreeHandle = () => {
    setCurrentStep(3); // Instead of assigning the component
  };

  const handleStepSelect = useCallback(
    (stepNumber: number) => {
      if (stepNumber <= maxVisitedStep) {
        setCurrentStep(stepNumber);
      }
    },
    [maxVisitedStep]
  );

  useEffect(() => {
    setMaxVisitedStep((prev) => Math.max(prev, currentStep));
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const updateFormData = useCallback((data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  const documentFieldUpdate = useCallback((data: any) => {
    const fieldName = Object.keys(data)[0];
    const value = data[fieldName];
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem(`registration_${fieldName}`, value);
    }
  }, []);

  const validateStep = useCallback((_step: number, _isValid: boolean) => {
    // Placeholder for future step validation if needed
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Update formData and localStorage when a file is selected
  const handleDocumentFileSelect = async (fieldName: string, file: File) => {
    const base64 = await fileToBase64(file);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: base64,
    }));
    localStorage.setItem(`registration_${fieldName}`, base64);
  };

  // Load files from localStorage on mount (optional)
  useEffect(() => {
    const fields = [
      "appointmentLetter",
      "educationalCertificates",
      "promotionLetter",
      "otherDocuments",
      "profileImage",
      "signature",
    ];
    fields.forEach((field) => {
      const base64 = localStorage.getItem(`registration_${field}`);
      if (base64) {
        setFormData((prev) => ({
          ...prev,
          [field]: base64,
        }));
      }
    });
  }, []);
  const [verifiedNIN, setVerifiedNIN] = useState<VerifyNinData | null>(null);
  

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VerificationStep
            loading={loading}
            ninVerified={ninVerified}
            setNinVerified={setNinVerified}
            formData={formData}
            onSubmit={handleVerificationSubmit}
            setVerifiedNIN={setVerifiedNIN}
            advanceToPersonalInfo={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <PersonalInfoStepII
            formData={formData}
            onSubmit={handlePersonalInfoSubmit}
            loading={loading}
            stepThreeHandle={stepThreeHandle}
            verifiedNIN={verifiedNIN}
          />
        );
        case 3:
          return (
            <EmploymentInfoStep
              formData={formData}
              handleEmploymentInfoSubmit={handleEmploymentInfoSubmit}
              loading={loading}
            />
          );
        case 4:
        return (
            <DocumentUploadStep
              formData={formData}
              updateFormData={documentFieldUpdate}
              validateStep={() => true}
              onSubmit={handleDocumentUploadSubmit}
              loading={loading}
            />
          );
        case 5:
          return (
            <PreviewStep
              formData={formData}
              updateFormData={updateFormData}
              validateStep={validateStep}
              onSubmit={handleFinalSubmit}
              loading={loading}
            />
          );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {showSuccessCard ? (
        <div className="mb-4 rounded-2xl border border-green-200 bg-gradient-to-r from-white via-green-50 to-green-50 p-4 shadow-inner shadow-green-100">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Application submitted
              </p>
              <p className="text-sm text-slate-600">
                {success || "Your registration has been submitted successfully."}
              </p>
            </div>
          </div>
        </div>
      ) : success ? (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      ) : null}

      <StepIndicator
        currentStep={currentStep}
        onStepSelect={handleStepSelect}
        maxVisitedStep={maxVisitedStep}
      />

      <div className="mt-6">{renderStep()}</div>
    </div>
  );
}
