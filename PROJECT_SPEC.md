# WKS (Worst Kept Secret) — Desktop Homepage Prototype Spec v2

원본 스펙(OS Desktop Rebranding Site) 검토 후 업데이트한 버전. 컨셉과 창 시스템 설계는
그대로 유지하되, **SEO / 접근성 / 성능**이 원본 설계(순수 CSR SPA, fixed 풀스크린,
비밀번호 게이트)와 정면으로 충돌하는 지점들을 하이브리드 구조로 보완했다.

## 0. 총평 — 무엇을 바꿨고 왜

원본 컨셉("사이트 = 데스크탑") 자체는 그대로 간다. 바뀐 것은 **그 아래 깔리는 구조**다.

- 원본은 Next.js를 "오버스펙"이라 판단하고 순수 Vite CSR SPA로 결정했다. 데모/사내 프로토타입이면
  맞는 판단이지만, 이건 **리브랜딩 런칭 홈페이지**다 — 크롤러/공유 미리보기/초기 로드 성능이
  전부 걸려 있는 페이지에 순수 CSR은 리스크가 크다. → **Next.js App Router로 전환**을 권장한다.
- 창(window)으로 여는 콘텐츠(About/Work/Contact 등)를 **실제 라우트**로 승격시켜, 데스크탑
  메타포는 그 위의 UI 레이어로만 동작하게 한다. 이러면 SEO/딥링크/뒤로가기가 공짜로 따라온다.
- 부팅→로그인→해킹 연출은 장식이지 게이트가 아니다. `prefers-reduced-motion`과 스킵 경로를
  처음부터 설계에 넣는다.

아래는 원본 문서의 각 섹션에 대응하는 변경/보완 사항이다.

---

## 1. 스택 (변경)

| 영역 | 원본 | 변경 | 이유 |
|---|---|---|---|
| 빌드 | Vite + React 18 + TS (CSR SPA) | **Next.js 15 (App Router) + React + TS** | 라우트별 정적/서버 렌더링으로 메타태그·OG·초기 시맨틱 콘텐츠 확보. `next/image`, 자동 코드 스플릿, Vercel과 1:1 매칭. GSAP/Draggable/Lenis 등 클라이언트 전용 로직은 `dynamic(() => import(...), { ssr:false })`로 감싸면 됨 — SSR 신경 쓸 부분은 이것뿐 |
| 상태 | Zustand | 그대로 | 적절한 선택. 유지 |
| 애니메이션 | GSAP 3 (+ ScrollTrigger, Draggable, MotionPathPlugin) | 그대로 (Business/Club 라이선스 필요 플러그인 없는지만 재확인 — Draggable/ScrollTrigger/MotionPath는 전부 무료) | 유지 |
| 스크롤 | Lenis | 그대로, 단 **포커스된 창에만 인스턴스 생성** | 창 여러 개 열렸을 때 Lenis 인스턴스 난립 방지 (성능) |
| 스타일 | Tailwind + CSS Variables | 그대로 | 유지 |
| 콘텐츠 | 컴포넌트에 하드코딩 | **`content/*.ts` (또는 MDX) + zod 스키마로 분리** | 카피/이미지 교체 시 컴포넌트 안 건드리게. 마케팅/디자인팀이 텍스트만 바꿀 수 있어야 함 |
| 배포 | Vercel | 그대로 | 유지 |
| (later) AI 챗 | Anthropic API via Vercel Function | 그대로 | 유지 — Next.js Route Handler로 자연스럽게 이어짐 |

**대안으로 고려했다 기각한 것**: Astro + React 아일랜드. 정적 콘텐츠를 zero-JS로 낼 수 있어
번들은 더 작아지지만, 창 시스템 전역 상태(zustand)를 아일랜드 경계 너머로 공유하려면
nanostores 등으로 갈아타야 하고 팀이 이미 zustand/React 멘탈모델에 있으므로 실익 대비
전환 비용이 크다. Next.js가 실용적 절충안.

설치 (원본 대체):
```
npx create-next-app@latest wks-site --typescript --app --tailwind
npm i gsap lenis zustand zod
```

---

## 2. 라우팅 = 창 상태의 source of truth (신규)

