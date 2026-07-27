import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCredentials } from "../store/slice/authSlice";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
    session: "",
    rollNumber: "",
    graduationYear: "",
    company: "",
    jobTitle: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        role,
        ...form,
      });

      // Registration successful — send them to login instead of auto-login
      navigate("/login", {
        state: { message: "Account created! Please log in to continue." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
};

  return (
    <section className="w-full bg-background min-h-[calc(100vh-73px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-primary text-center mb-1">
          Alumni Nexus
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Join the professional network today.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
            {error}
          </div>
        )}

        {/* Role toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              role === "student" ? "bg-white text-primary shadow-sm" : "text-gray-500"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("alumni")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              role === "alumni" ? "bg-white text-primary shadow-sm" : "text-gray-500"
            }`}
          >
            Alumni
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Shared fields */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              {role === "student" ? "University Email" : "Email Address"}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={role === "student" ? "student@university.edu" : "you@email.com"}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {role === "student" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Department</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-gray-600"
                    required
                  >
                    <option value="">Select</option>
                    <option value="cs">Computer Science</option>
                    <option value="business">Business</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Session</label>
                  <input
                    type="text"
                    name="session"
                    value={form.session}
                    onChange={handleChange}
                    placeholder="e.g. 2021-2025"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  placeholder="Enter your roll number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </>
          )}

          {role === "alumni" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Graduation Year</label>
                  <input
                    type="text"
                    name="graduationYear"
                    value={form.graduationYear}
                    onChange={handleChange}
                    placeholder="e.g. 2018"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Product Manager"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Current Company</label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Enter your current company"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </>
          )}

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Log In
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Registering..." : `Register as ${role === "student" ? "Student" : "Alumni"}`}
          </button>
        </form>
      </div>
    </section>
  );
}