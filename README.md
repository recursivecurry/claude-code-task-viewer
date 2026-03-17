# Claude Code Tasks Dashboard

Claude Code가 내부적으로 생성하는 Task 데이터를 시각적으로 조회할 수 있는 웹 대시보드입니다. `~/.claude/tasks`와 `~/.claude/projects` 디렉토리의 데이터를 읽어 세션 목록, 태스크 테이블, 의존성 그래프를 제공합니다.

## 주요 기능

### 세션 사이드바
- Claude Code 세션 목록을 프로젝트명, git 브랜치, 요약 정보와 함께 표시
- 프로젝트명 / 생성일 / 수정일 기준 정렬
- 세션별 태스크 상태 카운트 (pending, in_progress, completed) 표시
- 세션 상세 정보 팝업 (클릭하여 값 복사 가능)

### 태스크 테이블
- 워크스페이스별 태스크 목록을 테이블 형태로 조회
- 상태별 필터링 (All / Pending / In Progress / Completed)
- 컬럼 헤더 클릭으로 정렬

### 의존성 그래프
- 태스크 간 블로킹/의존 관계를 방향 그래프로 시각화
- 상태별 색상 구분 (노랑: pending, 파랑: in_progress, 초록: completed)
- 줌, 패닝, 미니맵 지원
- 테이블과 그래프 간 선택 동기화

### 기타
- 다크 모드 / 라이트 모드 전환
- 좌우 분할 뷰 (테이블 + 그래프) 리사이즈 가능

## 기술 스택

- **Next.js 16** / **React 19**
- **TanStack Table** - 태스크 테이블
- **React Flow** (@xyflow/react) + **dagre** - 의존성 그래프 레이아웃
- **Tailwind CSS 4**

## 설치 방법

### 사전 요구사항

- Node.js 18 이상
- Claude Code가 설치되어 있고, 태스크 데이터가 `~/.claude/tasks`에 존재해야 합니다.

### 설치

```bash
git clone https://github.com/recursivecurry/claude-code-task-viewer.git
cd claude-code-task-viewer
npm install
```

## 사용법

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 사용 흐름

1. 좌측 사이드바에서 Claude Code 세션을 선택합니다.
2. 선택한 세션의 태스크가 좌측 테이블에 표시됩니다.
3. 우측에는 태스크 간 의존성 그래프가 자동으로 렌더링됩니다.
4. 테이블에서 태스크를 클릭하면 그래프에서도 해당 노드가 선택되고, 반대도 동일합니다.
5. 상단의 상태 필터를 사용하여 특정 상태의 태스크만 볼 수 있습니다.

## 라이선스

MIT License

Copyright (c) 2025 recursivecurry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
