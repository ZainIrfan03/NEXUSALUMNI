import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { APPLICATION_STATUS, ROLES, SOCKET_EVENTS, TAGS } from "../consts/appConstants";
import { baseApi } from "../store/api/baseApi";
import { useGetUnreadMessageCountQuery } from "../store/api/messagesApi";
import { useGetMyApplicationsQuery } from "../store/api/studentJobsApi";
import { connectSocket } from "../utils/socket";

export default function useDashboardNotifications(user) {
  const dispatch = useDispatch();
  const [interviewNotice, setInterviewNotice] = useState(null);
  const supportsMessages = [ROLES.STUDENT, ROLES.ALUMNI].includes(user?.role);

  const { data: unreadData, refetch: refetchUnreadMessages } =
    useGetUnreadMessageCountQuery(undefined, { skip: !supportsMessages });
  const { data: applicationsData } = useGetMyApplicationsQuery(undefined, {
    skip: user?.role !== ROLES.STUDENT,
  });

  const unreadMessageCount = unreadData?.count || 0;
  const interviewNotifications = (applicationsData?.applications || [])
    .filter(
      (application) =>
        application.interview && application.status === APPLICATION_STATUS.INTERVIEW
    )
    .slice(0, 3);
  const pendingInterviewCount = interviewNotifications.filter(
    (application) => application.interview.response === "pending"
  ).length;
  const liveNoticeAlreadyLoaded = interviewNotifications.some(
    (application) => String(application._id) === String(interviewNotice?.applicationId)
  );
  const notificationCount =
    unreadMessageCount +
    pendingInterviewCount +
    (interviewNotice && !liveNoticeAlreadyLoaded ? 1 : 0);

  useEffect(() => {
    if (!supportsMessages) return undefined;

    const socket = connectSocket();
    const handleIncomingMessage = () => refetchUnreadMessages();
    const handleInterviewScheduled = (payload) => {
      if (user?.role !== ROLES.STUDENT) return;
      setInterviewNotice(payload);
      dispatch(baseApi.util.invalidateTags([TAGS.MY_APPLICATIONS]));
    };

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleIncomingMessage);
    socket.on(SOCKET_EVENTS.INTERVIEW_SCHEDULED, handleInterviewScheduled);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleIncomingMessage);
      socket.off(SOCKET_EVENTS.INTERVIEW_SCHEDULED, handleInterviewScheduled);
    };
  }, [supportsMessages, refetchUnreadMessages, dispatch, user?.role]);

  return {
    interviewNotice,
    clearInterviewNotice: () => setInterviewNotice(null),
    interviewNotifications,
    liveNoticeAlreadyLoaded,
    notificationCount,
    unreadMessageCount,
  };
}
