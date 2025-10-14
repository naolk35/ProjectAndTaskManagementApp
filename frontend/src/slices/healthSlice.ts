// 💚 Health Slice
// Redux slice to store the health status of the backend.
// Works with healthApi to display "Server Connected" or "Offline" in the UI.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchHealth = createAsyncThunk("health/fetch", async () => {
  const base = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  const { data } = await axios.get(`${base.replace(/\/$/, "")}/../health`);
  return data as { ok: boolean; service: string; time: string };
});

type HealthState = {
  status: "idle" | "loading" | "succeeded" | "failed";
  data?: { ok: boolean; service: string; time: string };
  error?: string;
};
const initialState: HealthState = { status: "idle" };

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchHealth.pending, (s) => {
      s.status = "loading";
      s.error = undefined;
    })
      .addCase(fetchHealth.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.data = a.payload;
      })
      .addCase(fetchHealth.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message || "Request failed";
      });
  },
});

export default healthSlice.reducer;
