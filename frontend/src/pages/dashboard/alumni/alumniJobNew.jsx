import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateJobMutation } from "../../../store/api/alumniJobsApi";
import { Briefcase, ArrowLeft, Loader2 } from "lucide-react";
import { EXPERIENCE_LEVELS, JOB_TYPES, ROUTES } from "../../../consts/appConstants";

const TYPE_OPTIONS = [
  JOB_TYPES.FULL_TIME,
  JOB_TYPES.PART_TIME,
  JOB_TYPES.INTERNSHIP,
  JOB_TYPES.REMOTE,
];
const DEPARTMENT_OPTIONS = ["Engineering", "Design", "Marketing", "Sales", "Operations", "Other"];

export default function AlumniJobNew() {
  const navigate = useNavigate();
  const location = useLocation();

  
  
  
  
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    department: "",
    type: JOB_TYPES.FULL_TIME,
    payRange: "",
    description: "",
    requirements: "",
    experienceLevel: EXPERIENCE_LEVELS.ENTRY,
    deadline: "",
    ...location.state?.prefill,
  });

  const [error, setError] = useState("");
  const [createJob, { isLoading: saving }] = useCreateJobMutation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title || !form.company || !form.location || !form.type) {
      setError("Job title, company, location and type are required.");
      return;
    }

    try {
      await createJob({
        ...form,
        requirements: form.requirements
          .split("\n")
          .map((requirement) => requirement.trim())
          .filter(Boolean),
      }).unwrap();
      navigate(ROUTES.ALUMNI.JOBS);
    } catch (err) {
      setError(err.data?.message || "Could not post this job. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      
      <button
        onClick={() => navigate(ROUTES.ALUMNI.JOBS)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {Object.values(EXPERIENCE_LEVELS).map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Requirements <span className="text-xs font-normal text-gray-400">(one per line)</span>
          </label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={4}
            placeholder={"JavaScript and React\nStrong communication skills\nCurrently enrolled or recently graduated"}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ALUMNI.JOBS)}
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
