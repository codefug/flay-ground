import axios from "axios";

const API_BASE_URL =
  process.env.API_URL ?? "http://mock-api.example.com";

export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});
