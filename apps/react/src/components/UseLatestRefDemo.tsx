import { useEffect, useRef, useState } from "react";

// ─── useLatestRef ────────────────────────────────────────────────────────────
function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value; // 렌더마다 최신값으로 갱신
  return ref;
}

// ─── 공통 타이머 훅 (1초마다 onTick 호출) ────────────────────────────────────
// useEffect deps: [] → 마운트 시 딱 한 번만 등록
// 이 안에서 onTick을 직접 캡처하면 → stale closure 발생
function useInterval(onTick: () => void, ms: number) {
  const tickRef = useLatestRef(onTick);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current(); // 항상 최신 onTick 호출
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]); // onTick은 deps에 없음 — tickRef가 대신 최신값 보장
}

// ─── BROKEN: useLatestRef 없이 직접 캡처 ─────────────────────────────────────
function useBrokenInterval(onTick: () => void, ms: number) {
  useEffect(() => {
    const id = setInterval(() => {
      onTick(); // 마운트 시점의 onTick이 클로저에 고정됨 → stale
    }, ms);
    return () => clearInterval(id);
    // deps에 onTick 넣으면 매 렌더마다 clearInterval+setInterval 반복 → 다른 문제
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── 데모 컴포넌트 ────────────────────────────────────────────────────────────
export function UseLatestRefDemo() {
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  // 1초마다 score에 multiplier를 더함
  // multiplier는 버튼으로 바꿀 수 있음

  // ✅ FIXED: useLatestRef 사용 → multiplier가 바뀌어도 항상 최신값 읽음
  useInterval(() => {
    setScore((s) => s + multiplier);
  }, 1000);

  return (
    <div style={{ fontFamily: "monospace", padding: 24 }}>
      <h2>useLatestRef 필요성 데모</h2>

      <section style={{ marginBottom: 32 }}>
        <h3>✅ useLatestRef 사용 (정상)</h3>
        <p>
          score: <strong>{score}</strong> (1초마다 +{multiplier})
        </p>
        <p style={{ color: "gray", fontSize: 12 }}>
          multiplier를 바꿔도 즉시 반영됨 — setInterval 콜백이 항상 최신
          multiplier를 읽음
        </p>
        <button type="button" onClick={() => setMultiplier((m) => m + 1)}>
          multiplier +1 (현재: {multiplier})
        </button>
      </section>

      <BrokenExample />

      <Explanation />
    </div>
  );
}

// ─── Broken 예시 (별도 상태로 분리) ──────────────────────────────────────────
function BrokenExample() {
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  // ❌ BROKEN: stale closure — multiplier가 마운트 시점(1)에 고정됨
  useBrokenInterval(() => {
    setScore((s) => s + multiplier);
  }, 1000);

  return (
    <section style={{ marginBottom: 32 }}>
      <h3>❌ useLatestRef 없음 (stale closure)</h3>
      <p>
        score: <strong>{score}</strong> (1초마다 +{multiplier}라고 생각하지만…)
      </p>
      <p style={{ color: "red", fontSize: 12 }}>
        multiplier를 아무리 바꿔도 setInterval은 마운트 시점의 multiplier(1)만
        계속 씀
      </p>
      <button type="button" onClick={() => setMultiplier((m) => m + 1)}>
        multiplier +1 (현재: {multiplier})
      </button>
    </section>
  );
}

// ─── 설명 ─────────────────────────────────────────────────────────────────────
function Explanation() {
  return (
    <section
      style={{
        background: "#f5f5f5",
        padding: 16,
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      <h3>왜 이 문제가 생기나?</h3>
      <pre style={{ background: "#eee", padding: 12, borderRadius: 4 }}>
        {`// useEffect deps: []
// → 마운트 시 딱 한 번 setInterval 등록
// → 콜백 안의 onTick은 그 시점의 클로저를 캡처
// → multiplier가 나중에 바뀌어도 콜백은 여전히 옛날 multiplier를 봄

useEffect(() => {
  setInterval(() => {
    onTick(); // ← 이 onTick은 마운트 시점에 freeze된 함수
  }, 1000);
}, []); // ← 한 번만 등록`}
      </pre>

      <h3>useLatestRef가 해결하는 방법</h3>
      <pre style={{ background: "#eee", padding: 12, borderRadius: 4 }}>
        {`function useLatestRef(value) {
  const ref = useRef(value);
  ref.current = value; // ← 렌더마다 최신값으로 갱신 (동기)
  return ref;
}

// setInterval 콜백은 ref 객체를 캡처 (객체 참조는 변하지 않음)
// ref.current는 렌더마다 갱신되므로 항상 최신값을 읽을 수 있음
tickRef.current(); // ← 항상 최신 onTick`}
      </pre>

      <p>
        <strong>핵심:</strong> ref 객체 자체의 참조(identity)는 고정, 하지만
        .current 내용은 매 렌더에 갱신.
        <br />
        setInterval 콜백은 고정된 ref 객체만 바라보면 되고,
        <br />
        실제 최신값은 ref.current를 통해 간접 참조한다.
      </p>
    </section>
  );
}
