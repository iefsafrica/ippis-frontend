"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateSelect, parseDateValue } from "@/components/ui/date-select";
import { useState, useEffect, useRef } from "react";
import { nigerianStates, getLgasByState } from "./nigeria-data";
import { VerifyNinData } from "@/types/verify";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Form Schema
export const formSchema = z.object({
  // Personal Info
  title: z.string().min(1, "Title is required"),
  surname: z.string().min(1, "Surname is required"),
  firstname: z.string().min(1, "First name is required"),
  othername: z.string().optional(),
  contact: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(14, "Phone number must not exceed 14 digits")
    .regex(/^[0-9]+$/, "Must contain only numbers"),
  email: z.string().email("Invalid email address"),
  dob: z.string().min(1, "Date of birth is required"),
  sex: z.string().min(1, "Gender is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  stateorigin: z.string().min(1, "State of origin is required"),
  lga: z.string().min(1, "Local Government Area is required"),
  stateres: z.string().min(1, "State of residence is required"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(300, "Address too long"),

  // Next of Kin
  nok_name: z.string().min(1, "Next of kin name is required"),
  nok_relationship: z.string().min(1, "Next of kin relationship is required"),
  nok_phone: z
    .string()
    .min(11, "Next of kin phone must be at least 11 digits")
    .max(14, "Next of kin phone must not exceed 14 digits"),
  nok_address: z.string().min(1, "Next of kin address is required").max(300),
});

type FormValues = z.infer<typeof formSchema>;

interface PersonalInfoStepProps {
  formData: any;
  onSubmit: (data: any) => void;
  loading: boolean;
  stepThreeHandle?: any;
  verifiedNIN: VerifyNinData | null;
  registrationIdInput: string;
  isRegistrationIdConfirmed: boolean;
  onRegistrationIdChange: (value: string) => void;
}

export default function ProfileForm({
  formData,
  onSubmit,
  loading,
  verifiedNIN,
  registrationIdInput,
  isRegistrationIdConfirmed,
  onRegistrationIdChange,
}: PersonalInfoStepProps) {
  const [availableLgas, setAvailableLgas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRawDob = (source: any): string => {
    if (!source || typeof source !== "object") return "";
    return (
      (typeof source.birthdate === "string" && source.birthdate) ||
      (typeof source.date_of_birth === "string" && source.date_of_birth) ||
      (typeof source.dob === "string" && source.dob) ||
      (typeof source.birth_date === "string" && source.birth_date) ||
      (typeof source.dateOfBirth === "string" && source.dateOfBirth) ||
      (typeof source.birthDate === "string" && source.birthDate) ||
      (typeof source.DateOfBirth === "string" && source.DateOfBirth) ||
      (typeof source.BirthDate === "string" && source.BirthDate) ||
      (typeof source.bdate === "string" && source.bdate) ||
      ""
    );
  };

  // Format date to YYYY-MM-DD
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "";
    const parsed = parseDateValue(dateStr);
    if (parsed.year && parsed.month && parsed.day) {
      return `${parsed.year}-${parsed.month}-${parsed.day}`;
    }
    return String(dateStr).trim();
  };

  const normalizeState = (state?: string) => {
    if (!state) return "";
    const cleaned = state.replace(/\s+state$/i, "").trim().toLowerCase();
    const found = nigerianStates.find(
      (s) => s.toLowerCase() === cleaned || s.toLowerCase() === state.trim().toLowerCase()
    );
    return found || state;
  };

  const profileImageSrc =
    (typeof verifiedNIN?.profileImage === "string" && verifiedNIN.profileImage) ||
    (typeof verifiedNIN?.photo === "string" && verifiedNIN.photo) ||
    (typeof verifiedNIN?.photo_base64 === "string" && verifiedNIN.photo_base64) ||
    (typeof formData?.profileImage === "string" && formData.profileImage) ||
    "";

  // Helper to check if a specific field was auto-filled from verified NIN data
  const isFieldVerified = (fieldName: keyof FormValues): boolean => {
    if (!verifiedNIN) return false;

    switch (fieldName) {
      case "surname":
        return Boolean(verifiedNIN.surname || verifiedNIN.last_name);
      case "firstname":
        return Boolean(verifiedNIN.firstname || verifiedNIN.first_name);
      case "othername":
        return Boolean(
          verifiedNIN.middlename ||
            verifiedNIN.middle_name ||
            verifiedNIN.othername ||
            verifiedNIN.other_name
        );
      case "contact":
        return Boolean(verifiedNIN.telephoneno || verifiedNIN.phone || verifiedNIN.phone_number);
      case "email":
        return Boolean(verifiedNIN.email);
      case "dob": {
        const raw = getRawDob(verifiedNIN);
        return Boolean(raw && formatDate(raw));
      }
      case "sex":
        return Boolean(verifiedNIN.gender || verifiedNIN.sex);
      case "maritalStatus":
        return Boolean(verifiedNIN.maritalstatus || verifiedNIN.marital_status);
      case "stateorigin":
        return Boolean(
          verifiedNIN.state_of_origin ||
            verifiedNIN.self_origin_state ||
            verifiedNIN.birthstate ||
            verifiedNIN.stateorigin
        );
      case "lga":
        return Boolean(
          verifiedNIN.birthlga ||
            verifiedNIN.residence_lga ||
            verifiedNIN.lga_origin ||
            verifiedNIN.self_origin_lga ||
            verifiedNIN.lga
        );
      case "stateres":
        return Boolean(verifiedNIN.residence_state || verifiedNIN.residenceState || verifiedNIN.stateres);
      case "address":
        return Boolean(
          verifiedNIN.address ||
            verifiedNIN.residence_address ||
            verifiedNIN.residenceAdressLine1 ||
            verifiedNIN.residence_address_line1
        );
      case "title":
        return Boolean(verifiedNIN.title);
      case "nok_name":
        return Boolean(
          verifiedNIN.nok_name ||
            (verifiedNIN.nok_firstname && verifiedNIN.nok_surname)
        );
      case "nok_relationship":
        return Boolean(verifiedNIN.nok_relationship);
      case "nok_phone":
        return Boolean(verifiedNIN.nok_phone || verifiedNIN.nok_telephoneno);
      case "nok_address":
        return Boolean(verifiedNIN.nok_address || verifiedNIN.nok_address1);
      default:
        return false;
    }
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    trigger,
    getValues,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      surname: "",
      firstname: "",
      othername: "",
      contact: "",
      email: "",
      dob: "",
      sex: "",
      maritalStatus: "",
      stateorigin: "",
      lga: "",
      stateres: "",
      address: "",
      nok_name: "",
      nok_relationship: "",
      nok_phone: "",
      nok_address: "",
    },
  });

  const verificationInitializedRef = useRef(false);

  useEffect(() => {
    const rawSex = String(verifiedNIN?.gender || verifiedNIN?.sex || "").toLowerCase();
    const normalizedSex = rawSex.startsWith("m")
      ? "male"
      : rawSex.startsWith("f")
        ? "female"
        : "";

    const rawMarital = String(verifiedNIN?.maritalstatus || verifiedNIN?.marital_status || "").trim();
    const normalizedMarital = rawMarital
      ? rawMarital.charAt(0).toUpperCase() + rawMarital.slice(1).toLowerCase()
      : "";

    const rawTitle = (verifiedNIN?.title || "").toLowerCase();
    const validTitles = ["mr", "mrs", "miss", "dr", "prof", "chief"];
    const normalizedTitle = validTitles.includes(rawTitle) ? rawTitle : (verifiedNIN?.title || "");

    const verifiedState = normalizeState(
      verifiedNIN?.state_of_origin ||
        verifiedNIN?.self_origin_state ||
        verifiedNIN?.birthstate ||
        verifiedNIN?.stateorigin
    );

    const verifiedResState = normalizeState(
      verifiedNIN?.residence_state ||
        verifiedNIN?.residenceState ||
        verifiedNIN?.stateres
    );

    const verifiedValues = verifiedNIN
      ? {
          title: normalizedTitle || "",
          surname: verifiedNIN.surname || verifiedNIN.last_name || "",
          firstname: verifiedNIN.firstname || verifiedNIN.first_name || "",
          othername:
            verifiedNIN.othername ||
            verifiedNIN.other_name ||
            verifiedNIN.middlename ||
            verifiedNIN.middle_name ||
            "",
          contact:
            verifiedNIN.telephoneno ||
            verifiedNIN.phone ||
            verifiedNIN.phone_number ||
            "",
          email: verifiedNIN.email || "",
          dob: formatDate(getRawDob(verifiedNIN)) || "",
          sex: normalizedSex || "",
          maritalStatus: normalizedMarital || "",
          stateorigin: verifiedState || "",
          lga:
            verifiedNIN.birthlga ||
            verifiedNIN.residence_lga ||
            verifiedNIN.lga_origin ||
            verifiedNIN.self_origin_lga ||
            verifiedNIN.lga ||
            "",
          stateres: verifiedResState || "",
          address:
            verifiedNIN.address ||
            verifiedNIN.residence_address ||
            verifiedNIN.residenceAdressLine1 ||
            verifiedNIN.residence_address_line1 ||
            "",
          nok_name:
            verifiedNIN.nok_name ||
            (verifiedNIN.nok_firstname && verifiedNIN.nok_surname
              ? `${verifiedNIN.nok_firstname} ${verifiedNIN.nok_surname}`.trim()
              : ""),
          nok_relationship: verifiedNIN.nok_relationship || "",
          nok_phone: verifiedNIN.nok_phone || verifiedNIN.nok_telephoneno || "",
          nok_address: verifiedNIN.nok_address || verifiedNIN.nok_address1 || "",
        }
      : {};

    const storedValues = {
      title: formData.title || "",
      surname: formData.surname || "",
      firstname: formData.firstName || formData.firstname || "",
      othername: formData.otherNames || formData.othername || "",
      contact: formData.phoneNumber || formData.contact || "",
      email: formData.email || "",
      dob: formatDate(getRawDob(formData) || formData.dateOfBirth || formData.dob) || "",
      sex: formData.sex || formData.gender || "",
      maritalStatus: formData.maritalStatus || "",
      stateorigin: normalizeState(formData.stateOfOrigin || formData.stateorigin) || "",
      lga: formData.lga || "",
      stateres: normalizeState(formData.stateOfResidence || formData.stateres) || "",
      address: formData.addressStateOfResidence || formData.address || "",
      nok_name: formData.nextOfKinName || formData.nok_name || "",
      nok_relationship: formData.nextOfKinRelationship || formData.nok_relationship || "",
      nok_phone: formData.nextOfKinPhoneNumber || formData.nok_phone || "",
      nok_address: formData.nextOfKinAddress || formData.nok_address || "",
    };

    const hasVerifiedValues = Boolean(verifiedNIN);
    const mergedValues = {
      ...storedValues,
      ...Object.fromEntries(
        Object.entries(verifiedValues).filter(([, val]) => val !== "" && val !== null && val !== undefined)
      ),
    };

    if (hasVerifiedValues || !verificationInitializedRef.current) {
      reset(mergedValues, {
        keepDefaultValues: false,
        keepErrors: false,
        keepDirty: true,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });

      verificationInitializedRef.current = hasVerifiedValues;

      if (mergedValues.dob) {
        setValue("dob", mergedValues.dob, { shouldValidate: true, shouldDirty: true });
      }
    }

    setIsLoading(false);
  }, [formData, verifiedNIN, reset]);

  // Update LGAs when state of origin changes
  const selectedState = watch("stateorigin");
  const selectedLga = watch("lga");

  useEffect(() => {
    if (!selectedState) {
      setAvailableLgas([]);
      return;
    }

    const lgas = getLgasByState(selectedState);
    const verifiedLga =
      verifiedNIN?.birthlga ||
      verifiedNIN?.residence_lga ||
      verifiedNIN?.lga_origin ||
      verifiedNIN?.self_origin_lga ||
      verifiedNIN?.lga ||
      "";

    // If verified LGA exists and isn't in default list, prepend it
    const mergedLgas = verifiedLga && !lgas.includes(verifiedLga) ? [verifiedLga, ...lgas] : lgas;
    setAvailableLgas(mergedLgas);

    if (!selectedLga && mergedLgas.length > 0) {
      setValue("lga", mergedLgas[0]);
    }
  }, [selectedState, selectedLga, setValue, verifiedNIN]);

  const transformToFormData = (values: FormValues) => ({
    title: values.title,
    surname: values.surname,
    firstname: values.firstname,
    firstName: values.firstname,
    first_name: values.firstname,
    otherNames: values.othername || "",
    other_name: values.othername || "",
    phoneNumber: values.contact,
    phone_number: values.contact,
    telephoneno: values.contact,
    email: values.email,
    dateOfBirth: values.dob,
    date_of_birth: values.dob,
    sex: values.sex,
    gender: values.sex,
    maritalStatus: values.maritalStatus,
    marital_status: values.maritalStatus,
    stateOfOrigin: values.stateorigin,
    state_of_origin: values.stateorigin,
    lga: values.lga,
    stateOfResidence: values.stateres,
    state_of_residence: values.stateres,
    addressStateOfResidence: values.address,
    address_state_of_residence: values.address,
    nextOfKinName: values.nok_name,
    next_of_kin_name: values.nok_name,
    nextOfKinRelationship: values.nok_relationship,
    next_of_kin_relationship: values.nok_relationship,
    nextOfKinPhoneNumber: values.nok_phone,
    next_of_kin_phone_number: values.nok_phone,
    nextOfKinAddress: values.nok_address,
    next_of_kin_address: values.nok_address,
  });

  const showFieldError = (field: keyof FormValues) =>
    Boolean(errors[field] && (touchedFields[field] || isSubmitted));

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    try {
      // Merge getValues() with data to ensure disabled/readOnly fields are NEVER dropped
      const currentValues = getValues();
      const finalData: FormValues = {
        ...currentValues,
        ...data,
      };

      localStorage.setItem("personalInfoData", JSON.stringify(finalData));
      onSubmit(transformToFormData(finalData));
    } catch (error) {
      console.error("Failed to save personal info:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="ml-2">Loading your information...</span>
      </div>
    );
  }

  return (
    <section>
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          Step 2: Personal Information
        </h2>
        <p className="text-gray-600 mb-4">
          Please provide your personal details. All fields marked with an asterisk (*) are required.
        </p>

        {/* Passport Photo Preview Banner if retrieved */}
        {profileImageSrc && (
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 mb-6 bg-green-50/90 border border-green-300 rounded-lg shadow-sm">
            <div className="relative shrink-0">
              <img
                src={profileImageSrc}
                alt="Passport Photograph"
                className="h-24 w-24 rounded-lg object-cover border-2 border-green-600 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 shadow">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-green-800 font-semibold text-base">
                <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                Verified Identity Passport Photograph
              </div>
              <p className="text-xs sm:text-sm text-green-700">
                Retrieved directly from your National Identity Database (NIN) record and locked for security.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-green-800 bg-green-100 font-medium px-2 py-0.5 rounded-full mt-1">
                <Lock className="h-3 w-3" /> Auto-filled & Locked
              </span>
            </div>
          </div>
        )}

        {/* Info Banner when fields are locked from NIN */}
        {Boolean(verifiedNIN) && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 mb-6 flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm text-amber-900">
              <span className="font-semibold">Identity Verified: </span>
              Personal details synchronized from your NIN record have been auto-filled and locked from editing to ensure data accuracy. Please review them and complete any remaining open fields.
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registrationId">Registration ID</Label>
            <Input
              id="registrationId"
              value={registrationIdInput}
              onChange={(event) => onRegistrationIdChange(event.target.value)}
              placeholder="Enter the IPPIS code you got from verification"
              className={!isRegistrationIdConfirmed ? "border-yellow-500" : undefined}
            />
            {!isRegistrationIdConfirmed && (
              <p className="text-yellow-600 text-xs">
                Confirm the registration ID from the modal before submitting.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="title">Title*</Label>
              {isFieldVerified("title") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    trigger("title");
                  }}
                  value={field.value}
                  disabled={isFieldVerified("title")}
                >
                  <SelectTrigger className={cn(isFieldVerified("title") && "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed")}>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    {verifiedNIN?.title && !["mr", "mrs", "miss", "dr", "prof", "chief"].includes(verifiedNIN.title.toLowerCase()) ? (
                      <SelectItem value={verifiedNIN.title}>{verifiedNIN.title}</SelectItem>
                    ) : null}
                    <SelectItem value="mr">Mr</SelectItem>
                    <SelectItem value="mrs">Mrs</SelectItem>
                    <SelectItem value="miss">Miss</SelectItem>
                    <SelectItem value="dr">Dr</SelectItem>
                    <SelectItem value="prof">Prof</SelectItem>
                    <SelectItem value="chief">Chief</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {showFieldError("title") && errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Surname */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="surname">Surname*</Label>
              {isFieldVerified("surname") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Input
              id="surname"
              {...register("surname", {
                onChange: () => trigger("surname"),
              })}
              placeholder="Enter your surname"
              readOnly={isFieldVerified("surname")}
              disabled={isFieldVerified("surname")}
              className={cn(
                isFieldVerified("surname") &&
                  "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
              )}
            />
            {showFieldError("surname") && errors.surname && (
              <p className="text-red-500 text-sm">{errors.surname.message}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="firstname">First Name*</Label>
              {isFieldVerified("firstname") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Input
              id="firstname"
              {...register("firstname", {
                onChange: () => trigger("firstname"),
              })}
              placeholder="Enter your first name"
              readOnly={isFieldVerified("firstname")}
              disabled={isFieldVerified("firstname")}
              className={cn(
                isFieldVerified("firstname") &&
                  "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
              )}
            />
            {showFieldError("firstname") && errors.firstname && (
              <p className="text-red-500 text-sm">{errors.firstname.message}</p>
            )}
          </div>

          {/* Other Name */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="othername">Other Name</Label>
              {isFieldVerified("othername") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Input
              id="othername"
              {...register("othername", {
                onChange: () => trigger("othername"),
              })}
              placeholder="Enter other names (optional)"
              readOnly={isFieldVerified("othername")}
              disabled={isFieldVerified("othername")}
              className={cn(
                isFieldVerified("othername") &&
                  "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
              )}
            />
          </div>

          {/* Contact Phone */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="contact">Phone Number*</Label>
              {isFieldVerified("contact") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Input
              id="contact"
              {...register("contact", {
                onChange: () => trigger("contact"),
              })}
              placeholder="Enter phone number"
              readOnly={isFieldVerified("contact")}
              disabled={isFieldVerified("contact")}
              className={cn(
                isFieldVerified("contact") &&
                  "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
              )}
            />
            {showFieldError("contact") && errors.contact && (
              <p className="text-red-500 text-sm">{errors.contact.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="email">Email*</Label>
              {isFieldVerified("email") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Input
              id="email"
              type="email"
              {...register("email", {
                onChange: () => trigger("email"),
              })}
              placeholder="Enter email address"
              readOnly={isFieldVerified("email")}
              disabled={isFieldVerified("email")}
              className={cn(
                isFieldVerified("email") &&
                  "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
              )}
            />
            {showFieldError("email") && errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <div className="flex items-center mb-1">
              <Label>Date of Birth*</Label>
              {isFieldVerified("dob") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <DateSelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    trigger("dob");
                  }}
                  maxDate={new Date()}
                  triggerClassName={cn("h-10", isFieldVerified("dob") && "bg-slate-100 cursor-not-allowed opacity-90")}
                  error={!!errors.dob}
                  disabled={isFieldVerified("dob")}
                />
              )}
            />
            {showFieldError("dob") && errors.dob && (
              <p className="text-red-500 text-sm">{errors.dob.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="sex">Gender*</Label>
              {isFieldVerified("sex") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Controller
              name="sex"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    trigger("sex");
                  }}
                  value={field.value}
                  disabled={isFieldVerified("sex")}
                >
                  <SelectTrigger className={cn(isFieldVerified("sex") && "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed")}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {showFieldError("sex") && errors.sex && (
              <p className="text-red-500 text-sm">{errors.sex.message}</p>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="maritalStatus">Marital Status*</Label>
              {isFieldVerified("maritalStatus") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    trigger("maritalStatus");
                  }}
                  value={field.value}
                  disabled={isFieldVerified("maritalStatus")}
                >
                  <SelectTrigger className={cn(isFieldVerified("maritalStatus") && "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed")}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {showFieldError("maritalStatus") && errors.maritalStatus && (
              <p className="text-red-500 text-sm">
                {errors.maritalStatus.message}
              </p>
            )}
          </div>

          {/* State of Origin */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="stateorigin">State of Origin*</Label>
              {isFieldVerified("stateorigin") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Controller
              name="stateorigin"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    trigger("stateorigin");
                  }}
                  value={field.value}
                  disabled={isFieldVerified("stateorigin")}
                >
                  <SelectTrigger className={cn(isFieldVerified("stateorigin") && "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed")}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {showFieldError("stateorigin") && errors.stateorigin && (
              <p className="text-red-500 text-sm">
                {errors.stateorigin.message}
              </p>
            )}
          </div>

          {/* LGA */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="lga">Local Government Area*</Label>
              {isFieldVerified("lga") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Controller
              name="lga"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    trigger("lga");
                  }}
                  value={field.value}
                  disabled={isFieldVerified("lga") || !watch("stateorigin")}
                >
                  <SelectTrigger className={cn(isFieldVerified("lga") && "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed")}>
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLgas.map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {showFieldError("lga") && errors.lga && (
              <p className="text-red-500 text-sm">{errors.lga.message}</p>
            )}
          </div>

          {/* State of Residence */}
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="stateres">State of Residence*</Label>
              {isFieldVerified("stateres") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Controller
              name="stateres"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    trigger("stateres");
                  }}
                  value={field.value}
                  disabled={isFieldVerified("stateres")}
                >
                  <SelectTrigger className={cn(isFieldVerified("stateres") && "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed")}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {showFieldError("stateres") && errors.stateres && (
              <p className="text-red-500 text-sm">{errors.stateres.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-1">
              <Label htmlFor="address">Address*</Label>
              {isFieldVerified("address") && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <Textarea
              id="address"
              {...register("address", {
                onChange: () => trigger("address"),
              })}
              placeholder="Enter your full address"
              className={cn(
                "min-h-[100px]",
                isFieldVerified("address") &&
                  "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
              )}
              readOnly={isFieldVerified("address")}
              disabled={isFieldVerified("address")}
            />
            {showFieldError("address") && errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Next of Kin Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Next of Kin Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Next of Kin Name */}
            <div>
              <div className="flex items-center mb-1">
                <Label htmlFor="nok_name">Full Name*</Label>
                {isFieldVerified("nok_name") && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                )}
              </div>
              <Input
                id="nok_name"
                {...register("nok_name", {
                  onChange: () => trigger("nok_name"),
                })}
                placeholder="Enter next of kin's full name"
                readOnly={isFieldVerified("nok_name")}
                disabled={isFieldVerified("nok_name")}
                className={cn(
                  isFieldVerified("nok_name") &&
                    "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
                )}
              />
              {showFieldError("nok_name") && errors.nok_name && (
                <p className="text-red-500 text-sm">
                  {errors.nok_name.message}
                </p>
              )}
            </div>

            {/* Next of Kin Relationship */}
            <div>
              <div className="flex items-center mb-1">
                <Label htmlFor="nok_relationship">Relationship*</Label>
                {isFieldVerified("nok_relationship") && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                )}
              </div>
              <Controller
                name="nok_relationship"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      trigger("nok_relationship");
                    }}
                    value={field.value}
                    disabled={isFieldVerified("nok_relationship")}
                  >
                    <SelectTrigger className={cn(isFieldVerified("nok_relationship") && "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed")}>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {showFieldError("nok_relationship") && errors.nok_relationship && (
                <p className="text-red-500 text-sm">
                  {errors.nok_relationship.message}
                </p>
              )}
            </div>

            {/* Next of Kin Phone */}
            <div>
              <div className="flex items-center mb-1">
                <Label htmlFor="nok_phone">Phone Number*</Label>
                {isFieldVerified("nok_phone") && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                )}
              </div>
              <Input
                id="nok_phone"
                {...register("nok_phone", {
                  onChange: () => trigger("nok_phone"),
                })}
                placeholder="Enter next of kin's phone number"
                readOnly={isFieldVerified("nok_phone")}
                disabled={isFieldVerified("nok_phone")}
                className={cn(
                  isFieldVerified("nok_phone") &&
                    "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
                )}
              />
              {showFieldError("nok_phone") && errors.nok_phone && (
                <p className="text-red-500 text-sm">
                  {errors.nok_phone.message}
                </p>
              )}
            </div>

            {/* Next of Kin Address */}
            <div>
              <div className="flex items-center mb-1">
                <Label htmlFor="nok_address">Address*</Label>
                {isFieldVerified("nok_address") && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                )}
              </div>
              <Textarea
                id="nok_address"
                {...register("nok_address", {
                  onChange: () => trigger("nok_address"),
                })}
                placeholder="Enter next of kin's address"
                className={cn(
                  "min-h-[80px]",
                  isFieldVerified("nok_address") &&
                    "bg-slate-100 text-slate-800 border-slate-200 cursor-not-allowed select-none pointer-events-none"
                )}
                readOnly={isFieldVerified("nok_address")}
                disabled={isFieldVerified("nok_address")}
              />
              {showFieldError("nok_address") && errors.nok_address && (
                <p className="text-red-500 text-sm">
                  {errors.nok_address.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" className="mt-6" disabled={loading}>
          {loading ? "Processing..." : "Next"}
        </Button>
      </form>
    </section>
  );
}
