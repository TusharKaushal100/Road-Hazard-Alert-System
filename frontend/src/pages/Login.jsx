// frontend/src/pages/Login.jsx
// Same layout as your existing Login from the other project —
// dark slate background, lottie on the left, white card on right.

import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Input } from "../components/input";
import { Button } from "../components/button";

export const Login = () => {
  const [generalError, setGeneralError] = useState(null);
  const [fieldError, setFieldError] = useState({});

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    const username = usernameRef.current?.value?.trim();
    const password = passwordRef.current?.value;

    // Simple front-end checks before hitting the server
    setGeneralError(null);
    setFieldError({});

    if (!username) {
      setFieldError({ username: "Username is required" });
      return;
    }
    if (!password) {
      setFieldError({ password: "Password is required" });
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/v1/user/login", {
        username,
        password,
      });

      // Save token and username so other pages can use them
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);

      navigate("/dashboard");

    } catch (err) {
      setGeneralError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="h-screen grid grid-cols-2 bg-slate-900">

      {/* Left side — lottie animation */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-72 h-72">
          <DotLottieReact src="/animations/Traveller.lottie" loop autoplay />
        </div>
        <p className="mt-4 text-slate-300 text-lg text-center px-8">
          Helping Government in Road Safety
        </p>
      </div>

      {/* Right side — login card */}
      <div className="flex items-center justify-center">
        <div className="w-96 bg-white rounded-2xl shadow-2xl p-8 transition-transform duration-300 hover:scale-[1.02]">

          <h1 className="text-3xl font-semibold text-center text-slate-800 mb-8">
            Road Hazard
          </h1>

          {/* Username field */}
          <div className="mb-4">
            <Input ref={usernameRef} placeholder="Username" />
            {fieldError.username && (
              <p className="text-red-500 text-sm mt-1">{fieldError.username}</p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-4">
            <Input ref={passwordRef} placeholder="Password" type="password" />
            {fieldError.password && (
              <p className="text-red-500 text-sm mt-1">{fieldError.password}</p>
            )}
          </div>

          {/* General error (wrong password, user not found etc) */}
          {generalError && (
            <p className="text-red-500 text-sm mb-4">{generalError}</p>
          )}

          {/* Login button */}
          <Button
            text="Login"
            variant="primary"
            size="md"
            className="w-full mt-2"
            onClick={handleLogin}
          />

          {/* Link to signup */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-yellow-500 font-medium hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};