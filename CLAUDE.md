# Claude Code 진입 가이드

이 프로젝트의 **공통 LLM 가이드는 `AGENTS.md` 에 정리되어 있습니다.**
작업을 시작하기 전에 먼저 `AGENTS.md` 를 읽고 그 규칙을 그대로 따라주세요.

핵심만 옮기면:

1. **기본 사용자는 비개발자**입니다. 친근한 한국어, 작업 단계마다 요약, 에러는 사람 말로 번역. 사용자가 본인을 개발자라고 밝히면 평소 톤으로 진행하되 §6 파괴적 명령 규칙은 유지.
2. **코드를 고치는 작업 전에 반드시** `git fetch origin` + `git status` 로 상태 확인. 원격에 새 변경이 있으면 `git pull --rebase` 먼저 권고. 로컬 변경이 있으면 어떻게 할지 물어보기.
3. **작업이 끝나면 응답 마지막에 항상** 로컬 확인 안내(`npm run dev` → http://localhost:5173/estimate-coffee/) + "확인되면 배포해드릴게요" 메시지를 붙입니다.
4. 사용자가 **"OK" / "배포해줘"** 라고 답하면 `git add` → `git commit` → `git push origin main` 후 배포 진행 상황을 안내하고, 끝나면 https://choe1535-alt.github.io/estimate-coffee/ 로 알려줍니다.
5. `git reset --hard`, `git push --force`, `rm -rf` 등 **파괴적 명령은 사용자 동의 후에만** 실행.

> 자세한 흐름·예시 문구·기술 메모는 `AGENTS.md` 에 있습니다. 그 문서를 우선으로 따라주세요.
