# Serene Azure Glass — 디자인 시스템 바이블

> 이 프로젝트(테크벤처 잡 매칭)의 전면 리디자인 단일 기준 문서.
> **모든 페이지·컴포넌트는 이 문서를 강박적으로 따른다.** 인라인으로 색을 막 쓰지 말고, 여기 정의된 토큰/유틸/프리미티브만 쓴다.

---

## 0. 철학 (한 문장)

> **"옅은 푸르른 안개 위에 떠 있는 유리판"** — 차분한 azure 톤의 글래스모피즘, 넓고 여유로운 에디토리얼 레이아웃, 스크롤하면 부드럽게 떠오르고 터치하면 살짝 눌리는 모션.

### 절대 금지 (이전 디자인의 죄)
- ❌ blue→indigo→**purple→pink→emerald→orange→teal** 무지개 그라데이션 (알록달록). **purple/pink/violet/fuchsia/rose/orange/amber/emerald/green/teal 계열 전면 금지.**
- ❌ 흑백 브루탈리즘 잔재: `uppercase`, `tracking-widest/extreme`, 검은 1px 테두리, `font-light` 영문 강제.
- ❌ 좁은 `max-w-7xl` 중앙 컬럼 + 빽빽한 패딩 → "AI가 짠 것 같은" 느낌.
- ❌ 진한 채도 단색 배경 블록(`bg-blue-600`, `bg-gray-900` 풀블리드 등)으로 섹션 칠하기.
- ❌ 딱딱한 직각/얇은 그림자 없는 카드.

### 반드시
- ✅ 단일 색 패밀리 **azure(하늘·청록빛 파랑)** + 중립 **ink(쿨 슬레이트네이비)** + 유리의 흰빛. 그게 전부.
- ✅ 모든 카드·패널·모달·드롭다운·인풋 = **글래스(반투명 + backdrop-blur + 흰 림라이트 테두리 + azure빛 소프트 그림자)**.
- ✅ 배경은 순백이 아니라 **옅은 azure 안개 + 은은한 오로라 글로우**.
- ✅ 넓은 레이아웃 + 넉넉한 여백 + 비대칭/에디토리얼 그리드.
- ✅ 스크롤 진입 reveal, 호버 리프트, 터치 탭 피드백, 패럴랙스 — 단 과하지 않고 부드럽게.

---

## 1. 색상 토큰 (Tailwind에 정의됨 — 클래스로 사용)

`tailwind.config.js`에 등록됨. **임의 hex/기본 팔레트 금지, 아래 토큰만 사용.**

### azure (브랜드 프라이머리)
`azure-50 … azure-950`. 핵심:
- `azure-500` `#3B8AF0` — 프라이머리 (버튼·강조·아이콘)
- `azure-600` `#2570D4` — 프라이머리 호버/딥
- `azure-400` `#5EA8FB` — 라이트 강조, 그라데이션 끝
- `azure-100/50` — 옅은 배경 틴트
- `azure-700/800` — 진한 텍스트형 강조

### sky (보조 쿨 하이라이트 — azure보다 청록/하늘빛)
`sky-cool-300/400/500` — 글래스 하이라이트, 그라데이션 보조에만 소량.

### ink (텍스트·중립)
- `ink-900` `#0E1F38` — 제목 (검정 대신 이걸로)
- `ink-700` `#2C415F` — 강한 본문
- `ink-500` `#5A6B85` — 본문 기본
- `ink-400` `#8595AC` — 보조/placeholder
- `ink-200` `#C9D4E3` — 테두리/구분선
- `ink-100` `#E3EAF3` — 옅은 배경

### 상태색 (절제해서, 채도 낮게)
- 성공 `mint-500 #22B8A6` (그린 대신 청록민트)
- 경고 `honey-500 #E8A33D` (소량, 핀포인트만)
- 위험 `coral-500 #F2685C`
> 상태색은 배지/아이콘/소량 텍스트에만. 큰 면적 칠하기 금지.

### 그라데이션은 azure 계열 안에서만
허용: `from-azure-400 to-azure-600`, `from-azure-500 via-sky-cool-400 to-azure-600`.
텍스트 그라데이션: `.text-gradient-azure` 유틸 사용.

---

## 2. 타이포그래피

