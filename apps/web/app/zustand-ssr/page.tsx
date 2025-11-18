import { ProblematicClientComponent } from "./problematic-client";
import { ProblematicServerComponent } from "./problematic-server";

/**
 * Zustand SSR 싱글톤 문제 테스트 페이지
 *
 * 테스트 방법:
 * 1. 일반 브라우저에서 http://localhost:3000/zustand-ssr 접속
 * 2. 시크릿 모드에서 같은 URL 접속
 * 3. 한쪽에서 카운터를 증가시키면 다른 쪽도 영향을 받는지 확인
 *
 * 예상되는 문제:
 * - 서버 컴포넌트에서 store를 읽으면 모든 요청이 같은 값을 공유
 * - 클라이언트 컴포넌트는 각 브라우저마다 독립적이지만, 초기 SSR 값이 공유될 수 있음
 */
export default function ZustandSSRPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Zustand SSR 싱글톤 문제 테스트</h1>

      <div
        style={{
          backgroundColor: "#fee",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: "#c00", marginTop: 0 }}>⚠️ 문제가 있는 구현</h2>
        <p>
          이 페이지는 Zustand를 모듈 레벨 싱글톤으로 사용하는 문제가 있는
          예시입니다. 서버 컴포넌트와 클라이언트 컴포넌트 모두에서 같은 store
          인스턴스를 공유합니다.
        </p>
        <p>
          <strong>테스트:</strong> 일반 브라우저와 시크릿 모드에서 각각 열고,
          한쪽에서 카운터를 조작해보세요. 서버 컴포넌트의 값이 공유되는지 확인할
          수 있습니다.
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        <div
          style={{
            border: "2px solid #f00",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#c00" }}>
            서버 컴포넌트 (문제 발생)
          </h2>
          <ProblematicServerComponent />
        </div>

        <div
          style={{
            border: "2px solid #00f",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#00f" }}>클라이언트 컴포넌트</h2>
          <ProblematicClientComponent />
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#efe",
          borderRadius: "8px",
        }}
      >
        <h3>관찰 포인트</h3>
        <ul>
          <li>서버 컴포넌트의 값이 여러 브라우저/탭 간에 공유되는지 확인</li>
          <li>클라이언트 컴포넌트는 각 브라우저마다 독립적인지 확인</li>
          <li>서버 컴포넌트의 초기값이 클라이언트와 일치하지 않는 경우 확인</li>
          <li>새로고침 시 서버 컴포넌트 값이 예상과 다르게 변경되는지 확인</li>
        </ul>
      </div>
    </div>
  );
}
