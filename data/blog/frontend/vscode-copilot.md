---
title: VSCode Copilot chat 활용
date: '2025-06-17'
tags: ['copilot', 'vscode']
draft: false
summary: 'VSCode 의 Manage context for AI 문서를 통해 Copilot 에 질의를 할 때 좀 더 적절한 컨텍스트를 제공하기 위한 도구들을 알아본다.'
---

VSCode 의 [Manage context for AI](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context) 문서를 통해 Copilot 에 질의를 할 때 좀 더 적절한 컨텍스트를 제공하기 위한 도구들을 알아본다. <br/>
또한 VScode 의 [여러 chat mode](https://code.visualstudio.com/docs/copilot/chat/chat-modes#_builtin-chat-modes) 를 각각 언제 활용하면 좋을지 알아본다.

## Chat modes

### Ask mode

[Ask mode](https://code.visualstudio.com/docs/copilot/chat/chat-ask-mode) 는 codebase, coding, 일반 기술 개념에 대한 설명에 최적화 되어 있다. <br />
예를 들어 다음과 같은 요청을 할 수 있다.

- codebase 에서 데이터베이스 연결 문자열이 정의된 위치는 어디입니까?
- 정렬 함수에 대해 설명해줘
- 내 애플리케이션의 성능을 개선하려면 어떻게 해야 합니까?
- 검색 기능을 구현하는 3가지 다른 방법을 알려줘

또한 Ask mode 의 응답에는 codebase 에 적용할 수 있는 코드 블록이 포함될 수 있다. 이 방법은 단일 파일 내의 소규모 편집에 적합하다. <br />
만약 여러 파일에서 더 큰 변경을 수행하거나 더 복잡한 코딩 작업이 필요하다면 Edit mode 또는 Agent mode 를 활용할 수 있다.

### Edit mode

[Edit mode](https://code.visualstudio.com/docs/copilot/chat/copilot-edits) 는 프로젝트의 여러 파일에서 코드를 편집하는데 최적화 되어 있다. <br />
변경하려는 내용과 편집하려는 파일을 잘 알고 있는 경우 코딩 작업에 특히 유용하다. 잘 정의되지 않은 작업, 높은 수준의 요구사항 또는 터미널 명령 및 도구를 실행해야 하는 변경 사항이 있는 경우 Agent mode 를 대신 사용할 수 있다. <br />
예를 들어 다음과 같은 요청을 할 수 있다.

- input 입력이 비어 있을 때 정렬 기능이 실패하므로 수정해줘
- Vitest를 사용하여 계산기 클래스에 대한 Unit 테스트를 추가해줘
- calculate 함수를 최적화하여 성능을 개선해줘
- xx 를 async/await를 사용하여 리팩토링해줘

### Agent mode

[Agent mode](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode) 는 프로젝트의 여러 파일을 자율적으로 편집하는데 최적화 되어 있다. <br />
코드 편집 뿐만 아니라 도구 및 터미널 명령 호출이 필요한 복잡한 작업에 특히 유용하다. <br />
예를 들어 다음과 같은 요청을 할 수 있다.

- Redis 캐시를 사용하도록 앱 리팩토링 해줘
- 인증을 위해 OAuth를 사용하여 앱에 로그인 form 을 추가해줘
- 코드베이스를 React 에서 Vue.js 로 마이그레이션 해줘
- "Swift 프론트엔드와 Node.js 백엔드를 사용하여 식사 계획 웹 앱 만들기" 를 위한 구현 계획을 만들어줘.

Agent mode 는 요청을 수행하기 위해 관련 컨텍스트와 작업을 자율적으로 결정한다. 또한 구문오류, 테스트 실패와 같은 중간 문제를 해결하기 위해 수행을 여러번 반복할 수 있다.

## Manage Context

### Implicit context

VSCode 는 자동으로 현재 활동을 기반으로 채팅 프롬프트에 컨텍스트를 제공한다. <br />
현재 editor의 active 된 filename 이 자동으로 프롬프트에 선택된다. <br />
참고 : https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_implicit-context

### #-mentions

#-mentions 를 통해 명시적으로 컨텍스트를 참조할 수 있다.

Copilot 을 통해 좋은 결과를 얻으려면 GitHub › Copilot › Chat › Codesearch 를 enable 한다.

- [Add files as context](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_add-files-as-context) 을 참고하여 codebase 내의 file, folder 를 멘션할 수 있다.

  - ex) "Add a login button and style it based on #styles.css"

- **\#fetch** 를 멘션하여 특정 web page 를 fetch 해서 해당 내용을 기반으로 요청을 할 수 있다.

  - ex) "How do I use the 'useState' hook in react 18? #fetch https://18.react.dev/reference/react/useState#usage"

- **\#githubRepo** 를 멘션하여 해당 github repo 내에서 검색을 할 수 있다.

  - ex) "Build an API endpoint to fetch address info, use the template from #githubRepo contoso/api-templates"

- **\#changes** 를 멘션하여 source control 에서 diff 를 선택할 수 있다.

  - ex) "Summarize the #changes"

- **\#codebase** 를 멘션하여 현재 workspace 에 대한 검색을 수행할 수 있다.

  - ex) "Where is the database connecting string configured? #codebase"
  - ex) "Create an about page and include it in the nav bar #codebase"

- **\#problems** 를 멘션하여 현재 workspace 에 대한 problem 목록을 가져온다.

  - ex) "Fix the issues in #problems"

- **\#testFailure** 를 멘션하여 테스트 실패 목록을 가져온다.

  - ex) "Fix the failing tests #testFailure"

- **\#extensions** 를 멘션하여 VS Code extension 에서 검색한다.

  - ex) "What are the top #extensions for this workspace?"

- **\#selection** 을 멘션하여 editor 에서 선택된 text 를 가져온다.

- **\#searchResults** 을 멘션하여 search view 에서 검색 결과를 가져온다.

- **\#terminalLastCommand** 을 멘션하여 last run terminal command 와 해당 커맨드의 상태를 가져온다.

더 다양한 예시는 [Prompt examples](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_prompt-examples) 를 참고한다.

### @-metions

Ask 모드에서 [@-metions](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_atmentions) 를 통하여 요청할 수 있다.

- "@vscode how to enable word wrapping"
- "@terminal what are the top 5 largest files in the current directory"

---

### 참조

- https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context

- https://code.visualstudio.com/docs/copilot/chat/chat-modes