- 본문/UI 폰트: **Pretendard Variable** (Tailwind `font-sans` 기본값). 한국어 최적.
- 디스플레이(큰 제목·영문·숫자): **Space Grotesk** → `font-display`. 한글은 자동으로 Pretendard로 폴백.
- **제목엔 `tracking-tight` (또는 `tracking-[-0.02em]`)**, 본문은 기본 자간.
- 위계:
  - Hero 제목: `font-display font-bold text-5xl md:text-6xl lg:text-7xl tracking-tight text-ink-900`
  - 섹션 제목(H2): `font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-ink-900`
  - 카드 제목(H3): `font-semibold text-xl md:text-2xl text-ink-900`
  - 본문: `text-ink-500 leading-relaxed text-base md:text-lg`
  - eyebrow(작은 라벨): `text-xs font-semibold uppercase tracking-[0.18em] text-azure-600` (영문 라벨에만 uppercase 허용, 한글 라벨은 uppercase 금지)
- **절대 `uppercase`를 한글에 적용하지 말 것.**

---

## 3. 글래스 시스템 (globals.css `@layer components`에 정의됨)

클래스만 붙이면 글래스가 완성된다:

| 클래스 | 용도 |
|---|---|
| `.glass` | 기본 글래스 패널 (`bg-white/55 backdrop-blur-xl` + 림라이트 + soft shadow) |
| `.glass-strong` | 더 불투명 (`bg-white/75`) — 모달·드롭다운·폼 카드 |
| `.glass-faint` | 아주 옅게 (`bg-white/35`) — 배경 위 보조 패널 |
| `.glass-card` | `.glass` + `rounded-4xl` + 패딩여백 친화 + 상단 흰 하이라이트 ring |
| `.glass-nav` | 상단 네비 전용 (`bg-white/70 backdrop-blur-2xl`) |
| `.glass-input` | 인풋/셀렉트/textarea 글래스 스타일 |
| `.rim` | 흰색 림라이트 테두리만 추가 |

- 글래스 카드 모서리: **`rounded-3xl`~`rounded-4xl`** (최소 `rounded-2xl`). 직각 금지.
- 그림자: `shadow-glass`(기본), `shadow-glass-lg`(떠있는 큰 카드/모달), `shadow-glass-sm`. **azure빛이 도는 소프트 그림자.** `shadow-md/lg/xl` 기본값 대신 이걸 쓴다.
- 테두리: `border border-white/60` (림라이트). 진한 테두리 필요 시 `border-azure-100`.

---

## 4. 레이아웃 (넓게, 에디토리얼하게)

- 컨테이너: **`max-w-[1400px] mx-auto`** 가 기본. 풀와이드 히어로/피처는 `max-w-[1600px]` 또는 풀블리드 배경 + 내부 와이드 컨텐츠.
- 좌우 패딩 스케일: `px-5 sm:px-8 lg:px-12 xl:px-20`.
- 섹션 세로 리듬: `py-20 md:py-28 lg:py-36`.
- 그리드는 단조로운 3등분 대신 **비대칭**도 적극 (`lg:grid-cols-12` + `col-span-7/5` 식, 또는 `lg:grid-cols-5` 에 큰 카드 2 + 작은 카드 3).
- 공용 컨테이너 유틸: `.container-wide` (= `max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-20`).
- 충분한 화이트스페이스. 요소를 빽빽하게 붙이지 말 것.

---

## 5. 모션 시스템 (framer-motion 12)

공용 프리미티브를 쓴다 (`src/components/ui/`):

- `<ScrollReveal>` — 뷰포트 진입 시 fade + 위로 떠오름. `delay`/`y` prop. 리스트엔 `<ScrollRevealStagger>`+`<ScrollRevealItem>`.
- `<MotionButton>` (= `GlassButton`) — `whileHover` 살짝 떠오름+글로우, `whileTap scale 0.96` (터치 피드백).
- 카드 호버: `whileHover={{ y: -6 }}` + 그림자 강화 (또는 `.hover-lift` 유틸 + transition).
- 히어로: `useScroll`+`useTransform`으로 배경/오브 패럴랙스.
- 상단 `<ScrollProgress>` 바 (azure 그라데이션) — 루트 레이아웃에 이미 배치됨.
- 배경 `<AuroraBackground>` — 옅은 azure 오로라 메시 + 떠다니는 오브(`animate-float-slow`). 페이지 루트에 깔 수 있음.
- 탭 전환: framer-motion `layoutId`로 활성 표시 슬라이드.
- **`prefers-reduced-motion` 존중** — 프리미티브가 내부 처리함. 직접 모션 쓸 때도 과하지 않게.
- 트랜지션 기본값: `transition-all duration-300 ease-out` (호버), reveal은 `duration: 0.6, ease: [0.22,1,0.36,1]`.

### 모션 강도 가이드
과한 회전(`rotate-3`)·튀는 bounce·무한 pulse 남발 금지. **부드럽고 절제된** 떠오름/글로우/패럴랙스가 고급스럽다.

---

## 6. 공용 UI 프리미티브 (`src/components/ui/` — import해서 사용)

