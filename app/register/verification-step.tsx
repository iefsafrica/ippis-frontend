"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Props Interface
interface VerificationStepProps {
  formData: { bvn: string; nin: string };
  onSubmit: (data: { bvn: string; nin: string }) => void;
  loading: boolean;
  ninVerified: boolean;
  setNinVerified: (v: boolean) => void;
  setVerifiedNIN: React.Dispatch<React.SetStateAction<any[]>>;
}

// Util
const isValidElevenDigits = (val: string) => /^\d{11}$/.test(val);

// Retry Helper
const verifyWithRetries = async (
  url: string,
  data: any,
  setVerifiedNIN: React.Dispatch<React.SetStateAction<any[]>>,
  retries = 3,
  delay = 1000,
): Promise<{ success: boolean; result?: any; error?: string }> => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
      });
      const result = await res.json();
      setVerifiedNIN(result.data)

      if (res.ok && result.verified) {
        return { success: true, result };
      }

      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    } catch (err) {
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
  return { success: false, error: "Verification failed after retries." };
};

// NIN Verifier Function
const verifyNIN = async (
  nin: string,
  setVerifiedNIN: React.Dispatch<React.SetStateAction<any[]>>
) => {
  if (!isValidElevenDigits(nin)) {
    return { success: false, error: "NIN must be 11 digits." };
  }

  return await verifyWithRetries("/api/verify/nin", { nin }, setVerifiedNIN);
};

// Main Component
const VerificationStep: React.FC<VerificationStepProps> = ({
  formData,
  onSubmit,
  loading,
  ninVerified,
  setNinVerified,
  setVerifiedNIN,
}) => {
  const [bvn, setBvn] = useState(formData.bvn || "");
  const [nin, setNin] = useState(formData.nin || "");
  const [bvnVerified, setBvnVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<{ bvn?: string; nin?: string }>({});
  const [buttonLoading, setButtonLoading] = useState(false);

  const validateInputs = () => {
    const errs: typeof errors = {};
    if (!isValidElevenDigits(bvn)) errs.bvn = "BVN must be 11 digits";
    if (!isValidElevenDigits(nin)) errs.nin = "NIN must be 11 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setButtonLoading(true);
    setErrors({});

    if (!validateInputs()) {
      setButtonLoading(false);
      return;
    }

    const { success, error } = await verifyNIN(nin, setVerifiedNIN);
    if (!success) {
      setErrors((prev) => ({ ...prev, nin: error }));
      setButtonLoading(false);
      return;
    }

    setNinVerified?.(true);
    setBvnVerified(true);
    setShowModal(true);
    onSubmit({ bvn, nin });
    setButtonLoading(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-green-700 mb-2">
        Step 1: Identity Verification
      </h2>
      <p className="text-gray-600 mb-4">
        Provide your Bank Verification Number (BVN) and National Identification
        Number (NIN).
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* BVN */}
            <div className="space-y-2">
              <Label htmlFor="bvn">Bank Verification Number (BVN)</Label>
              <Input
                id="bvn"
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                placeholder="Enter your 11-digit BVN"
                maxLength={11}
                disabled={loading}
                className={errors.bvn ? "border-red-500" : ""}
              />
              {errors.bvn && (
                <p className="text-red-500 text-xs">{errors.bvn}</p>
              )}
              {bvnVerified && (
                <p className="flex items-center text-green-600 text-sm mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" /> BVN verified
                </p>
              )}
            </div>

            {/* NIN */}
            <div className="space-y-2">
              <Label htmlFor="nin">National Identification Number (NIN)</Label>
              <Input
                id="nin"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                placeholder="Enter your 11-digit NIN"
                maxLength={11}
                disabled={loading}
                className={errors.nin ? "border-red-500" : ""}
              />
              {errors.nin && (
                <p className="text-red-500 text-xs">{errors.nin}</p>
              )}
              {ninVerified && (
                <p className="flex items-center text-green-600 text-sm mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" /> NIN verified
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Important</p>
              <p>
                Please enter correct BVN and NIN. These cannot be changed later.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || buttonLoading}>
            {loading || buttonLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-[450px] flex flex-col items-center justify-center">
            <DialogHeader className="flex flex-col items-center gap-5">
              <DialogTitle>
                <SuccessIcon />
              </DialogTitle>
              <DialogDescription className="flex flex-col items-center gap-5">
                <span className="text-[28px] font-semibold">Success!</span>
                <span className="text-[16px] text-center">
                  Your <strong>BVN</strong> and <strong>NIN</strong> have been
                  verified.
                </span>
                <DialogTrigger asChild>
                  <button className="px-6 py-3 rounded-[8px] text-white bg-green-700 hover:bg-green-800 text-[18px] mt-3">
                    Continue
                  </button>
                </DialogTrigger>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
};

export default VerificationStep;

//  Success SVG
const SuccessIcon = () => (
  <svg fill="#15803d" height="80px" width="80px" viewBox="0 0 512.078 512.078">
    <path d="M508.087,2.425c-4.587-3.733-11.307-3.093-15.04,1.493l-306.56,374.827L92.94,284.771c-4.267-4.053-10.987-4.053-15.04,0.213c-4.053,4.16-4.053,10.667,0,14.827l101.867,102.4c2.027,2.027,4.693,3.093,7.573,3.2h0.533c2.987-0.107,5.867-1.6,7.787-3.947l314.133-384C513.314,12.985,512.674,6.264,508.087,2.425z" />
    <path d="M387.447,256.291c-5.76,1.28-9.28,7.04-8,12.8c2.987,13.227,4.587,26.773,4.587,40.32c0,99.947-81.387,181.333-181.333,181.333S21.367,409.358,21.367,309.411S102.754,128.078,202.7,128.078c27.947-0.107,55.573,6.4,80.533,18.88c5.333,2.56,11.733,0.427,14.293-4.907c2.56-5.227,0.427-11.52-4.8-14.187c-27.947-13.973-58.773-21.227-90.027-21.12c-111.787,0-202.667,90.88-202.667,202.667S90.914,512.078,202.7,512.078s202.667-90.88,202.667-202.667c0-15.147-1.707-30.293-5.12-45.12C398.967,258.531,393.207,254.904,387.447,256.291z" />
  </svg>
);