원본은 창 상태를 순수 클라이언트 메모리(zustand)에만 둔다 — 새로고침하면 열린 창이 날아가고,
크롤러는 빈 데스크탑만 본다. 이걸 라우트에 묶는다.

```
/            → desktop 진입, home 창 자동 오픈
/about       → about 창이 오픈된 상태로 진입 (딥링크/공유 가능)
/work        → work 창 오픈
/contact     → contact 창 오픈
```

- `windowStore.open(contentKey)`는 내부적으로 `router.push`/`replaceState`도 호출 →
  URL과 열린 창 목록이 항상 동기화됨
- 브라우저 뒤로가기 = 창 닫기, 새로고침 = 그 창이 열린 상태로 복원
- 각 라우트는 Next.js가 **그 창 콘텐츠 기준 메타데이터**(title, description, OG image)를
  `generateMetadata`로 내려줌 → 크롤러/카톡·슬랙 링크 미리보기가 실제 콘텐츠를 보게 됨
  (지금 컨셉으로는 크롤러가 "빈 데스크탑 화면"만 보게 되는 게 가장 큰 리스크였음)
- JS가 로드되기 전에도 `/about` 요청 시 서버에서 최소한의 시맨틱 HTML(제목, 본문 텍스트,
  이미지 alt)이 먼저 그려지고, 그 위에 데스크탑 UI가 progressive enhancement로 올라탐

---

## 3. 앱 단계 (State Machine) — 원본 유지 + 스킵 경로

```
booting → login → hacking → desktop
```

- 원본 로직(sessionStorage 기준 첫 방문만 booting) 그대로 유지
- **추가**: `prefers-reduced-motion: reduce` 감지 시 booting/hacking 연출을 스킵하고
  즉시 desktop으로 (트랜지션 자체가 목적이지 정보 전달이 아니므로 스킵해도 손실 없음)
- **추가**: 로그인 화면에 시각적으로 눈에 띄지 않아도 되는 "Skip intro" 텍스트 링크 —
  스크린리더/키보드 사용자가 가짜 인증 연출에 발이 묶이지 않게

---

## 4. 접근성 (신규 — 원본에 없던 섹션)

이 컨셉은 기본값이 접근성과 상극이다(가짜 로그인 게이트, 드래그 전용 인터랙션, 고정 뷰포트,
빠른 픽셀/글리치 애니메이션). "느낌은 살리되 막다른 길을 만들지 않는다"가 원칙.

- **모션**: `prefers-reduced-motion`에서 boot/hacking 연출·픽셀 리빌·motion path 장식 전부
  즉시 최종 상태로. 장식용 픽셀 그리드/글리치 요소는 `aria-hidden="true"`
- **키보드**: 창은 Tab으로 순회 가능, Enter/Space로 포커스(맨 앞으로), Esc로 닫기.
  드래그는 마우스 전용이어도 무방(위치는 미학이지 기능이 아님) — 단, 열기/읽기/닫기는
  키보드만으로 완결되어야 함
- **포커스 관리**: 창 열릴 때 포커스를 창 안(제목 또는 첫 인터랙션 요소)으로 이동,
  닫히면 트리거(FolderIcon)로 포커스 복귀
- **창 시맨틱**: 각 창은 `role="dialog"` 또는 `region` + `aria-labelledby`(titlebar 텍스트)
- **알림**: `NotificationLayer`는 `aria-live="polite"` + `role="status"` — 스크린리더가
  자연스럽게 읽되 인터럽트하지 않음
- **색 대비**: 다크/픽셀 테마 둘 다 WCAG AA(4.5:1 텍스트) 확보 — 특히 "모노톤 다크"는
  대비가 낮게 나오기 쉬우니 SettingsPanel 만들 때 실측
- **콘텐츠**: 픽셀 리빌 이미지도 정상 `alt` 텍스트 유지 — 시각 효과와 대체 텍스트는 별개

---

## 5. 성능 (원본 5.6 보완)

- **번들**: boot/login/hacking 컴포넌트는 desktop 진입 후 언마운트 + `dynamic import`로
  분리 — 재방문 세션에서는 아예 로드 안 되게
- **GSAP**: 플러그인은 필요한 것만 named import, `gsap.registerPlugin`은 클라이언트
  진입점 한 곳에서만
