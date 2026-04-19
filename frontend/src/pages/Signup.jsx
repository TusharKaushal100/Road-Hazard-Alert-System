// frontend/src/pages/Signup.jsx
// Same layout as Login — dark background, lottie left, card right.

import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Input } from "../components/input";
import { Button } from "../components/button";

export const Signup = () => {
  const [generalError, setGeneralError] = useState(null);
  const [fieldError, setFieldError] = useState({});
  const [success, setSuccess] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const navigate = useNavigate();

  const handleSignup = async () => {
    const username = usernameRef.current?.value?.trim();
    const password = passwordRef.current?.value;

    setGeneralError(null);
    setFieldError({});

    if (!username) {
      setFieldError({ username: "Username is required" });
      return;
    }
    if (username.length < 3) {
      setFieldError({ username: "Username must be at least 3 characters" });
      return;
    }
    if (!password) {
      setFieldError({ password: "Password is required" });
      return;
    }
    if (password.length < 6) {
      setFieldError({ password: "Password must be at least 6 characters" });
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/v1/user/signup", {
        username,
        password,
      });

      setSuccess(true);

      // Go to login after 1.5 seconds so user sees the success message
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      setGeneralError(err.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="h-screen grid grid-cols-2 bg-slate-900">

      {/* Left side — lottie animation */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-72 h-72">
          <DotLottieReact src="/animations/Map.lottie" loop autoplay />
        </div>
        <p className="mt-4 text-slate-300 text-lg text-center px-8">
          Helping Government in Traffic Management and Road Safety
        </p>
      </div>

      {/* Right side — signup card */}
      <div className="flex items-center justify-center">
        <div className="w-96 bg-white rounded-2xl shadow-2xl p-8 transition-transform duration-300 hover:scale-[1.02]">

          <h1 className="text-3xl font-semibold text-center text-slate-800 mb-8">
            Create Account
          </h1>

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm text-center">
              Account created! Redirecting to login...
            </div>
          )}

          {/* Username field */}
          <div className="mb-4">
            <Input ref={usernameRef} placeholder="Username" />
            {fieldError.username && (
              <p className="text-red-500 text-sm mt-1">{fieldError.username}</p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-4">
            <Input ref={passwordRef} placeholder="Set Password" type="password" />
            {fieldError.password && (
              <p className="text-red-500 text-sm mt-1">{fieldError.password}</p>
            )}
          </div>

          {/* General error */}
          {generalError && (
            <p className="text-red-500 text-sm mb-4">{generalError}</p>
          )}

          {/* Signup button */}
          <Button
            text="Sign Up"
            variant="primary"
            size="md"
            className="w-full mt-2"
            onClick={handleSignup}
          />

          {/* Link to login */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-500 font-medium hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};