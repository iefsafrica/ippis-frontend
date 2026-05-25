export async function verifyNIN(nin: string): Promise<{
  verified: boolean;
  message: string;
  status?: string;
  error?: string;
  data: any | null;
}> {
  try {
    if (!/^\d{11}$/.test(nin)) {
      return {
        verified: false,
        message: "Invalid NIN format. NIN must be 11 digits.",
        error: "Invalid NIN format. NIN must be 11 digits.",
        data: null,
      };
    }

    const apiKey = process.env.NETAPPS_SECRET_KEY;
    const url = "https://kyc-api.netapps.ng/api/v1/kyc/nin";

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
      },
      body: JSON.stringify({ nin }),
    });

    const data = await response.json();
    console.log("NIN verification response:", data);


    if (data?.status?.toLowerCase() !== "successful" || !data?.data) {
      return {
        verified: false,
        message: data?.message || data?.error || "NIN verification failed",
        status: data?.status,
        error: data?.error || data?.message || "NIN verification failed",
        data: null,
      };
    }

    return {
      verified: true,
      message: data.message || "NIN verified successfully",
      status: data?.status,
      data: data.data,
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
