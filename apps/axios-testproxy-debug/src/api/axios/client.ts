import axios from "axios";

const API_BASE_URL =
  process.env.API_URL ?? "http://mock-api.example.com";

export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
  // testProxy 인터셉션을 위해 fetch adapter 필요
  // http adapter는 Node.js http 모듈을 직접 사용해 testProxy를 우회함
  adapter: "fetch",
});
