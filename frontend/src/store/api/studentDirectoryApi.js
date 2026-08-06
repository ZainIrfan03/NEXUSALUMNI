import { baseApi } from "./baseApi";
import { getImageUrl as fileUrl } from "../../utils/getImageUrl";

/**
 * Student Directory API — the alumni directory a student browses. Covers:
 *   GET /directory?page=&limit=&fromYear=&toYear=
 *   GET /directory/:id
 *
 * The backend->card shape mapping that used to live inline in Directory.jsx's
 * fetchAlumni() now lives in transformResponse, same as studentMentorshipApi's
 * getRecommendedMentors — the component just consumes ready-to-render data.
 */
export const studentDirectoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlumniDirectory: builder.query({
      query: ({ page, limit, fromYear, toYear }) => ({
        url: "/directory",
        params: { page, limit, fromYear, toYear },
      }),
      transformResponse: (data) => ({
        results: data.results.map((alumnus) => ({
          id: alumnus._id,
          name: alumnus.user?.fullName || "Unknown",
          title: [alumnus.jobTitle, alumnus.company].filter(Boolean).join(" @ "),
          year: `Class of ${alumnus.graduationYear}`,
          tag: null,
          img: fileUrl(alumnus.avatarUrl),
        })),
        total: data.total,
        totalPages: data.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map((alumnus) => ({ type: "AlumniDirectory", id: alumnus.id })),
              { type: "AlumniDirectory", id: "LIST" },
            ]
          : [{ type: "AlumniDirectory", id: "LIST" }],
    }),

    getAlumniById: builder.query({
      query: (id) => `/directory/${id}`,
      providesTags: (result, error, id) => [{ type: "AlumniDirectory", id }],
    }),
  }),
});

export const { useGetAlumniDirectoryQuery, useGetAlumniByIdQuery } = studentDirectoryApi;