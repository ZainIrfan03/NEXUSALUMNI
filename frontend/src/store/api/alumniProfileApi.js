import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

export const alumniProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAlumniProfile: builder.query({
      query: () => "/alumni/profile",
      providesTags: [TAGS.ALUMNI_PROFILE],
    }),

    updateMyAlumniProfile: builder.mutation({
      query: (payload) => ({
        url: "/alumni/profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: [TAGS.ALUMNI_PROFILE],
    }),

    uploadAlumniAvatar: builder.mutation({
      query: (formData) => ({
        url: "/alumni/profile/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [TAGS.ALUMNI_PROFILE],
    }),

    uploadAlumniResume: builder.mutation({
      query: (formData) => ({
        url: "/alumni/profile/resume",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [TAGS.ALUMNI_PROFILE],
    }),

    addAlumniExperience: builder.mutation({
      query: (roleData) => ({
        url: "/alumni/profile/experience",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: [TAGS.ALUMNI_PROFILE],
    }),

    addAlumniEducation: builder.mutation({
      query: (eduData) => ({
        url: "/alumni/profile/education",
        method: "POST",
        body: eduData,
      }),
      invalidatesTags: [TAGS.ALUMNI_PROFILE],
    }),

    deleteAlumniEducation: builder.mutation({
      query: (educationId) => ({
        url: `/alumni/profile/education/${educationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.ALUMNI_PROFILE],
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
