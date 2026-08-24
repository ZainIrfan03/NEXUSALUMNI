import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

export const studentProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => "/student/profile",
      providesTags: [TAGS.STUDENT_PROFILE],
    }),

    updateMyProfile: builder.mutation({
      query: (payload) => ({
        url: "/student/profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: [TAGS.STUDENT_PROFILE],
    }),

    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: "/student/profile/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [TAGS.STUDENT_PROFILE],
    }),

    uploadResume: builder.mutation({
      query: (formData) => ({
        url: "/student/profile/resume",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [TAGS.STUDENT_PROFILE],
    }),

    addExperience: builder.mutation({
      query: (roleData) => ({
        url: "/student/profile/experience",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: [TAGS.STUDENT_PROFILE],
    }),

    addEducation: builder.mutation({
      query: (eduData) => ({
        url: "/student/profile/education",
        method: "POST",
        body: eduData,
      }),
      invalidatesTags: [TAGS.STUDENT_PROFILE],
    }),

    deleteEducation: builder.mutation({
      query: (educationId) => ({
        url: `/student/profile/education/${educationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.STUDENT_PROFILE],
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
