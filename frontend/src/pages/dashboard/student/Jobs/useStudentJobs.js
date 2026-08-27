import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useApplyToJobMutation,
  useGetJobsQuery,
  useGetMyApplicationsQuery,
  useRespondToInterviewMutation,
  useToggleSaveJobMutation,
} from "../../../../store/api/studentJobsApi";
import { ROUTES, UI_LIMITS } from "../../../../consts/appConstants";

export default function useStudentJobs() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const [selectedView, setSelectedView] = useState("browse");
  const view = locationState.state?.jobsView || selectedView;
  const [activeType, setActiveType] = useState("All Jobs");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [savingJobId, setSavingJobId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [resumeRequired, setResumeRequired] = useState(false);
  const [renderTime] = useState(() => Date.now());
  const [respondingApplicationId, setRespondingApplicationId] = useState(null);

  const queryParams = {
    page,
    pageSize: UI_LIMITS.JOBS_PAGE_SIZE,
    type: activeType,
    search: search || undefined,
    location: location || undefined,
    department: department || undefined,
    experienceLevel: experienceLevel || undefined,
    sort,
    savedOnly: view === "saved" ? true : undefined,
  };
  const { data: jobsData, isLoading: loadingJobs, error: jobsError } =
    useGetJobsQuery(queryParams, { skip: view === "applications" });
  const { data: applicationData, isLoading: loadingApplications } =
    useGetMyApplicationsQuery();
  const [applyToJob] = useApplyToJobMutation();
  const [toggleSaveJob] = useToggleSaveJobMutation();
  const [respondToInterview] = useRespondToInterviewMutation();

  const jobs = jobsData?.jobs || [];
  const applications = applicationData?.applications || [];
  const stats = applicationData?.stats || {};
  const selectedJob = jobs.find((job) => job._id === selectedJobId) || null;
  const resetPage = () => setPage(1);

  const selectView = (nextView) => {
    setSelectedView(nextView);
    if (locationState.state?.jobsView) {
      navigate(ROUTES.STUDENT.JOBS, { replace: true, state: {} });
    }
    setSelectedJobId(null);
    resetPage();
  };
  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    resetPage();
  };
  const clearFilters = () => {
    setSearchInput(""); setSearch(""); setLocation(""); setDepartment("");
    setExperienceLevel(""); setSort("newest"); setActiveType("All Jobs"); resetPage();
  };
  const runJobAction = async (jobId, mutation, setBusy, fallback) => {
    setBusy(jobId); setActionError("");
    try { await mutation(jobId).unwrap(); }
    catch (requestError) { setActionError(requestError?.data?.message || fallback); throw requestError; }
    finally { setBusy(null); }
  };
  const handleApply = async (jobId) => {
    setResumeRequired(false);
    try { await runJobAction(jobId, applyToJob, setApplyingJobId, "Could not submit your application"); }
    catch (requestError) { setResumeRequired(requestError?.data?.code === "RESUME_REQUIRED"); }
  };
  const handleToggleSave = (jobId) =>
    runJobAction(jobId, toggleSaveJob, setSavingJobId, "Could not update saved jobs").catch(() => {});
  const handleInterviewResponse = async (applicationId, response) => {
    setRespondingApplicationId(applicationId); setActionError("");
    try { await respondToInterview({ applicationId, response }).unwrap(); }
    catch (requestError) { setActionError(requestError?.data?.message || "Could not update your interview response"); }
    finally { setRespondingApplicationId(null); }
  };

  return {
    activeType, applications, applyingJobId, clearFilters, department,
    error: actionError || jobsError?.data?.message || (jobsError ? "Failed to load jobs" : ""),
    experienceLevel, handleApply, handleInterviewResponse, handleToggleSave,
    jobs, jobsData, loadingApplications, loadingJobs, location, navigate, page,
    renderTime, resetPage, respondingApplicationId, resumeRequired, savingJobId,
    searchInput, selectView, selectedJob, setActiveType, setDepartment,
    setExperienceLevel, setLocation, setPage, setSearchInput, setSelectedJobId,
    setShowFilters, setSort, showFilters, sort, stats, submitSearch, view,
    totalCount: jobsData?.totalCount || 0,
    totalPages: Math.max(1, Math.ceil((jobsData?.totalCount || 0) / UI_LIMITS.JOBS_PAGE_SIZE)),
  };
}
