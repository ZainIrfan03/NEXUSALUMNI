import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Briefcase, ArrowLeft, Loader2 } from "lucide-react";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const API_BASE = API_BASE_URL;

const TYPE_OPTIONS = ["Full-time", "Part-time", "Internship", "Remote"];
const DEPARTMENT_OPTIONS = ["Engineering", "Design", "Marketing", "Sales", "Operations", "Other"];

export default function AlumniJobNew() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    department: "",
    type: "Full-time",
    payRange: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.company || !form.location || !form.type) {
      setError("Job title, company, location and type are required.");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_BASE}/jobs`, form);
      navigate("/dashboard/alumni/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Could not post this job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb / back */}
      <button
        onClick={() => navigate("/dashboard/alumni/jobs")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={14} /> Back to My Job Postings
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
          <Briefcase size={18} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-500 text-sm">
            Share an opportunity with students and alumni in your network.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5"
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Senior Data Analyst"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City or Remote"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Department
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            >
              <option value="">Select department</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Opportunity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              required
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pay Range
            </label>
            <input
              type="text"
              name="payRange"
              value={form.payRange}
              onChange={handleChange}
              placeholder="e.g. $35 - $45 / hr"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="Describe the role, responsibilities, and requirements..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/alumni/jobs")}
            className="text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-5 py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 text-sm font-medium text-white bg-primary rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
}