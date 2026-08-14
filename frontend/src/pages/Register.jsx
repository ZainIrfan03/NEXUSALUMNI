import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { setCredentials } from "../store/slice/authSlice";
import { ROLES, EMAIL_REGEX, PASSWORD_MIN_LENGTH, FULL_NAME_MAX_LENGTH } from "../consts/const";


export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [role, setRole] = useState(ROLES.STUDENT);
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    setFieldErrors((prev) => {
      const next = { ...prev };

      if (name === "fullName") {
        if (value.length > FULL_NAME_MAX_LENGTH) {
          next.fullName = `Full name must not exceed ${FULL_NAME_MAX_LENGTH} characters.`;
        } else {
          delete next.fullName;
        }
      }

      if (name === "email") {
        if (value && !EMAIL_REGEX.test(value)) {
          next.email = "Enter a valid email address.";
        } else {
          delete next.email;
        }
      }

      if (name === "password") {
        if (value && value.length < PASSWORD_MIN_LENGTH) {
          next.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
        } else if (value && (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))) {
          next.password = "Password must include both letters and numbers.";
        } else {
          delete next.password;
        }

       
        if (confirmPassword) {
          next.confirmPassword =
            confirmPassword === value ? undefined : "Passwords do not match.";
          if (!next.confirmPassword) delete next.confirmPassword;
        }
      }

      return next;
    });
  };

 
  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;
    setConfirmPassword(value);

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (value && value !== form.password) {
        next.confirmPassword = "Passwords do not match.";
      } else {
        delete next.confirmPassword;
      }
      return next;
    });
  };

  
  const validate = () => {
    const errors = {};

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (form.fullName.length > FULL_NAME_MAX_LENGTH) {
      errors.fullName = `Full name must not exceed ${FULL_NAME_MAX_LENGTH} characters.`;
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      errors.password = "Password must include both letters and numbers.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (role === ROLES.STUDENT) {
      if (!form.department) errors.department = "Select a department.";
      if (!form.session.trim()) errors.session = "Session is required.";
      if (!form.rollNumber.trim()) errors.rollNumber = "Roll number is required.";
    }

    if (role === ROLES.ALUMNI) {
      if (!form.graduationYear.trim()) {
        errors.graduationYear = "Graduation year is required.";
      } else if (!/^\d{4}$/.test(form.graduationYear.trim())) {
        errors.graduationYear = "Enter a valid 4-digit year.";
      }
      if (!form.jobTitle.trim()) errors.jobTitle = "Job title is required.";
      if (!form.company.trim()) errors.company = "Company is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validate()) {
      setError("Please fix the highlighted fields below.");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/register`, {
        role,
        ...form,
      });

      
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

        
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole(ROLES.STUDENT)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              role === ROLES.STUDENT ? "bg-white text-primary shadow-sm" : "text-gray-500"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole(ROLES.ALUMNI)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              role === ROLES.ALUMNI ? "bg-white text-primary shadow-sm" : "text-gray-500"
            }`}
          >
            Alumni
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
         
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              maxLength={FULL_NAME_MAX_LENGTH}
              required
            />
            {fieldErrors.fullName && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              {role === ROLES.STUDENT ? "University Email" : "Email Address"}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={role === ROLES.STUDENT ? "student@university.edu" : "you@email.com"}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={`Create a password (min. ${PASSWORD_MIN_LENGTH} characters, letters + numbers)`}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Re-enter your password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {role === ROLES.STUDENT && (
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
                  {fieldErrors.department && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.department}</p>
                  )}
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
                  {fieldErrors.session && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.session}</p>
                  )}
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
                {fieldErrors.rollNumber && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.rollNumber}</p>
                )}
              </div>
            </>
          )}

          {role === ROLES.ALUMNI && (
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
                  {fieldErrors.graduationYear && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.graduationYear}</p>
                  )}
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
                  {fieldErrors.jobTitle && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.jobTitle}</p>
                  )}
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
                {fieldErrors.company && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.company}</p>
                )}
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
            {loading ? "Registering..." : `Register as ${role === ROLES.STUDENT ? "Student" : "Alumni"}`}
          </button>
        </form>
      </div>
    </section>
  );
}