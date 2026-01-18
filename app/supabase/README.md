# Supabase 설정

## 폴더 구조

```
supabase/
├── migrations/
│   ├── 00000000_initial_schema.sql          # 초기 스키마 (신규 설치용)
│   └── 20260118_fix_rls_infinite_recursion.sql  # RLS 수정 (기존 DB 업그레이드용)
└── README.md
```

## 신규 설치 (처음 설정하는 경우)

Supabase SQL Editor에서 실행:
```
migrations/00000000_initial_schema.sql
```

이 파일 하나로 전체 스키마가 설정됩니다.

## 기존 DB 업그레이드 (이미 구버전 스키마가 있는 경우)

RLS 무한재귀 문제 수정:
```
migrations/20260118_fix_rls_infinite_recursion.sql
```

## 마이그레이션 목록

| 순서 | 파일명 | 설명 | 용도 |
|------|--------|------|------|
| 0 | `00000000_initial_schema.sql` | 초기 스키마 전체 | 신규 설치 |
| 1 | `20260118_fix_rls_infinite_recursion.sql` | RLS 무한재귀 해결 | 기존 DB 업그레이드 |

## 실행 방법

1. Supabase Dashboard → SQL Editor
2. 해당 마이그레이션 파일 내용 복사
3. 실행
4. 성공 확인

## 주의사항

- **신규 설치**: `00000000_initial_schema.sql`만 실행
- **기존 DB**: 필요한 마이그레이션만 순서대로 실행
- 프로덕션: 반드시 **백업 후** 실행
