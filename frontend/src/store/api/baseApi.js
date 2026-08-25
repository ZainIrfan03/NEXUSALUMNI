import { createApi } from "@reduxjs/toolkit/query/react";
import { TAGS } from "../../consts/appConstants";
import { baseQueryWithAuth } from "./baseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: Object.values(TAGS),
  endpoints: () => ({}),
});
