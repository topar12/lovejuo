# 주오 입양 상담 & 멤버십 안내 페이지

> 반려동물 입양 보호자를 위한 **멤버십 플랜 안내 및 온라인 상담 위자드** 웹 애플리케이션

---

## 📋 프로젝트 개요

주오(Juo) 브랜드의 반려동물 케어 멤버십을 소개하고, 보호자의 상황에 맞는 플랜을 추천해주는 인터랙티브 상담 페이지입니다.  
단계별 질문을 통해 최적의 멤버십 등급(VIP / Gold / Silver / White)을 추천하며, 각 등급의 상세 혜택을 비교할 수 있는 전체화면 비교표를 제공합니다.

---

## 🗂 파일 구조

```
juo-adoption-counseling/
│
├── index.html                    # 메인 상담 위자드 & 대시보드
├── membership-compare.html       # 정적 멤버십 비교 페이지
│
├── membership_vip_detail.html    # VIP 등급 상세 안내
├── membership_gold_detail.html   # Gold 등급 상세 안내
├── membership_silver_detail.html # Silver 등급 상세 안내
├── membership_white_detail.html  # White 등급 상세 안내
│
├── css/
│   ├── adoption-counseling.css   # 메인 위자드 스타일
│   ├── membership_common.css     # 등급 상세 페이지 공통 스타일
│   ├── membership_vip.css        # VIP 상세 페이지 스타일
│   ├── membership_gold.css       # Gold 상세 페이지 스타일
│   ├── membership_silver.css     # Silver 상세 페이지 스타일
│   └── membership_white.css      # White 상세 페이지 스타일
│
├── js/
│   └── adoption-counseling.js    # 위자드 로직 & 멤버십 데이터(PLAN_CATALOG)
│
└── assets/                       # 이미지 등 정적 자산
```

---

## 🐾 멤버십 등급 구성

| 등급 | 월 납입금 | 연간 혜택 가치 | 특화 대상 |
|:---:|:---:|:---:|:---|
| **VIP** | 160,000원 | 304만원+ | 모든 의료·생활 케어 통합 |
| **Silver** | 100,000원 | 132만원+ | 수도권 기본 의료 완비 |
| **White** | 100,000원 | 147만원+ | 지방 실속 생활 케어 |
| **Gold** | 70,000원 | 110만원+ | 유기견·성견 질병 케어 특화 |

### 혜택 카테고리

- 🩺 **의료 혜택** — 기초 건강검진, 항체가 검사, 필수 예방접종, 중성화 수술, 심장사상충 예방, 질병/상해 의료비 지원, 종합 건강검진(2년차), 종합백신·광견병 주사(2년차), 동물등록 내장형칩
- 🛍️ **생활 혜택** — 유기농 사료+패드+간식 배송(또는 사료 3개월 지원), 주오몰 할인
- 🐾 **케어 서비스** — 방문 훈련, 위생·목욕 서비스, 호텔링

---

## ⚙️ 기술 스택

| 분류 | 기술 |
|---|---|
| 마크업 | HTML5 (Semantic) |
| 스타일 | Vanilla CSS (CSS Custom Properties) |
| 스크립트 | Vanilla JavaScript (ES6+) |
| 아이콘 | [Lucide Icons](https://lucide.dev/) (CDN) |
| 폰트 | Pretendard, Noto Sans KR, Oswald (Google Fonts) |

> 별도의 빌드 툴이나 프레임워크 없이 정적 HTML 파일로 동작합니다.

---

## 🚀 실행 방법

빌드 과정이 없으므로 `index.html`을 브라우저에서 바로 열거나, 로컬 서버로 서빙합니다.

```bash
# Python 간이 서버 예시
python -m http.server 8080

# VS Code Live Server 확장 사용 시
# index.html 우클릭 → "Open with Live Server"
```

---

## 📝 데이터 수정 가이드

### 멤버십 혜택 / 가격 변경

모든 멤버십 데이터는 `js/adoption-counseling.js` 상단의 `PLAN_CATALOG` 객체에서 관리합니다.

```js
const PLAN_CATALOG = {
    vip: {
        price: '160,000원',   // 월 납입금
        value: '304만원+',    // 연간 혜택 가치
        features: [
            {
                category: '의료 혜택',
                icon: 'stethoscope',
                items: ['기초 건강검진', '항체가 검사', ...]
            },
            ...
        ]
    },
    gold: { ... },
    silver: { ... },
    white: { ... }
};
```

> **주의:** `PLAN_CATALOG` 수정 후 `index.html` 내 **비교표(fullscreen-compare-modal)** 도 동일하게 업데이트해야 합니다.

### 비교표 수정

`index.html` 내 `id="compare-table"` `<tbody>` 안의 행을 직접 수정합니다.  
열 순서는 **White → Silver → VIP → Gold** 입니다.

### 등급 상세 페이지 수정

각 `membership_[등급]_detail.html` 파일을 직접 편집합니다.  
`<section class="benefit-section">` 블록이 각 주요 혜택 섹션에 해당합니다.

---

## 💡 특별 안내 팝업

`index.html` 하단의 `id="info-modal"` 영역에서 **특별 혜택 안내 팝업** 문구를 수정할 수 있습니다.

- **평생 동결 혜택:** 가입 시점 납입금 평생 유지
- **방문 훈련 불가 지역 맞춤 케어:** 1:1 유선 및 화상 훈련으로 대체 제공

---

## 📌 업데이트 이력

| 날짜 | 내용 |
|---|---|
| 2026-03-30 | Gold 멤버십 혜택 개편 (사료 3개월 지원, 종합검진 2년차 전환) |
| 2026-03-30 | 비교표 카테고리 재구성 (의료 / 생활 / 케어 서비스) |
| 2026-03-30 | 대시보드 혜택 카테고리 그룹핑 UI 적용 |
