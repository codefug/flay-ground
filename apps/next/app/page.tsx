"use client";

import { IndependentRouteHandlerComponents } from "./performance-test/IndependentRouteHandlerComponents";
import { IndependentServerActionComponents } from "./performance-test/IndependentServerActionComponents";
import { PerformanceTestProvider } from "./performance-test/PerformanceTestContext";
import { RequestCountControl } from "./performance-test/RequestCountControl";
import { RouteHandlerTest } from "./performance-test/RouteHandlerTest";
import { RouteHandlerWithReactQuery } from "./performance-test/RouteHandlerWithReactQuery";
import { ServerActionTest } from "./performance-test/ServerActionTest";
import { ServerActionWithReactQuery } from "./performance-test/ServerActionWithReactQuery";

export default function PerformanceTestPage() {
  return (
    <PerformanceTestProvider>
      <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ margin: 0 }}>성능 비교 테스트 - Express 프록시</h1>
          <a
            href="/PERFORMANCE_TEST.md"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            📖 문서 보기
          </a>
        </div>

        <RequestCountControl />

        <div
          style={{
            padding: "20px",
            marginTop: "30px",
            marginBottom: "30px",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "15px", fontSize: "18px" }}>
            중요: Server Action의 순차 실행 특성
          </h2>
          <div style={{ lineHeight: "1.8", color: "#495057" }}>
            <p style={{ marginBottom: "10px" }}>
              <strong>
                Server Action은 Next.js에서 순차적으로 실행됩니다.
              </strong>
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "10px" }}>
              <li>
                <strong>Server Action (직접 호출)</strong>: Promise.all을
                사용해도 내부적으로 순차 실행되어 총 소요 시간이 길어집니다.
              </li>
              <li>
                <strong>Route Handler</strong>: HTTP 요청이므로 병렬 실행이
                가능하여 더 빠른 성능을 보입니다.
              </li>
              <li>
                <strong>React Query 사용 시</strong>: useQuery를 사용하면 각
                쿼리가 독립적으로 실행되지만, Server Action의 경우 여전히 순차
                실행의 영향을 받을 수 있습니다.
              </li>
            </ul>
            <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
              이는 Next.js의 Server Action이 서버 컴포넌트와 동일한 실행
              컨텍스트를 공유하기 때문입니다. 병렬 처리가 필요한 경우 Route
              Handler를 사용하는 것이 권장됩니다.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <ServerActionTest />
          <RouteHandlerTest />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <ServerActionWithReactQuery />
          <RouteHandlerWithReactQuery />
        </div>

        {/* 각 컴포넌트에서 독립적으로 query 실행 테스트 */}
        <div
          style={{
            marginTop: "60px",
            paddingTop: "40px",
            borderTop: "2px solid #dee2e6",
          }}
        >
          <h1 style={{ marginBottom: "20px" }}>
            독립 컴포넌트 테스트 (각 컴포넌트에서 개별 Query 실행)
          </h1>

          <div
            style={{
              padding: "20px",
              marginBottom: "30px",
              background: "#e7f3ff",
              borderRadius: "8px",
              border: "1px solid #b3d9ff",
            }}
          >
            <h2
              style={{ marginTop: 0, marginBottom: "15px", fontSize: "18px" }}
            >
              테스트 목적: 각 컴포넌트가 독립적으로 Query를 실행할 때의 동작
            </h2>
            <div style={{ lineHeight: "1.8", color: "#004085" }}>
              <p style={{ marginBottom: "10px" }}>
                아래 테스트는 <strong>각각의 독립적인 컴포넌트</strong>가
                자신만의 useQuery를 가지고, 컴포넌트가 마운트될 때 자동으로
                query를 실행하는 경우를 시뮬레이션합니다.
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "10px" }}>
                <li>
                  <strong>Server Action + 독립 컴포넌트</strong>: 각 컴포넌트가
                  독립적으로 Server Action을 호출하지만, Server Action의 순차
                  실행 특성으로 인해 전체적으로는 순차적으로 처리될 수 있습니다.
                </li>
                <li>
                  <strong>Route Handler + 독립 컴포넌트</strong>: 각 컴포넌트가
                  독립적으로 HTTP 요청을 보내므로, 브라우저의 HTTP 클라이언트가
                  병렬로 처리하여 더 빠른 성능을 보입니다.
                </li>
              </ul>
              <p style={{ margin: 0, fontSize: "14px", color: "#0056b3" }}>
                이 테스트는 실제 애플리케이션에서 여러 컴포넌트가 동시에
                데이터를 가져올 때의 동작을 확인합니다.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <IndependentServerActionComponents />
            <IndependentRouteHandlerComponents />
          </div>
        </div>
      </div>
    </PerformanceTestProvider>
  );
}
