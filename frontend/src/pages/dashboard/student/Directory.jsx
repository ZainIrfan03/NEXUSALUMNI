import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getImageUrl as fileUrl } from "../../../utils/getImageUrl";
import { ChevronDown, LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

/**
 * Alumni Directory — file: src/pages/dashboard/student/Directory.jsx
 * Now connected to GET /api/directory (see backend/controllers/directoryController.js)
 * "View Profile" navigates to /dashboard/student/directory/:id (AlumniProfileView.jsx)
 */

// Files come back from the backend as relative paths (e.g. "/uploads/avatars/xyz.png"),
// so build a full URL for <img src>. Stale blob: URLs (from old preview-only

const departments = ["Engineering", "Marketing", "Product"];

function AlumniAvatar({ name, img, size = "h-20 w-20" }) {
  return img ? (
    <img
      src={img}
      alt={name}
      className={`${size} rounded-full object-cover mb-4 sm:mb-0 shrink-0`}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-semibold mb-4 sm:mb-0 shrink-0`}
    >
      {name ? name.charAt(0).toUpperCase() : "?"}
    </div>
  );
}

export default function Directory() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [filters, setFilters] = useState({
    industry: "All Industries",
    fromYear: "",
    toYear: "",
    location: "",
  });
  const [activePage, setActivePage] = useState(1);

  // Data that used to be hardcoded now lives in state, filled by the API call below.
  const [alumniData, setAlumniData] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-fetch whenever the page or the year filters change.
  // (industry/department/location filters need matching fields added to
  // the Alumni model + controller before they can be sent here too.)
  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/directory`, {
          params: {
            page: activePage,
            limit: 6,
            fromYear: filters.fromYear || undefined,
            toYear: filters.toYear || undefined,
          },
        });

        // Map backend shape { _id, user: { fullName }, graduationYear, company, jobTitle }
        // into the { id, name, title, year, img } shape the cards below expect.
        // NOTE: `id` (the Alumni document's own _id) is kept so "View Profile"
        // can navigate to /dashboard/student/directory/:id.
        // `img` resolves through fileUrl() so relative upload paths get the
        // correct host prefix; empty string means "no avatar" -> initials fallback.
        const mapped = data.results.map((alumnus) => ({
          id: alumnus._id,
          name: alumnus.user?.fullName || "Unknown",
          title: [alumnus.jobTitle, alumnus.company].filter(Boolean).join(" @ "),
          year: `Class of ${alumnus.graduationYear}`,
          tag: null,
          img: fileUrl(alumnus.avatarUrl),
        }));

        setAlumniData(mapped);
        setTotalResults(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load directory");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [activePage, filters.fromYear, filters.toYear]);

  const toggleDept = (dept) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((selected) => selected !== dept) : [...prev, dept]
    );
  };

  const clearFilters = () => {
    setSelectedDepts([]);
    setFilters({ industry: "All Industries", fromYear: "", toYear: "", location: "" });
  };

  const handleViewProfile = (id) => {
    navigate(`/dashboard/student/directory/${id}`);
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      {/* Filters sidebar */}
      <aside className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-4">
            ADVANCED FILTERS
          </p>

          <label className="block text-sm font-medium text-dark mb-1.5">Industry</label>
          <div className="relative mb-5">
            <select
              value={filters.industry}
              onChange={(event) => setFilters({ ...filters, industry: event.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none focus:border-primary transition-colors"
            >
              <option>All Industries</option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
              <option>Law</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <p className="text-sm font-medium text-dark mb-2">Department</p>
          <div className="flex flex-col gap-2 mb-5">
            {departments.map((dept) => (
              <label key={dept} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDepts.includes(dept)}
                  onChange={() => toggleDept(dept)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                {dept}
              </label>
            ))}
          </div>

          <p className="text-sm font-medium text-dark mb-2">Graduation Year</p>
          <div className="flex items-center gap-2 mb-5">
            <input
              type="text"
              placeholder="From"
              value={filters.fromYear}
              onChange={(event) => setFilters({ ...filters, fromYear: event.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
            <span className="text-sm text-gray-400 shrink-0">to</span>
            <input
              type="text"
              placeholder="To"
              value={filters.toYear}
              onChange={(event) => setFilters({ ...filters, toYear: event.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <p className="text-sm font-medium text-dark mb-2">Location</p>
          <input
            type="text"
            placeholder="e.g. San Francisco, NY"
            value={filters.location}
            onChange={(event) => setFilters({ ...filters, location: event.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors mb-5"
          />

          <button className="w-full bg-dark text-white text-sm font-semibold py-2.5 rounded-xl mb-3 hover:opacity-90 transition-opacity">
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="w-full text-sm font-medium text-primary text-center"
          >
            Clear All Filters
          </button>
        </div>

        {/* Directory insights */}
        <div className="bg-primary rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold tracking-wider text-white/70 mb-2">
            DIRECTORY INSIGHTS
          </p>
          <p className="text-3xl font-bold mb-1">12.4k</p>
          <p className="text-sm text-white/80 mb-4">Verified Alumni Members</p>
          <div className="border-t border-white/20 pt-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Active Mentors</span>
              <span className="font-semibold">840</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">New This Month</span>
              <span className="font-semibold">124</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div>
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-dark mb-1">Directory</h1>
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `Showing ${totalResults} professional matches`}
            </p>
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "grid" ? "bg-primary text-white" : "text-gray-400"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "list" ? "bg-primary text-white" : "text-gray-400"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>
        )}

        {loading ? (
          <LoadingSpinner label="Loading alumni..." className="py-20" />
        ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {alumniData.map((alumnus) => (
            <div
              key={alumnus.id}
              className={`bg-white rounded-2xl p-6 flex flex-col items-center text-center ${
                viewMode === "list" ? "sm:flex-row sm:text-left sm:gap-5 sm:items-center" : ""
              }`}
            >
              <AlumniAvatar name={alumnus.name} img={alumnus.img} />
              <div className={viewMode === "list" ? "flex-1" : ""}>
                <h3 className="font-semibold text-primary">{alumnus.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{alumnus.title}</p>
                <div className={`flex gap-2 mt-3 mb-4 ${viewMode === "list" ? "" : "justify-center"}`}>
                  <span className="text-xs font-medium text-primary bg-blue-50 rounded-full px-3 py-1">
                    {alumnus.year}
                  </span>
                  {alumnus.tag && (
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                      {alumnus.tag}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleViewProfile(alumnus.id)}
                className="w-full sm:w-auto border border-primary text-primary text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-colors shrink-0"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setActivePage((currentPage) => Math.max(1, currentPage - 1))}
            className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setActivePage(pageNumber)}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                activePage === pageNumber ? "bg-dark text-white" : "border border-gray-200 text-gray-600"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            onClick={() => setActivePage((currentPage) => Math.min(totalPages, currentPage + 1))}
            className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}