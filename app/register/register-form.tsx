"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "./step-indicator";
import VerificationStep from "./verification-step";
import PersonalInfoStepII from "./personal-info-step";
import EmploymentInfoStep from "@/app/register/employment-info-stepII";
// import { FileUploader } from "./file-uploader";
import DocumentUploadStep from "./document-upload-step";
import { PreviewStep } from "./preview-step";

export default function RegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState("");
  const [ninVerified, setNinVerified] = useState(false);

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

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...verificationData,
          bvnVerified: data.bvnVerified,
          ninVerified: data.ninVerified,
        }));

        if (data.bvnVerified && data.ninVerified) {
          setSuccess("Verification successful");
          alert("SUCCESS");
          setCurrentStep(2);
        } else {
          setError("Verification failed. Please check your BVN and NIN.");
        }
      } else {
        setError(data.error || "Failed to verify information");
      }
    } catch (err) {
      setError("An error occurred during verification");
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleFinalSubmit = async (finalData: any) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/register/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          declaration: finalData.declaration,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          declaration: finalData.declaration,
        }));
        setSuccess("Registration submitted successfully");

        // Redirect to success page
        router.push(`/track?id=${registrationId}`);
      } else {
        setError(data.error || "Failed to submit registration");
      }
    } catch (err) {
      setError("An error occurred while submitting registration");
      console.error(err);
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
  const handleDocsUploadSubmit = async (documentData: any) => {
    setSuccess("Files saved to local storage only. No upload to server.");
    setCurrentStep(5);
  };

  const stepFourHandle = () => {
    setCurrentStep(4); // Instead of assigning the component
  };

  const [verifiedNIN, setVerifiedNIN] = useState<any[]>([]);
  

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
            onSubmit={handleEmploymentInfoSubmit}
            loading={loading}
            stepFourHandle={stepFourHandle}
          />
        );
      case 4:
        return (
          <DocumentUploadStep
            formData={formData}
            updateFormData={(data: any) => {
              const fieldName = Object.keys(data)[0];
              const value = data[fieldName];
              setFormData((prev) => ({
                ...prev,
                [fieldName]: value,
              }));
              localStorage.setItem(`registration_${fieldName}`, value);
            }}
            validateStep={() => true}
            handleDocsUploadSubmit={handleDocsUploadSubmit}
            loading={loading}
          />
        );
      case 5:
        return (
          <PreviewStep
            formData={formData}
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

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <StepIndicator currentStep={currentStep} totalSteps={5} />

      <div className="mt-6">{renderStep()}</div>
    </div>
  );
}
