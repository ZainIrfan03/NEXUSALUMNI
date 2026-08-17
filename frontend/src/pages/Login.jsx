import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { setCredentials } from "../store/slice/authSlice";
import { ROLE_HOME_ROUTES } from "../consts/appConstants";


export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(`/auth/login`, form)

      
      dispatch(setCredentials(data));

    
      navigate(ROLE_HOME_ROUTES[data.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-background min-h-[calc(100vh-73px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-dark text-center mb-1">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Reconnect with your professional academic network.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              University Email
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 focus-within:border-primary transition-colors">
              <Mail size={16} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@university.edu"
                className="w-full py-2.5 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-dark">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary">
                Forgot Password?
              </Link>
            </div>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 focus-within:border-primary transition-colors">
              <Lock size={16} className="text-gray-400 mr-2 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full py-2.5 text-sm outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(event) => setKeepSignedIn(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Keep me signed in for 30 days
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400 whitespace-nowrap">Or continue with</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-dark hover:border-primary transition-colors">
            <span className="text-[#0A66C2] font-bold text-base">in</span>
            LinkedIn
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-dark hover:border-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          New to Alumni Nexus?{" "}
          <Link to="/register" className="text-primary font-medium">
            Register your account
          </Link>
        </p>
      </div>
    </section>
  );
}
