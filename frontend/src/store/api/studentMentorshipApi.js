import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";
import { getImageUrl as fileUrl } from "../../utils/getImageUrl";















export const studentMentorshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendedMentors: builder.query({
      query: () => "/mentorship/recommended",
      providesTags: [TAGS.RECOMMENDED_MENTORS],
      transformResponse: (alumniList) =>
        alumniList.map((alumnus) => ({
          alumniUserId: alumnus.user?._id, 
          alumniDocId: alumnus._id,
          name: alumnus.user?.fullName || "Unknown",
          role: alumnus.jobTitle || "Alumni",
          company: alumnus.company || "",
          badges: alumnus.graduationYear
            ? [`Alumni '${String(alumnus.graduationYear).slice(-2)}`]
            : [],
          desc: "", 
          img: fileUrl(alumnus.avatarUrl),
        })),
    }),

    getMyRequests: builder.query({
      query: () => "/mentorship/my-requests",
      providesTags: [TAGS.MENTORSHIP_REQUESTS],
    }),

    sendMentorshipRequest: builder.mutation({
      
      
      query: ({ alumniDocId }) => ({
        url: "/mentorship/request",
        method: "POST",
        body: { alumniId: alumniDocId },
      }),
      invalidatesTags: [TAGS.MENTORSHIP_REQUESTS],
    }),
  }),
});

export const {
  useGetRecommendedMentorsQuery,
  useGetMyRequestsQuery,
  useSendMentorshipRequestMutation,
} = studentMentorshipApi;
