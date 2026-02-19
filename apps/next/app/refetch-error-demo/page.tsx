"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

// Mock API: 첫 번째 호출은 성공, 두 번째부터는 실패
let callCount = 0;
const mockFetchData = async (): Promise<{
  message: string;
  timestamp: string;
}> => {
  callCount++;

  // 네트워크 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 첫 번째 호출은 성공
  if (callCount === 1) {
    return {
      message: "첫 번째 데이터 (성공)",
      timestamp: new Date().toISOString(),
    };
  }

  // 두 번째 호출부터는 실패
  throw new Error("네트워크 에러: 서버에 연결할 수 없습니다");
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // 자동 재시도 비활성화
      refetchOnWindowFocus: false, // 포커스 시 자동 refetch 비활성화
    },
  },
});

function RefetchErrorDemoContent() {
  const {
    data,
    error,
    isError,
    isLoading,
    isFetching,
    dataUpdatedAt,
    errorUpdatedAt,
  } = useQuery({
    queryKey: ["demo-data"],
    queryFn: mockFetchData,
    refetchInterval: (data) =>
      data?.message !== "첫 번째 데이터 (성공)" ? 3000 : false,
  });

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>
        useQuery refetchInterval 에러 데모
      </h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#fff3cd",
          borderRadius: "8px",
          border: "1px solid #ffc107",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6" }}>
          <strong>⏱️ 자동 refetch 동작 중:</strong> 3초마다 자동으로 데이터를
          다시 가져옵니다.
          <br />
          <strong>시나리오:</strong> 첫 번째 요청은 성공 → 이후 모든 요청은 실패
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => {
            callCount = 0;
            queryClient.clear();
            window.location.reload();
          }}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          초기화 (새로고침)
        </button>
        <span style={{ marginLeft: "10px", fontSize: "14px", color: "#666" }}>
          API 호출 횟수: <strong>{callCount}</strong>
        </span>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* React Query 상태 표시 */}
        <div
          style={{
            padding: "20px",
            border: "2px solid #6f42c1",
            borderRadius: "8px",
            backgroundColor: "#e7e3f5",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#4a148c" }}>
            🔍 React Query 상태{" "}
            {isFetching && (
              <span style={{ fontSize: "14px", color: "#666" }}>
                (현재 fetching 중...)
              </span>
            )}
          </h2>
          <p>
            <strong>isLoading:</strong> {isLoading ? "✅" : "❌"}
          </p>
          <p>
            <strong>isFetching:</strong> {isFetching ? "✅" : "❌"}
          </p>
          <p>
            <strong>isError:</strong> {isError ? "✅" : "❌"}
          </p>
          <p>
            <strong>data 존재:</strong> {data ? "✅" : "❌"}
          </p>
          <p>
            <strong>error 존재:</strong> {error ? "✅" : "❌"}
          </p>
          {dataUpdatedAt > 0 && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
              <strong>마지막 데이터 업데이트:</strong>{" "}
              {new Date(dataUpdatedAt).toLocaleTimeString()}
            </p>
          )}
          {errorUpdatedAt > 0 && (
            <p style={{ fontSize: "12px", color: "#666" }}>
              <strong>마지막 에러 발생:</strong>{" "}
              {new Date(errorUpdatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* 데이터 표시 */}
        <div
          style={{
            padding: "20px",
            border: "2px solid #28a745",
            borderRadius: "8px",
            backgroundColor: data ? "#d4edda" : "#f8f9fa",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#155724" }}>
            📊 Data (useQuery.data)
          </h2>
          {data ? (
            <>
              <p>
                <strong>메시지:</strong> {data.message}
              </p>
              <p>
                <strong>타임스탬프:</strong> {data.timestamp}
              </p>
              <p
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                ⚠️ React Query는 이전 성공한 데이터를 유지합니다!
              </p>
            </>
          ) : (
            <p style={{ color: "#6c757d" }}>데이터 없음</p>
          )}
        </div>

        {/* 에러 표시 */}
        <div
          style={{
            padding: "20px",
            border: "2px solid #dc3545",
            borderRadius: "8px",
            backgroundColor: error ? "#f8d7da" : "#f8f9fa",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#721c24" }}>
            ❌ Error (useQuery.error)
          </h2>
          {error ? (
            <>
              <p>
                <strong>에러 메시지:</strong> {error.message}
              </p>
              <p
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                🐛 refetch 시 에러가 발생했지만 위의 이전 데이터도 함께
                존재합니다!
              </p>
            </>
          ) : (
            <p style={{ color: "#6c757d" }}>에러 없음</p>
          )}
        </div>

        {/* 문제 상황 설명 */}
        {data && isError && (
          <div
            style={{
              padding: "20px",
              border: "2px solid #ffc107",
              borderRadius: "8px",
              backgroundColor: "#fff3cd",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#856404" }}>⚠️ 위험한 상황!</h2>
            <p style={{ fontSize: "16px", fontWeight: "bold" }}>
              data와 error가 동시에 존재합니다!
            </p>
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#fff",
                borderRadius: "4px",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              <p>
                <strong>💡 문제:</strong>
              </p>
              <p>
                React Query는 이전 성공한 데이터를 캐시에 유지합니다.
                refetch에서 에러가 발생해도 이전 데이터는 그대로 남아있어서,
                사용자는 최신이 아닌 오래된 데이터를 보게 됩니다.
              </p>
            </div>
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#fff",
                borderRadius: "4px",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              <p>
                <strong>✅ 올바른 처리 방법:</strong>
              </p>
              <pre
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >{`// ❌ 잘못된 방법
if (data) {
  return <div>{data.message}</div>
}

// ✅ 올바른 방법 1: isError 우선 체크
if (isError) {
  return <div>에러 발생</div>
}
if (data) {
  return <div>{data.message}</div>
}

// ✅ 올바른 방법 2: 에러 시 데이터 무시
if (isError || !data) {
  return <div>데이터 없음</div>
}
return <div>{data.message}</div>`}</pre>
            </div>
          </div>
        )}
      </div>

      {/* 시나리오 설명 */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#e7f3ff",
          borderRadius: "8px",
          border: "1px solid #b3d9ff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>📖 시나리오</h3>
        <ol style={{ lineHeight: "1.8" }}>
          <li>
            <strong>첫 번째 클릭:</strong> "데이터 가져오기" → 성공 ✅
          </li>
          <li>
            <strong>두 번째 클릭:</strong> "Refetch (에러 발생)" → 실패 ❌
          </li>
          <li>
            <strong>문제 확인:</strong> isError는 true지만, data는 여전히 이전
            값을 가지고 있습니다!
          </li>
          <li>
            <strong>위험:</strong> <code>if (data)</code>만 체크하면 에러가
            발생해도 오래된 데이터를 표시하게 됩니다.
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function RefetchErrorDemo() {
  return (
    <QueryClientProvider client={queryClient}>
      <RefetchErrorDemoContent />
    </QueryClientProvider>
  );
}
