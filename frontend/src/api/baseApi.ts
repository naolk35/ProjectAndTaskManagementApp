import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ["User", "Project", "Task"],
});

export type NormalizedApiError = {
  status: number;
  type: string;
  message: string;
  details?: unknown;
};

export function normalizeRtkError(error: unknown): NormalizedApiError | null {
  const fbq = error as
    | (FetchBaseQueryError & {
        data?:
          | {
              error?: {
                status?: number;
                type?: string;
                message?: string;
                details?: unknown;
              };
            }
          | { error?: unknown };
      })
    | undefined;
  if (!fbq) return null;
  // HTTP error
  if (typeof fbq.status === "number") {
    const rawError = (fbq.data as { error?: unknown } | undefined)?.error;
    if (rawError && typeof rawError === "object") {
      const payload = rawError as {
        status?: number;
        type?: string;
        message?: string;
        details?: unknown;
      };
      return {
        status: payload.status ?? (fbq.status as number),
        type: payload.type ?? "ERROR",
        message: payload.message ?? "Request failed",
        details: payload.details,
      };
    }
    return {
      status: fbq.status as number,
      type: statusToType(fbq.status as number),
      message: typeof rawError === "string" ? rawError : "Request failed",
    };
  }
  return null;
}

function statusToType(status: number): string {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status >= 500) return "INTERNAL";
  return "ERROR";
}
