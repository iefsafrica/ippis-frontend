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
import { useState, useEffect, useRef } from "react";
import { nigerianStates, getLgasByState } from "./nigeria-data";
import { VerifyNinData } from "@/types/verify";
// import LoadingSpinner from "@/components/loading-spinner";

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

  // Format date from DD-MM-YYYY to YYYY-MM-DD
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else if (dateStr.includes("-")) {
      const [day, month, year] = dateStr.split("-");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateStr;
  };

 const {
   register,
   handleSubmit,
   control,
   setValue,
   reset,
   watch,
   trigger,
   formState: { errors, isValid, isDirty },
 } = useForm<FormValues>({
   resolver: zodResolver(formSchema),
   mode: "onChange", // Validate on every change
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

  // Set form values when NIN data is available
  const verificationInitializedRef = useRef(false);

  useEffect(() => {
    if (!verifiedNIN || verificationInitializedRef.current) {
      setIsLoading(false);
      return;
    }

    const initialValues = {
      title: verifiedNIN.title || "",
      surname: verifiedNIN.surname || "",
      firstname: verifiedNIN.firstname || "",
      othername: verifiedNIN.othername || "",
      contact: verifiedNIN.telephoneno || "",
      email: verifiedNIN.email || "",
      dob: formatDate(verifiedNIN.birthdate) || "",
      sex:
        verifiedNIN.gender === "m"
          ? "male"
          : verifiedNIN.gender === "f"
          ? "female"
          : "",
      maritalStatus: verifiedNIN.maritalstatus || "",
      stateorigin: verifiedNIN.state_of_origin || "",
      lga: verifiedNIN.birthlga || "",
      stateres: verifiedNIN.residence_state || "",
      address: verifiedNIN.address || "",
      nok_name:
        verifiedNIN.nok_firstname && verifiedNIN.nok_surname
          ? `${verifiedNIN.nok_firstname} ${verifiedNIN.nok_surname}`
          : "",
      nok_relationship: verifiedNIN.nok_relationship || "",
      nok_phone: "",
      nok_address: verifiedNIN.nok_address1 || "",
    };

    reset(initialValues, {
      keepDefaultValues: false,
      keepErrors: false,
      keepDirty: true,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });

    verificationInitializedRef.current = true;
    setIsLoading(false);
  }, [verifiedNIN, reset, trigger]);

  useEffect(() => {
    const storedValues = {
      title: formData.title || "",
      surname: formData.surname || "",
      firstname: formData.firstName || "",
      othername: formData.otherNames || "",
      contact: formData.phoneNumber || "",
      email: formData.email || "",
      dob: formData.dateOfBirth || "",
      sex: formData.sex || "",
      maritalStatus: formData.maritalStatus || "",
      stateorigin: formData.stateOfOrigin || "",
      lga: formData.lga || "",
      stateres: formData.stateOfResidence || "",
      address: formData.addressStateOfResidence || "",
      nok_name: formData.nextOfKinName || "",
      nok_relationship: formData.nextOfKinRelationship || "",
      nok_phone: formData.nextOfKinPhoneNumber || "",
      nok_address: formData.nextOfKinAddress || "",
    };

    reset(storedValues, {
      keepDefaultValues: false,
      keepErrors: false,
      keepDirty: true,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });

    Object.entries(storedValues).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        setValue(key as keyof FormValues, value, { shouldValidate: false, shouldTouch: false });
      }
    });
  }, [formData, reset, setValue]);

  // Update LGAs when state of origin changes
  const selectedState = watch("stateorigin");
  const selectedLga = watch("lga");

  useEffect(() => {
    if (!selectedState) {
      setAvailableLgas([]);
      return;
    }

    const lgas = getLgasByState(selectedState);
    setAvailableLgas(lgas);

    if (!selectedLga && lgas.length > 0) {
      setValue("lga", lgas[0]);
    }
  }, [selectedState, selectedLga, setValue]);

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

