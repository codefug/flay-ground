export const REQUEST_COUNT = 30;

export interface TestResult {
  startTime: number | null;
  endTime: number | null;
  data: Array<{ id: number; data: string }>;
}

export interface DataResponse {
  id: number;
  data: string;
  timestamp: number;
}
