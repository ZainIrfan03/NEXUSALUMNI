import { baseApi } from "./baseApi";
import { getImageUrl as fileUrl } from "../../utils/getImageUrl";

/**
 * Student Mentorship API — covers:
 *   GET  /mentorship/recommended
 *   GET  /mentorship/my-requests
 *   POST /mentorship/request
 *
 * The backend->card shape mapping that used to live inline in
 * Mentorship.jsx's fetchMentors() now lives in `transformResponse` —
 * the component just consumes already-shaped data.
 *
 * sendMentorshipRequest invalidates "MentorshipRequests", so the old
 * manual "prepend the new request to local state" code goes away —
 * the request list just refetches and the new one is already in it.
 */
export const studentMentorshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendedMentors: builder.query({
      query: () => "/mentorship/recommended",
      providesTags: ["RecommendedMentors"],
      transformResponse: (alumniList) =>
        alumniList.map((alumnus) => ({
          alumniUserId: alumnus.user?._id, // needed when sending a request (must be the User id)
          alumniDocId: alumnus._id,
          name: alumnus.user?.fullName || "Unknown",
          role: alumnus.jobTitle || "Alumni",
          company: alumnus.company || "",
          badges: alumnus.graduationYear
            ? [`Alumni '${String(alumnus.graduationYear).slice(-2)}`]
            : [],
          desc: "", // no bio field on Alumni yet — add one later if needed
          img: fileUrl(alumnus.avatarUrl),
        })),
    }),

    getMyRequests: builder.query({
      query: () => "/mentorship/my-requests",
      providesTags: ["MentorshipRequests"],
    }),

    sendMentorshipRequest: builder.mutation({
      // backend does Alumni.findById(alumniId), so it needs the Alumni
      // doc id, not the User id — caller passes { alumniDocId }.
      query: ({ alumniDocId }) => ({
        url: "/mentorship/request",
        method: "POST",
        body: { alumniId: alumniDocId },
      }),
      invalidatesTags: ["MentorshipRequests"],
    }),
  }),
});

export const {
  useGetRecommendedMentorsQuery,
  useGetMyRequestsQuery,
  useSendMentorshipRequestMutation,
} = studentMentorshipApi;