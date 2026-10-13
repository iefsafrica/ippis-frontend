function extractAndFormatPhoto(rawObj: any): string | null {
  if (!rawObj || typeof rawObj !== "object") return null;

  const candidates = [
    rawObj.photo,
    rawObj.data?.photo,
    rawObj.photo_base64,
    rawObj.data?.photo_base64,
    rawObj.photoBase64,
    rawObj.data?.photoBase64,
    rawObj.image,
    rawObj.data?.image,
    rawObj.passport,
    rawObj.data?.passport,
    rawObj.picture,
    rawObj.data?.picture,
    rawObj.avatar,
    rawObj.data?.avatar,
    rawObj.selfie,
    rawObj.data?.selfie,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      const trimmed = candidate.trim();
      if (
        trimmed.startsWith("data:image/") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://")
      ) {
        return trimmed;
      }
      return `data:image/jpeg;base64,${trimmed}`;
    }
  }

  return null;
}

export async function verifyNIN(nin: string): Promise<{
  verified: boolean;
  message: string;
  status?: string;
  error?: string;
  data: any | null;
}> {
  try {
    const normalizedNin = nin?.trim();
    if (!/^\d{11}$/.test(normalizedNin)) {
      return {
        verified: false,
        message: "Invalid NIN format. NIN must be 11 digits.",
        error: "Invalid NIN format. NIN must be 11 digits.",
        data: null,
      };
    }

    const apiKey = process.env.NETAPPS_SECRET_KEY?.trim();
    const url =
      process.env.NETAPPS_URL?.trim() ||
      "https://kyc-api.netapps.ng/api/v1/kyc/nin";

    if (!apiKey) {
      return {
        verified: false,
        message: "NETAPPS_SECRET_KEY is missing in environment.",
        error: "NETAPPS_SECRET_KEY is missing in environment.",
        data: null,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ nin: normalizedNin }),
    });

    const raw = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      return {
        verified: false,
        message: "Invalid JSON response from verification API.",
        error: "Invalid JSON response from verification API.",
        data: null,
      };
    }

    console.log("NIN verification response:", data);

    const status = data?.status?.toLowerCase();
    const isSuccessStatus = status === "successful" || status === "success";
    const hasDataObject = Boolean(data?.data && typeof data.data === "object");
    const isBooleanSuccess = data?.error === false;
    const ninValue =
      data?.nin !== undefined && data?.nin !== null
        ? String(data.nin).trim()
        : null;
    const hasRootNin = Boolean(ninValue && /^\d{11}$/.test(ninValue));

    const photo = extractAndFormatPhoto(data);

    // Case 1 & 2: Wrapped response in data.data
    if ((isSuccessStatus || isBooleanSuccess) && hasDataObject) {
      const mergedData = {
        ...data.data,
        nin: normalizedNin,
        verified: true,
        ...(photo ? { photo, photo_base64: photo, image: photo, passport: photo, profileImage: photo } : {}),
      };

      return {
        verified: true,
        message: data.message || "NIN verified successfully",
        status: data?.status,
        data: mergedData,
      };
    }

    // Case 3: Root-level response
    if (hasRootNin || (isSuccessStatus && !hasDataObject)) {
      const mergedData = {
        ...data,
        nin: ninValue || normalizedNin,
        verified: true,
        firstname: data.firstname ?? data.first_name ?? null,
        surname: data.surname ?? data.last_name ?? null,
        middlename: data.middlename ?? data.middle_name ?? null,
        gender: data.gender ?? data.sex ?? null,
        birthdate: data.birthdate ?? data.date_of_birth ?? data.birth_date ?? data.dateOfBirth ?? data.dob ?? null,
        telephoneno: data.telephoneno ?? data.phone ?? data.phone_number ?? null,
        residenceAdressLine1: data.residenceAdressLine1 ?? data.residence_address ?? data.address ?? null,
        residenceTown: data.residenceTown ?? null,
        residenceLga: data.residenceLga ?? data.lga ?? null,
        residenceState: data.residenceState ?? data.state ?? null,
        ...(photo ? { photo, photo_base64: photo, image: photo, passport: photo, profileImage: photo } : {}),
      };

      return {
        verified: true,
        message: data.message || "NIN verified successfully",
        status: data?.status || "successful",
        data: mergedData,
      };
    }

    return {
      verified: false,
      message: data?.message || data?.error || "NIN verification failed",
      status: data?.status,
      error: data?.error || data?.message || "NIN verification failed",
      data: null,
    };
  } catch (error: any) {
    console.error("Error verifying NIN:", error?.message || error);
    return {
      verified: false,
      message: "Something went wrong during NIN verification.",
      error: error?.message || "Something went wrong during NIN verification.",
      data: null,
    };
  }
}