const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
  try {
    localStorage.setItem("personalInfoData", JSON.stringify(data));
    onSubmit(transformToFormData(data));
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
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          Step 2: Personal Information
        </h2>
        <p className="text-gray-600 mb-4">
          Please provide your personal details. All fields marked with an
          asterisk (*) are required.
        </p>
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
              className={
                !isRegistrationIdConfirmed ? "border-yellow-500" : undefined
              }
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
            <Label htmlFor="title">Title*</Label>
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
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                <SelectContent>
                    {verifiedNIN?.title && verifiedNIN.title.length >= 1 ? (
                      <SelectItem value={verifiedNIN.title}>
                        {verifiedNIN.title}
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="mr">Mr</SelectItem>
                        <SelectItem value="mrs">Mrs</SelectItem>
                        <SelectItem value="miss">Miss</SelectItem>
                        <SelectItem value="dr">Dr</SelectItem>
                        <SelectItem value="prof">Prof</SelectItem>
                        <SelectItem value="chief">Chief</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Surname */}
          <div>
            <Label htmlFor="surname">Surname*</Label>
            <Input
              id="surname"
              {...register("surname", {
                onChange: () => trigger("surname"),
              })}
              placeholder="Enter your surname"
            />
            {errors.surname && (
              <p className="text-red-500 text-sm">{errors.surname.message}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="firstname">First Name*</Label>
            <Input
              id="firstname"
              {...register("firstname", {
                onChange: () => trigger("firstname"),
              })}
              placeholder="Enter your first name"
            />
            {errors.firstname && (
              <p className="text-red-500 text-sm">{errors.firstname.message}</p>
            )}
          </div>

          {/* Other Name */}
          <div>
            <Label htmlFor="othername">Other Name</Label>
            <Input
              id="othername"
              {...register("othername", {
                onChange: () => trigger("othername"),
              })}
              placeholder="Enter other names (optional)"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <Label htmlFor="contact">Phone Number*</Label>
            <Input
              id="contact"
              {...register("contact", {
                onChange: () => trigger("contact"),
              })}
              placeholder="Enter phone number"
            />
            {errors.contact && (
              <p className="text-red-500 text-sm">{errors.contact.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                onChange: () => trigger("email"),
              })}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dob">Date of Birth*</Label>
            <Input
              id="dob"
              type="date"
              {...register("dob", {
                onChange: () => trigger("dob"),
              })}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.dob && (
              <p className="text-red-500 text-sm">{errors.dob.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="sex">Gender*</Label>
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
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.sex && (
              <p className="text-red-500 text-sm">{errors.sex.message}</p>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <Label htmlFor="maritalStatus">Marital Status*</Label>
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
                >
                  <SelectTrigger>
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
            {errors.maritalStatus && (
              <p className="text-red-500 text-sm">
                {errors.maritalStatus.message}
              </p>
            )}
          </div>

          {/* State of Origin */}
          <div>
            <Label htmlFor="stateorigin">State of Origin*</Label>
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
                >
                  <SelectTrigger>
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
            {errors.stateorigin && (
              <p className="text-red-500 text-sm">
                {errors.stateorigin.message}
              </p>
            )}
          </div>

          {/* LGA */}
          <div>
            <Label htmlFor="lga">Local Government Area*</Label>
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
                  disabled={!watch("stateorigin")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {verifiedNIN?.birthlga && verifiedNIN.birthlga.length > 1 ? (
                    <SelectItem value={verifiedNIN.birthlga}>
                     {verifiedNIN.birthlga}
                    </SelectItem>

                    ) : (
                      availableLgas.map((lga) => (
                        <SelectItem key={lga} value={lga}>
                          {lga}
                        </SelectItem>
                      ))

                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.lga && (
              <p className="text-red-500 text-sm">{errors.lga.message}</p>
            )}
          </div>

          {/* State of Residence */}
          <div>
            <Label htmlFor="stateres">State of Residence*</Label>
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
                >
                  <SelectTrigger>
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
            {errors.stateres && (
              <p className="text-red-500 text-sm">{errors.stateres.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <Label htmlFor="address">Address*</Label>
            <Textarea
              id="address"
              {...register("address", {
                onChange: () => trigger("address"),
              })}
              placeholder="Enter your full address"
              className="min-h-[100px]"
            />
            {errors.address && (
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
              <Label htmlFor="nok_name">Full Name*</Label>
              <Input
                id="nok_name"
                {...register("nok_name", {
                  onChange: () => trigger("nok_name"),
                })}
                placeholder="Enter next of kin's full name"
              />
              {errors.nok_name && (
                <p className="text-red-500 text-sm">
                  {errors.nok_name.message}
                </p>
              )}
            </div>

            {/* Next of Kin Relationship */}
            <div>
              <Label htmlFor="nok_relationship">Relationship*</Label>
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
                  >
                    <SelectTrigger>
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
              {errors.nok_relationship && (
                <p className="text-red-500 text-sm">
                  {errors.nok_relationship.message}
                </p>
              )}
            </div>

            {/* Next of Kin Phone */}
            <div>
              <Label htmlFor="nok_phone">Phone Number*</Label>
              <Input
                id="nok_phone"
                {...register("nok_phone", {
                  onChange: () => trigger("nok_phone"),
                })}
                placeholder="Enter next of kin's phone number"
              />
              {errors.nok_phone && (
                <p className="text-red-500 text-sm">
                  {errors.nok_phone.message}
                </p>
              )}
            </div>

            {/* Next of Kin Address */}
            <div>
              <Label htmlFor="nok_address">Address*</Label>
              <Textarea
                id="nok_address"
                {...register("nok_address", {
                  onChange: () => trigger("nok_address"),
                })}
                placeholder="Enter next of kin's address"
                className="min-h-[80px]"
              />
              {errors.nok_address && (
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



