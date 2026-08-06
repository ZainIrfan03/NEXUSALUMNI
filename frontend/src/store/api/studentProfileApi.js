import { baseApi } from "./baseApi";

/**
 * Student Profile API — covers:
 *   GET    /student/profile
 *   PUT    /student/profile
 *   POST   /student/profile/avatar     (multipart)
 *   POST   /student/profile/resume     (multipart)
 *   POST   /student/profile/experience
 *   POST   /student/profile/education
 *   DELETE /student/profile/education/:educationId
 *
 * deleteExperience exists on the backend but has no UI hook in either
 * MyProfile.jsx or EditProfile.jsx yet — left out for now, same as
 * messagesApi starting minimal; add it here if a "remove role" button
 * shows up later.
 *
 * Every mutation invalidates "StudentProfile", so MyProfile.jsx and
 * EditProfile.jsx share one cache entry — save on the edit page, and the
 * read-only view refetches with the new data the moment you navigate back,
 * no passing data between routes needed.
 */
export const studentProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => "/student/profile",
      providesTags: ["StudentProfile"],
    }),

    updateMyProfile: builder.mutation({
      query: (payload) => ({
        url: "/student/profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: "/student/profile/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    uploadResume: builder.mutation({
      query: (formData) => ({
        url: "/student/profile/resume",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    addExperience: builder.mutation({
      query: (roleData) => ({
        url: "/student/profile/experience",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    addEducation: builder.mutation({
      query: (eduData) => ({
        url: "/student/profile/education",
        method: "POST",
        body: eduData,
      }),
      invalidatesTags: ["StudentProfile"],
    }),

    deleteEducation: builder.mutation({
      query: (educationId) => ({
        url: `/student/profile/education/${educationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentProfile"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadAvatarMutation,
  useUploadResumeMutation,
  useAddExperienceMutation,
  useAddEducationMutation,
  useDeleteEducationMutation,
} = studentProfileApi;