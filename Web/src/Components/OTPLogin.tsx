"use client";
import { auth } from "@/lib/firebase";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const OtpLogin = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationResult) {
      confirmationResult
        .confirm(otp)
        .then((result) => {
          setSuccess("OTP verified successfully!");
          // User signed in successfully, navigate to the desired page
          router.push("/dashboard");
        })
        .catch((error) => {
          setError("Invalid OTP, please try again.");
          console.error("OTP verification error:", error);
        });
    }
  };

  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setResendCountdown(60);
    startTransition(async () => {
      setError("");
      if (!recaptchaVerifier) {
        return setError("RecaptchaVerifier is not initialized");
      }
      try {
        // Reset the reCAPTCHA before requesting OTP
        recaptchaVerifier.render().then(function (widgetId) {
          grecaptcha.reset(widgetId.toString());
        });
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier
        );
        setConfirmationResult(confirmationResult);
        setSuccess("OTP sent successfully.");
      } catch (err: any) {
        setResendCountdown(0);
        if (err.code === "auth/invalid-phone-number") {
          setError("Invalid phone number. Please check the number.");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many requests. Please try again later.");
        } else {
          setError("Failed to send OTP. Please try again later.");
        }
      }
    });
  };

  useEffect(() => {
    // Initialize reCAPTCHA
    if (!recaptchaVerifier) {
      const recaptchaVerifierInstance = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          
        }
        // Auth object passed here
      );
      setRecaptchaVerifier(recaptchaVerifierInstance);
    }
    return () => recaptchaVerifier?.clear();
  }, [recaptchaVerifier]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const loadingIndicator = (
    <div className="loader-container" id="loader-container">
      <svg>
        <circle cx="70" cy="70" r="70"></circle>
      </svg>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Enter Your Phone Number
        </h2>
        {!confirmationResult && (
          <form onSubmit={requestOtp}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+14155552671"
            />
          </form>
        )}

        <button
          disabled={!phoneNumber || isPending || resendCountdown > 0}
          onClick={() => requestOtp()}
          className="mt-6 w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          {resendCountdown > 0
            ? `Resend OTP in ${resendCountdown}`
            : isPending
            ? "Sending OTP"
            : "Send OTP"}
        </button>
        <div className="p-10 text-center">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
        <div id="recaptcha-container" />
        {isPending && loadingIndicator}

        <h2 className="text-2xl font-bold mb-6 text-center">Enter the OTP</h2>
        <form onSubmit={handleOtpSubmit}>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            OTP
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="123456"
          />
          <button
            type="submit"
            className="mt-6 w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition duration-300"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpLogin;