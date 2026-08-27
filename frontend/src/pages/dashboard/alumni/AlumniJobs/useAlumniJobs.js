import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteMyJobMutation,
  useGetJobApplicantsQuery,
  useGetMyJobsQuery,
  useScheduleInterviewMutation,
  useUpdateApplicationStatusMutation,
} from "../../../../store/api/alumniJobsApi";
import {
  APPLICATION_STATUS,
  ROUTES,
  SOCKET_EVENTS,
  UI_LIMITS,
} from "../../../../consts/appConstants";
import { connectSocket } from "../../../../utils/socket";

const DEFAULT_STATS = {
  totalPostings: 0,
  newThisWeek: 0,
  totalApplicants: 0,
  unreadApplicants: 0,
  fillRate: 0,
};

const createEmptyInterviewForm = () => ({
  scheduledAt: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi",
  durationMinutes: 30,
  meetingUrl: "",
  instructions: "",
});

const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export default function useAlumniJobs() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState("");
  const [applicantsJobId, setApplicantsJobId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [interviewTarget, setInterviewTarget] = useState(null);
  const [interviewForm, setInterviewForm] = useState(
    createEmptyInterviewForm,
  );
  const [scheduleError, setScheduleError] = useState("");

  const {
    data: jobsData,
    isLoading: loading,
    error: jobsQueryError,
  } = useGetMyJobsQuery({ page, pageSize: UI_LIMITS.JOBS_PAGE_SIZE });

  const {
    data: applicantsData,
    isLoading: loadingApplicants,
    error: applicantsQueryError,
    refetch: refetchApplicants,
  } = useGetJobApplicantsQuery(applicantsJobId, { skip: !applicantsJobId });

  const [deleteMyJob] = useDeleteMyJobMutation();
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();
  const [scheduleInterview, { isLoading: schedulingInterview }] =
    useScheduleInterviewMutation();

  const jobs = jobsData?.jobs || [];
  const totalCount = jobsData?.totalCount || 0;
  const stats = jobsData?.stats || DEFAULT_STATS;
  const applicants = applicantsData?.applicants || [];
  const applicantsJobTitle =
    applicantsData?.job?.title ??
    jobs.find((job) => job._id === applicantsJobId)?.title;

  useEffect(() => {
    if (!applicantsJobId) return undefined;
    const socket = connectSocket();
    const handleResponse = ({ jobId }) => {
      if (String(jobId) === String(applicantsJobId)) refetchApplicants();
    };
    socket.on(SOCKET_EVENTS.INTERVIEW_RESPONSE_UPDATED, handleResponse);
    return () =>
      socket.off(SOCKET_EVENTS.INTERVIEW_RESPONSE_UPDATED, handleResponse);
  }, [applicantsJobId, refetchApplicants]);

  const error =
    actionError ||
    (jobsQueryError && "Could not load your job postings.") ||
    (applicantsQueryError && "Could not load applicants.");

  const openApplicants = (job) => {
    setActionError("");
    setApplicantsJobId(job._id);
  };

  const closeApplicants = () => setApplicantsJobId(null);

  const openStudentProfile = (profileId) => {
    if (!profileId) return;
    closeApplicants();
    navigate(ROUTES.ALUMNI.directoryProfile(profileId));
  };

  const handleDelete = async (jobId) => {
    setActionError("");
    try {
      await deleteMyJob(jobId).unwrap();
    } catch (requestError) {
      setActionError(
        requestError.data?.message || "Could not delete this posting.",
      );
    }
  };

  const handleStatusChange = async (applicant, status) => {
    if (status === APPLICATION_STATUS.INTERVIEW) {
      setScheduleError("");
      setInterviewTarget(applicant);
      setInterviewForm(
        applicant.interview
          ? {
              scheduledAt: toLocalDateTimeInput(
                applicant.interview.scheduledAt,
              ),
              timezone: applicant.interview.timezone,
              durationMinutes: applicant.interview.durationMinutes,
              meetingUrl: applicant.interview.meetingUrl,
              instructions: applicant.interview.instructions || "",
            }
          : createEmptyInterviewForm(),
      );
      return;
    }

    setActionError("");
    setUpdatingId(applicant.applicationId);
    try {
      await updateApplicationStatus({
        applicationId: applicant.applicationId,
        status,
        jobId: applicantsJobId,
      }).unwrap();
    } catch (requestError) {
      setActionError(
        requestError.data?.message || "Could not update this application.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleInterview = async (event) => {
    event.preventDefault();
    setScheduleError("");
    try {
      await scheduleInterview({
        applicationId: interviewTarget.applicationId,
        jobId: applicantsJobId,
        ...interviewForm,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        durationMinutes: Number(interviewForm.durationMinutes),
      }).unwrap();
      setInterviewTarget(null);
    } catch (requestError) {
      setScheduleError(
        requestError.data?.message || "Could not schedule the interview.",
      );
    }
  };

  const updateInterviewField = (field, value) => {
    setInterviewForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / UI_LIMITS.JOBS_PAGE_SIZE),
  );

  return {
    applicants,
    applicantsJobId,
    applicantsJobTitle,
    closeApplicants,
    closeInterview: () => setInterviewTarget(null),
    error,
    handleDelete,
    handleScheduleInterview,
    handleStatusChange,
    interviewForm,
    interviewTarget,
    jobs,
    loading,
    loadingApplicants,
    openApplicants,
    openNewJob: () => navigate(ROUTES.ALUMNI.NEW_JOB),
    openStudentProfile,
    page,
    rangeEnd: Math.min(page * UI_LIMITS.JOBS_PAGE_SIZE, totalCount),
    rangeStart:
      totalCount === 0 ? 0 : (page - 1) * UI_LIMITS.JOBS_PAGE_SIZE + 1,
    scheduleError,
    schedulingInterview,
    setPage,
    stats,
    totalCount,
    totalPages,
    updateInterviewField,
    updatingId,
  };
}