- **Lenis**: 포커스된(맨 앞) 창에만 인스턴스 생성, 창이 닫히거나 뒤로 밀리면 destroy —
  열린 창마다 Lenis+ScrollTrigger 인스턴스가 누적되는 걸 방지
- **Draggable**: transform(x,y) 기반 이동만 사용 (top/left 금지 — 레이아웃 스래싱 방지)
- **이미지**: `next/image` + AVIF/WebP + 원본 스펙의 "방법 A" 그대로 채택. 저해상도
  placeholder는 `next/image`의 blur placeholder와 자연스럽게 맞물림
- **목표 지표**: LCP < 2.5s, CLS < 0.1, TBT < 200ms — 애니메이션이 무거운 사이트일수록
  이 숫자를 Day 3 QA에서 실제로 측정

---

## 6. 콘텐츠/유지보수 구조 (신규)

원본의 `CONTENT_REGISTRY: Record<string, React.FC>`는 유지하되, **폴더 메타데이터를
하나의 config로 통합**한다. 원본은 "폴더 추가 = 컴포넌트 등록 + FolderIcon 데이터, 두 곳
수정"인데, 하나로 합치면 한 곳만 건드리면 됨:

```ts
// content/folders.ts
export const FOLDERS = [
  { id: 'home',    title: '홈',    icon: 'home.svg',    contentKey: 'home' },
  { id: 'about',   title: '회사',  icon: 'about.svg',   contentKey: 'about' },
  { id: 'work',    title: '작업',  icon: 'work.svg',    contentKey: 'work' },
] satisfies FolderMeta[];
```

`FolderIcon` 목록과 라우트(`/about`, `/work`)는 전부 이 배열에서 파생. 카피 텍스트/이미지는
컴포넌트가 아니라 `content/about.ts` 같은 데이터 파일에 두고 zod로 스키마 검증 —
마케팅팀이 텍스트 수정할 때 TSX를 안 건드리게.

---

## 7. 폴더 구조 (Next.js 기준으로 조정)

```
src/
├── app/
│   ├── layout.tsx           # <html data-theme data-pixel>, 전역 provider
│   ├── page.tsx              # '/' — desktop 진입 + home 창 오픈
│   ├── about/page.tsx         # generateMetadata + about 창 오픈 상태로 진입
│   ├── work/page.tsx
│   └── api/chat/route.ts      # (later) AI 챗 serverless
├── stores/                   # useAppStore / useWindowStore / useNotificationStore — 원본과 동일
├── phases/                   # BootScreen / LoginScreen / HackTransition — 원본과 동일
├── desktop/                  # Desktop / MenuBar / SettingsPanel / FolderIcon / Dock / NotificationLayer
├── windows/                  # WindowFrame / WindowManager / contents/*
├── content/                  # folders.ts, about.ts, work.ts … (zod 스키마 검증되는 데이터)
├── effects/                  # PixelReveal / PixelGrid / useLenisInWindow
└── styles/themes.css
```

---

## 8. 3일 플랜 (소폭 조정)

- **Day 1**: 원본과 동일 (stores → WindowFrame → WindowManager → Desktop) + 라우트↔창
  동기화 기본 골격, `content/folders.ts` 단일 config
- **Day 2**: 원본과 동일 (BootScreen/LoginScreen/HackTransition/HomeContent) +
  `prefers-reduced-motion` 스킵 경로, 각 라우트 `generateMetadata`
- **Day 3**: 원본과 동일 (SettingsPanel/Notifications/폴리시) + 접근성 QA
  (키보드 순회, 대비, 스크린리더로 창 열기/닫기 확인) + Lighthouse 성능 측정

---

## 9. Claude Code 작업 시 참고 (원본 유지 + 추가)

- Draggable/ScrollTrigger/MotionPathPlugin/Flip은 `gsap.registerPlugin()` 필수 (원본 동일)
- GSAP/Draggable/Lenis는 클라이언트 전용 — Next.js에서는 `'use client'` + 필요시
  `dynamic(..., { ssr:false })`
- 창 리사이즈는 프로토타입 범위 제외 (원본 동일)
- 모바일은 "창=풀스크린 시트" 최소 대응 (원본 동일)
- 새 창 콘텐츠 추가 시 **`content/folders.ts` 한 곳만 수정** (컴포넌트 등록은
  `CONTENT_REGISTRY`에서 자동 매핑)
