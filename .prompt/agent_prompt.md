# Work Instruction Prompt

Assume that the `.prd/` folder already contains Task-specific PRD files. Now the AI should perform **feature-based
commits** based on those PRD files.

- For each feature (e.g., 회원가입, 로그인), create a separate branch.
- When a related PRD is attached, perform only that task.
- Within the same feature branch, commit each Task in sequence.
- Commit messages must start with the TASK tag and a brief summary (in Korean), followed by bullet points (using “-”)
  describing what was done (in Korean). Do not list file names.
- After applying each Task’s changes, run pnpm build (or npm run build), resolve all ESLint or compilation errors, and
  only commit once the build passes.
-

---

## Requirements

1. **Branch Naming**

    - For the “회원가입” feature:
      ```bash
      git checkout -b feature/signup
      ```
    - For the “로그인” feature:
      ```bash
      git checkout -b feature/login
      ```

2. **Commit Message Format**

```
[TASK-<번호>] <간단 요약>
- <첫 번째 작업 설명>
- <두 번째 작업 설명>
```

- **예시:**
  ```
  [TASK-1] 사용자 엔티티 및 마이그레이션 추가
  - User.ts 모델 파일 생성
  - 사용자 테이블 마이그레이션 파일 추가
  - Task-1 PRD 문서 업데이트
  ```

3. **Commit Sequence**
1. 메인 브랜치(main 또는 develop)에서 기능 브랜치 생성:
   ```bash
   git checkout -b feature/signup
   ```
1. Task-1 변경 사항(코드 파일 및 PRD 파일) 스테이지 후 커밋:
   ```bash
   git add backend/src/models/User.ts
   git add backend/src/migrations/20250606-create-user.ts
   git add .prd/TASK-1-회원가입-BE.md
   git commit -m "[TASK-1] 사용자 엔티티 및 마이그레이션 추가
   - User.ts 모델 파일 생성
   - 사용자 테이블 마이그레이션 파일 추가
   - Task-1 PRD 문서 업데이트"
   ```
1. Task-2 변경 사항 스테이지 후 커밋:

   ```bash
   git add src/components/Signup.tsx
   git add src/store/user.ts
   git add .prd/TASK-2-회원가입-FE.md
   git commit -m "[TASK-2] 회원가입 폼 및 Redux 슬라이스 구현
   - Signup.tsx 폼 컴포넌트 작성
   - Redux Toolkit user 슬라이스 생성
   - Task-2 PRD 문서 업데이트"
   ```

1. **Push to Remote**

```bash
git push origin feature/signup
git push origin feature/login
```
