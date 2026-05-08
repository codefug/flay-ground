import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Axios TestProxy Debug</h1>
      <p>axios 버전별 Next.js testProxy 호환성 테스트</p>
      <nav>
        <Link href="/items">Items 페이지 (서버 + 클라이언트 컴포넌트)</Link>
      </nav>
    </main>
  );
}
