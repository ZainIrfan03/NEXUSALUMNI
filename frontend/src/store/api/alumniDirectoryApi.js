import { baseApi } from "./baseApi";

/**
 * Alumni Directory API — the student directory an alumni browses. Covers:
 *   GET /alumni/directory?department=&skills=&years=&sortBy=&page=
 *   GET /alumni/directory/:id
 *
 * No mapping/transformResponse needed here — the backend already returns
 * the exact { students, totalCount } / student-profile shape the frontend
 * cards expect.
 */
export const alumniDirectoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentDirectory: builder.query({
      query: ({ department, skills, years, sortBy, page }) => ({
        url: "/alumni/directory",
        params: { department, skills, years, sortBy, page },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.students.map((student) => ({ type: "StudentDirectory", id: student._id })),
              { type: "StudentDirectory", id: "LIST" },
            ]
          : [{ type: "StudentDirectory", id: "LIST" }],
    }),

    getStudentById: builder.query({
      query: (id) => `/alumni/directory/${id}`,
      providesTags: (result, error, id) => [{ type: "StudentDirectory", id }],
    }),
  }),
});

export const { useGetStudentDirectoryQuery, useGetStudentByIdQuery } = alumniDirectoryApi;