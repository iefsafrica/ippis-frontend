"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePersonalInfo } from "@/services/hooks/register/personal-info";
import { useEmploymentInfo } from "@/services/hooks/register/employment-info";
import { useRegistrationDocuments } from "@/services/hooks/register/documents";

let registrationInitPromise: Promise<string | null> | null = null;
let registrationInitCachedId: string | null = null;

const fetchRegistrationId = async () => {
  if (registrationInitCachedId) {
    return registrationInitCachedId;
  }

  if (!registrationInitPromise) {
    registrationInitPromise = (async () => {
      const response = await fetch("/api/register/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "createRegistration" }),
      });

      if (!response.ok) {
        throw new Error(`Registration init failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.registrationId) {
        throw new Error(data.error || "Failed to initialize registration");
      }

      registrationInitCachedId = data.registrationId;
      console.log("Initialized registrationId", data.registrationId);
      return data.registrationId;
    })();

    registrationInitPromise.catch(() => {
      registrationInitPromise = null;
    });
  }

  return registrationInitPromise;
};

const SKIP_VERIFICATION_STEP = false;

export default function RegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(SKIP_VERIFICATION_STEP ? 2 : 1);
  const [registrationId, setRegistrationId] = useState("");
  const [ninVerified, setNinVerified] = useState(false);
  const [maxVisitedStep, setMaxVisitedStep] = useState(
    SKIP_VERIFICATION_STEP ? 2 : 1
  );
  const [initialized, setInitialized] = useState(false);
  const [initRegistrationId, setInitRegistrationId] = useState<string | null>(null);
  const registrationIdResolvers = useRef<Array<(id: string) => void>>([]);

  const adoptRegistrationId = (id: string) => {
    setRegistrationId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("registration_id", id);
    }
    console.log("Adopted canonical registration_id:", id);
    registrationIdResolvers.current.forEach((resolve) => resolve(id));
    registrationIdResolvers.current = [];
  };

  const [manualRegistrationIdInput, setManualRegistrationIdInput] = useState("");
  const [registrationIdConfirmed, setRegistrationIdConfirmed] = useState(false);
  const [showRegistrationIdModal, setShowRegistrationIdModal] = useState(false);
  const [registrationIdModalError, setRegistrationIdModalError] = useState("");

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
  const [isInitializing, setIsInitializing] = useState(false);
  const hasLoadedStoredRegistrationIdRef = useRef(false);
  const personalInfoMutation = usePersonalInfo();
  const employmentInfoMutation = useEmploymentInfo();
  const registrationDocumentsMutation = useRegistrationDocuments();

    // Restore any previously saved registration_id before triggering a new init
    useEffect(() => {
      if (hasLoadedStoredRegistrationIdRef.current) {
        return;
      }

      if (typeof window === "undefined") {
        hasLoadedStoredRegistrationIdRef.current = true;
        return;
      }

      const storedId = localStorage.getItem("registration_id");
      if (storedId) {
        console.log("Restored registration_id from localStorage", storedId);
        adoptRegistrationId(storedId);
        setInitRegistrationId(storedId);
        setManualRegistrationIdInput(storedId);
        setRegistrationIdConfirmed(true);
      }

      hasLoadedStoredRegistrationIdRef.current = true;
    }, []);

    // Initialize registration when form loads
    useEffect(() => {
      if (initialized || registrationId || initRegistrationId) {
        return;
      }

      setInitialized(true);

      let isMounted = true;

      const initializeRegistration = async () => {
        try {
          setIsInitializing(true);
          const id = await fetchRegistrationId();

          if (id && isMounted) {
            setInitRegistrationId(id);
            console.log("Initialized registrationId", id);
          }
        } catch (err) {
          console.error("Registration initialization error:", err);
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An error occurred while initializing registration");
          }
        } finally {
          if (isMounted) {
            setIsInitializing(false);
          }
        }
      };

      initializeRegistration();

      return () => {
        isMounted = false;
      };
    }, [initialized, registrationId, initRegistrationId]);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasLoggedRegistrationIdRef = useRef(false);

  useEffect(() => {
    if (!registrationId || hasLoggedRegistrationIdRef.current) {
      return;
    }

    console.log("Initialized registrationId", registrationId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", registrationId);
    router.replace(`${pathname}?${params.toString()}`, { replace: true });
    hasLoggedRegistrationIdRef.current = true;
  }, [registrationId, pathname, searchParams, router]);

  const handleVerificationSubmit = async (verificationData: any) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      ...verificationData,
    }));

    console.log("Verification data received", verificationData);

    const incomingVerificationId =
      verificationData.registrationId ||
      verificationData.registration_id ||
      "";

    if (incomingVerificationId) {
      adoptRegistrationId(incomingVerificationId);
      console.log("Verification step yielded registration_id:", incomingVerificationId);
      setInitRegistrationId(incomingVerificationId);
      handleManualRegistrationIdChange(incomingVerificationId);
      setRegistrationIdConfirmed(false);
      setShowRegistrationIdModal(true);
    } else {
      console.warn("Verification response did not provide a registration_id", verificationData);
    }

    if (!verificationData.manualVerification) {
      setSuccess("Verification successful.");
    } else {
      setSuccess("Continue manually with the provided information.");
    }

    setCurrentStep((prev) => (prev < 2 ? 2 : prev));
  };

  const handleCopyRegistrationId = async () => {
    if (!manualRegistrationIdInput) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(manualRegistrationIdInput);
        toast.success("Registration ID copied");
      } catch {
        toast.error("Unable to copy registration ID");
      }
    }
  };

  const handleManualRegistrationIdChange = (value: string) => {
    setManualRegistrationIdInput(value);
    setRegistrationIdConfirmed(false);
    setRegistrationIdModalError("");
  };

  const handleConfirmRegistrationId = () => {
    if (!manualRegistrationIdInput) {
      setRegistrationIdModalError("Please enter the registration ID before continuing.");
      return;
    }

    adoptRegistrationId(manualRegistrationIdInput);
    setRegistrationIdConfirmed(true);
    setShowRegistrationIdModal(false);
    setRegistrationIdModalError("");
    toast.success("Registration ID confirmed. You can continue.");
  };

  const handlePersonalInfoSubmit = async (personalData: any) => {
    try {
      setLoading(true);
      setError("");
      const regId = await ensureRegistrationId();
      console.log("Submitting personal info with registration_id:", regId);
      console.log("Personal info payload", { registration_id: regId, ...personalData });

      const payload = { registration_id: regId, ...personalData };
      const data = await personalInfoMutation.mutateAsync(payload);

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...personalData,
        }));
        console.log("Personal info response", data);
        setSuccess("Personal information saved successfully");
        setMaxVisitedStep((prev) => Math.max(prev, 3));
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

      const regId = await ensureRegistrationId();
      console.log("Submitting employment info with registration_id:", regId);
      console.log("Employment info payload", { registration_id: regId, ...employmentData });
      const payload = { registration_id: regId, ...employmentData };
      const data = await employmentInfoMutation.mutateAsync(payload);

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...employmentData,
        }));
        console.log("Employment info response", data);
        setSuccess("Employment information saved successfully");
        setMaxVisitedStep((prev) => Math.max(prev, 4));
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
      if (!registrationId) {
        throw new Error("Missing registration_id for document upload");
      }
      console.log("Document upload registration_id:", registrationId);
      formData.append("registrationId", registrationId);
      formData.append("registration_id", registrationId);

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

      const data = await registrationDocumentsMutation.mutateAsync(formData);

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          ...documentData,
        }));
        console.log("Document upload response", data);
        setSuccess("Documents uploaded successfully");
        setCurrentStep(4);
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

  const ensureRegistrationId = async () => {
    if (!registrationIdConfirmed) {
      throw new Error("Please confirm your registration ID before continuing.");
    }

    if (manualRegistrationIdInput) {
      return manualRegistrationIdInput;
    }

    if (registrationId) {
      return registrationId;
    }

    const stored =
      typeof window !== "undefined" ? localStorage.getItem("registration_id") : null;
    if (stored) {
      adoptRegistrationId(stored);
      setManualRegistrationIdInput(stored);
      setRegistrationIdConfirmed(true);
      return stored;
    }

    return new Promise<string>((resolve) => {
      registrationIdResolvers.current.push(resolve);
    });
  };

  const buildRegistrationPayload = (
    declaration: boolean,
    id: string,
  ): EmployeeRegistrationPayload => ({
    registration_id: id,
    registrationId: id,
    declaration,
    email: formData.email || undefined,
    firstName: formData.firstName,
    surname: formData.surname,
  });

  const handleFinalSubmit = async (finalData: { declaration: boolean }) => {
    try {
      setLoading(true);
      setError("");
      setShowSuccessCard(false);

      const canonicalId = await ensureRegistrationId();
      if (!canonicalId) {
        throw new Error("Unable to resolve the registration identifier");
      }

      const firstNameValue = formData.firstName || formData.firstname;
      const surnameValue = formData.surname || formData.surname || formData.lastName;
      const emailValue = formData.email;

      if (!firstNameValue || !surnameValue || !emailValue) {
        throw new Error("Please complete your first name, surname, and email in the personal info step");
      }

      const payload = {
        registration_id: canonicalId,
        registrationId: canonicalId,
        declaration: finalData.declaration === true,
        email: emailValue,
        firstName: firstNameValue,
        firstname: firstNameValue,
        surname: surnameValue,
      };

      console.log("Final registration payload", payload);
      const response = await registerMutation.mutateAsync(payload);
      console.log("Final registration response", response);

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
          router.push(`/track?id=${canonicalId}`);
        }, 1200);
      } else {
        setError(response.message || "Failed to submit registration");
      }
    } catch (err) {
      console.error("Registration submission failed:", err);
      setShowSuccessCard(false);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while submitting registration";
      setError(errorMessage);
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
            initialRegistrationId={initRegistrationId ?? undefined}
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
            registrationIdInput={manualRegistrationIdInput}
            isRegistrationIdConfirmed={registrationIdConfirmed}
            onRegistrationIdChange={handleManualRegistrationIdChange}
          />
        );
      case 3:
        return (
          <EmploymentInfoStep
            formData={formData}
            handleEmploymentInfoSubmit={handleEmploymentInfoSubmit}
            loading={loading}
            registrationIdInput={manualRegistrationIdInput}
            isRegistrationIdConfirmed={registrationIdConfirmed}
            onRegistrationIdChange={handleManualRegistrationIdChange}
          />
        );
        case 4:
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

  const dialogOpenHandler = (open: boolean) => {
    if (!open && !registrationIdConfirmed) {
      return;
    }
    setShowRegistrationIdModal(open);
  };

  return (
    <>
      <Dialog open={showRegistrationIdModal} onOpenChange={dialogOpenHandler}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Your registration ID</DialogTitle>
            <DialogDescription>
              Please copy the IPPIS registration code below and keep it handy for every step.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modalRegistrationId">Registration ID</Label>
              <Input
                id="modalRegistrationId"
                value={manualRegistrationIdInput}
                onChange={(event) => handleManualRegistrationIdChange(event.target.value)}
                placeholder="IPPIS-XXXX"
              />
              {registrationIdModalError && (
                <p className="text-red-500 text-xs">{registrationIdModalError}</p>
              )}
            </div>
            <p className="text-sm text-slate-600">
              You will need this code in the next step. Copy it somewhere safe before continuing.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleCopyRegistrationId}
                disabled={!manualRegistrationIdInput}
              >
                Copy ID
              </Button>
              <Button
                onClick={handleConfirmRegistrationId}
                disabled={!manualRegistrationIdInput}
              >
                I have saved it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
