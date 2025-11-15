# Flayground

**Flay your code. Play your code.**

Pure, React, Next.js 등 다양한 프론트엔드 환경에서 코드를 테스트하고 검증하기 위한 플레이그라운드 프로젝트입니다.

## 목적

이 프로젝트는 비즈니스 로직 없이 필요한 기능이나 개념을 빠르게 테스트하고 검증하기 위한 환경을 제공합니다. AWS 배포 등 특수한 경우도 포함하여 테스트할 수 있습니다.

- 백지와 가까운 상태로 유지
- 필요할 때 바로 개발 서버 실행하여 검증
- 안정성을 위한 설정 파일만 커밋 (코드 자체는 커밋하지 않음)

## 프로젝트 구조

### Apps

- `apps/pure`: 순수 HTML/CSS/JavaScript 환경
- `apps/react`: React + Vite 환경
- `apps/web`: Next.js 환경

### Packages

- `packages/ui`: 공유 React 컴포넌트 라이브러리
- `packages/eslint-config`: ESLint 설정
- `packages/typescript-config`: TypeScript 설정

## 빠른 시작

### 전체 개발 서버 실행

```sh
pnpm dev
```

### 개별 앱 실행

```sh
# Pure HTML 환경
pnpm dev:pure

# React 앱
pnpm dev:react

# Next.js 앱
pnpm dev:web
```

각 앱은 다른 포트에서 실행됩니다:
- Pure: `http://localhost:8080`
- React: `http://localhost:3001`
- Next.js: `http://localhost:3000`

## 사용법

1. 필요한 앱 디렉토리로 이동
2. 코드 작성 및 테스트
3. 개발 서버 실행하여 확인
4. 검증 완료 후 코드는 커밋하지 않음 (설정 파일만 커밋)

## 빌드

모든 앱과 패키지를 빌드:

```sh
pnpm build
```

특정 패키지만 빌드:

```sh
pnpm build --filter=web
```

## 개발 도구

이 프로젝트는 다음 도구들을 사용합니다:

- [Turborepo](https://turborepo.org/) - 모노레포 관리
- [TypeScript](https://www.typescriptlang.org/) - 타입 체크
- [ESLint](https://eslint.org/) - 코드 린팅
- [Prettier](https://prettier.io) - 코드 포맷팅

## 커밋 규칙

안정성을 위한 설정 파일만 커밋합니다. 자세한 내용은 `.cursor/commands/commit.md`를 참조하세요.
