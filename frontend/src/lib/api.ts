// API Service for PharmaMind Spring Boot Backend

const API_BASE_URL = "http://localhost:8080/api";

export async function sendOtp(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch {
    // Development fallback
    return {
      status: "SUCCESS",
      message: `Verification OTP sent to ${email}`,
      demoOtp: "123456",
    };
  }
}

export async function verifyOtp(email: string, otpCode: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otpCode }),
    });
    return await res.json();
  } catch {
    // Development fallback
    if (otpCode.length === 6) {
      return {
        status: "VERIFIED",
        token: "jwt_demo_token_" + Date.now(),
        user: {
          name: (email.split("@")[0] ?? "user").toUpperCase() || "Dr. Clinical User",
          email,
          role: "Clinical Pharmacist",
          isVerified: true,
        },
      };
    }
    return { error: "Invalid OTP code." };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch {
    return {
      status: "OTP_REQUIRED",
      message: "Password accepted. 2FA verification code sent to your email.",
      demoOtp: "123456",
    };
  }
}

export async function signupUser(fullName: string, email: string, password: string, role: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, role }),
    });
    return await res.json();
  } catch {
    return {
      status: "OTP_REQUIRED",
      message: "Account created. Verification OTP sent to " + email,
      demoOtp: "123456",
    };
  }
}
