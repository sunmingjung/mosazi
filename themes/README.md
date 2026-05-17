# Theme Snapshots

라이브 코드(`web/app/`)의 디자인 시안 백업.
새 시안 시도할 때 현재 시안을 잃지 않도록 통째로 보관.

## 구조

```
web/
├── app/                        ← 라이브 (현재 적용된 디자인)
└── themes/
    ├── magazine/               ← 매거진 시안 (모노크롬 + 세리프)
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── components/
    │   └── consult/
    └── (다른-시안)/
```

각 폴더는 해당 시안을 적용했을 때의 파일 상태를 **그대로** 가지고 있음.
복원 = `themes/<이름>/*` 를 `app/` 로 덮어쓰기.

> Next.js 빌드/타입체크에서 제외됨 (`tsconfig.json` exclude + Next 가 app/ 만 라우트로 인식).

## 적용 방법

### Claude 에게 시키기
"`<이름>` 디자인 적용해줘" 하면 Claude 가 해당 폴더에서 라이브로 복원.

### 수동 (참고)
```bash
THEME=magazine
cp web/themes/$THEME/globals.css            web/app/globals.css
cp web/themes/$THEME/layout.tsx             web/app/layout.tsx
cp web/themes/$THEME/page.tsx               web/app/page.tsx
cp web/themes/$THEME/components/*.tsx       web/app/components/
cp web/themes/$THEME/consult/page.tsx       web/app/consult/page.tsx
```

## 새 시안 보관 방법

현재 라이브 시안을 새 이름으로 묻어두기:
```bash
NEW=시안이름
mkdir -p web/themes/$NEW/{components,consult}
cp web/app/globals.css web/app/layout.tsx web/app/page.tsx web/themes/$NEW/
cp web/app/components/{RecommendModal,ProductCard,FilterBar}.tsx web/themes/$NEW/components/
cp web/app/consult/page.tsx web/themes/$NEW/consult/
```

## 현재 시안 목록

| 시안 | 일자 | 특징 |
|---|---|---|
| `magazine` | 2026-05-17 | 모노크롬(크림+잉크), Noto Serif KR 디스플레이, 4:5 카드, uppercase tracking 라벨 |
| `magic-girl` | 2026-05-17 | Y2K 마법소녀 — 파스텔(핑크/라벤더/민트) + 그라데이션, Single Day / Gowun Dodum, 마우스 별가루 SparkleCursor, rounded-3xl 카드, ♡✨ 데코 |

> magic-girl 은 추가 컴포넌트 `SparkleCursor.tsx` 포함. 매거진으로 복원할 땐 SparkleCursor 도 삭제 필요.