```
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassTextarea, GlassSelect } from '@/components/ui/GlassField';
```

- `<GlassButton variant="primary|secondary|ghost|outline" size="sm|md|lg" as={Link} href=...>` — 모든 버튼/CTA는 이걸로. (변형: primary=azure 채움, secondary=글래스 흰, ghost=투명, outline=azure 테두리)
- `<GlassCard hover>` — 콘텐츠 카드. `hover`면 떠오름.
- `<SectionHeading eyebrow="..." title="..." subtitle="..." align="center|left" />`
- `<Badge tone="azure|mint|honey|coral|neutral">` — 상태/태그 칩.
- `<GlassInput/Textarea/Select>` — 폼 필드.

> 프리미티브로 안 되는 특수 UI는 위 토큰/유틸로 직접 글래스를 만들되 스타일 일관성 유지.

---

## 7. 컴포넌트별 규칙 요약

- **버튼**: 라운드 `rounded-xl~rounded-2xl`, 충분한 패딩(`px-6 py-3`+), primary는 azure 그라데이션+글로우 그림자, 터치 탭 모션. 텍스트 한글은 절대 uppercase 금지.
- **카드/패널**: 글래스 + `rounded-3xl/4xl` + `shadow-glass` + 호버 리프트.
- **모달**: 오버레이 `bg-ink-900/30 backdrop-blur-sm`, 패널 `.glass-strong rounded-4xl shadow-glass-lg`, 등장 모션(scale+fade), 닫기 버튼 글래스 원형. 기존 열기/닫기/제출 로직·상태·props는 100% 보존.
- **인풋/폼**: `.glass-input` 또는 `<GlassInput>`, focus 시 azure ring(`focus:ring-2 focus:ring-azure-400/50`), 라벨 `text-ink-700 font-medium`.
- **테이블/리스트(어드민)**: 글래스 컨테이너, 헤더 `bg-azure-50/60`, 행 호버 `hover:bg-azure-50/40`, 구분선 `divide-ink-100`.
- **배지/상태칩**: `<Badge>` 사용. 승인=mint, 대기=honey, 거절=coral, 기본=azure/neutral.
- **네비게이션**: `.glass-nav` 고정 헤더. (이미 리디자인됨 — 톤 일치시킬 것.)
- **빈 상태/로딩**: 글래스 카드 + azure 아이콘 + 부드러운 스켈레톤(`animate-shimmer`)·스피너(azure).
- **푸터**: 어두운 단색 대신 **딥 azure-네이비 글래스**(`bg-ink-900` 위 azure 글로우) 또는 옅은 글래스. 무지개 금지.

---

## 8. 무회귀 절대 원칙 (CRITICAL)

이 리디자인은 **순수 비주얼**이다. 다음은 **한 글자도 바꾸지 않는다**:
- 모든 `useState/useEffect/useMemo/useRef/useContext`, 커스텀 훅, 의존성 배열.
- 모든 Firebase/네트워크 호출, `await`, 데이터 가공 로직, 정렬/필터.
- 모든 이벤트 핸들러(onClick/onSubmit/onChange…)와 그 연결.
- 모든 라우팅(`href`, `router.push`), 조건부 렌더 분기(역할/인증/로딩 상태).
- 컴포넌트 **props 시그니처**, export 이름, `'use client'`.
- form `name`/`id`/`value`/제어 상태, 접근성 `aria-*`, `htmlFor`.

**바꾸는 것은 오직**: className, JSX 래퍼/구조(레이아웃·글래스·모션 래핑), 정적 텍스트의 **마크업**(문구 자체는 유지), 아이콘 스타일, 프리미티브로 치환.
→ import 추가는 OK. 새 prop으로 동작 바꾸기 금지. 데이터 흐름 건드리면 안 됨.

빌드(`npm run build`)는 반드시 그린이어야 한다. TypeScript 에러·미사용 import로 인한 빌드 실패 금지.

---

## 9. 체크리스트 (모든 파일 완료 시 자문)
- [ ] 무지개색 0개? azure+ink+유리흰색만?
- [ ] 모든 카드/패널/모달이 글래스 + 라운드 + 소프트 그림자?
- [ ] 레이아웃이 넓고(`max-w-[1400px]`+) 여백이 넉넉한가?
- [ ] 스크롤 reveal / 호버 리프트 / 터치 탭 모션이 있는가?
- [ ] 한글에 uppercase/극단 자간 없는가?
- [ ] 폰트가 Pretendard(본문)/Space Grotesk(디스플레이)인가?
- [ ] **모든 로직/핸들러/데이터/props/라우팅 보존됐는가?**
- [ ] 빌드 그린인가?
