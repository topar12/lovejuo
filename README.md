# 주오 입양 상담 위저드

반려동물 입양 고객에게 최적의 멤버십 플랜을 추천해주는 인터랙티브 상담 위저드입니다.

## 주요 기능

- **2단계 질문 위저드**: 거주 지역(수도권/지방) → 케어 유형(프리미엄 풀케어/성견용 케어) 선택
- **맞춤 플랜 추천 대시보드**: 조건에 맞는 멤버십 플랜 추천 및 전체 플랜 비교
- **플랜 비교표**: White / Silver / VIP / Gold 플랜 상세 비교
- **태블릿 가로화면 최적화**: 스크롤 없이 한 화면에 대시보드 전체 표시

## 멤버십 플랜

| 플랜 | 월 납입금 | 특징 |
|------|----------|------|
| VIP | 160,000원 | 프리미엄 풀케어, 수도권 추천 |
| Silver | 100,000원 | 의료 특화 케어 |
| White | 100,000원 | 생활 케어 특화, 지방 추천 |
| Gold | 70,000원 | 질병·상해 의료비 특화 |

## 파일 구조

```
├── index.html                  # 메인 상담 위저드
├── membership-compare.html     # 플랜 비교표
├── membership_vip_detail.html  # VIP 플랜 상세
├── membership_silver_detail.html
├── membership_white_detail.html
├── membership_gold_detail.html
├── css/
│   ├── adoption-counseling.css # 위저드 스타일
│   └── membership_*.css        # 각 플랜 상세 스타일
├── js/
│   └── adoption-counseling.js  # 위저드 로직
└── assets/                     # 이미지 리소스
```

## 실행 방법

별도 빌드 없이 `index.html`을 브라우저에서 바로 열면 됩니다.
