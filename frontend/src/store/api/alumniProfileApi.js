import { baseApi } from "./baseApi";

/**
 * Alumni Profile API — covers:
 *   GET    /alumni/profile
 *   PUT    /alumni/profile
 *   POST   /alumni/profile/avatar     (multipart)
 *   POST   /alumni/profile/resume     (multipart)
 *   POST   /alumni/profile/experience
 *   POST   /alumni/profile/education
 *   DELETE /alumni/profile/education/:educationId
 *
 * Mirrors studentProfileApi.js. deleteExperience exists on the backend
 * but has no UI hook in either AlumniProfile.jsx or AlumniEditProfile.jsx
 * yet — left out for now, same reasoning as the student side.
 *
 * Every mutation invalidates "AlumniProfile", so AlumniProfile.jsx (view)
 * and AlumniEditProfile.jsx (edit) share one cache entry — save on the
 * edit page, and the read-only view refetches with the new data the
 * moment you navigate back, no passing data between routes needed.
 */
export const alumniProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAlumniProfile: builder.query({
      query: () => "/alumni/profile",
      providesTags: ["AlumniProfile"],
    }),

    updateMyAlumniProfile: builder.mutation({
      query: (payload) => ({
        url: "/alumni/profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["AlumniProfile"],
    }),

    uploadAlumniAvatar: builder.mutation({
      query: (formData) => ({
        url: "/alumni/profile/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AlumniProfile"],
    }),

    uploadAlumniResume: builder.mutation({
      query: (formData) => ({
        url: "/alumni/profile/resume",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AlumniProfile"],
    }),

    addAlumniExperience: builder.mutation({
      query: (roleData) => ({
        url: "/alumni/profile/experience",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: ["AlumniProfile"],
    }),

    addAlumniEducation: builder.mutation({
      query: (eduData) => ({
        url: "/alumni/profile/education",
        method: "POST",
        body: eduData,
      }),
      invalidatesTags: ["AlumniProfile"],
    }),

    deleteAlumniEducation: builder.mutation({
      query: (educationId) => ({
        url: `/alumni/profile/education/${educationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AlumniProfile"],
    }),
  }),
});

export const {
  useGetMyAlumniProfileQuery,
  useUpdateMyAlumniProfileMutation,
  useUploadAlumniAvatarMutation,
  useUploadAlumniResumeMutation,
  useAddAlumniExperienceMutation,
  useAddAlumniEducationMutation,
  useDeleteAlumniEducationMutation,
} = alumniProfileApi;