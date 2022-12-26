---
title: Slack Bot 개발기 (with hubot)
date: '2022-12-26'
tags: ['nodejs', 'hubot', 'slack', 'team']
draft: false
summary: '서로에게 칭찬하는 문화를 만들기 위해 Hey! Taco와 같은 역할을 하는 Slack Bot을 개발하게 되었다.'
---

서로에게 칭찬하는 문화를 만들기 위해 [Hey! Taco](https://heytaco.com/)와 같은 역할을 하는 Slack Bot을 개발하게 되었다. <br />

GitHub : https://github.com/minsgiman/hubot-cookie

### Hubot 만들기

Slack채널에서 발생하는 이벤트를 listen하기 위해서는 Slack채널에 Bot을 설치해야 한다. <br />
그 중에 [Hubot](https://hubot.github.com/docs/)을 통해 개발하였다.

Hubot을 만드는 방법은 다음과 같다.

1. https://line-enterprise.slack.com/apps/A0F7XDU93-hubot 에서 Add to Slack을 누르고, Hubot 이름을 설정한다.

<img src="/static/images/hubot-create.png" width="400" />

2. 발급받은 Hubot의 토큰과 이름을 확인한다.

<img src="/static/images/hubot-token.png" width="400" />

3. Slack채널에서 Integrations - Add apps 를 눌러서 위에서 만든 Hubot이름을 확인하여 채널에 설치한다.

<img src="/static/images/hubot-channel.png" width="400" />

<br />

### Hubot 실행

#### 설치 & 실행

Hubot 설치 & 실행은 https://slack.dev/hubot-slack/ 를 참고한다.

먼저 yo, generator-hubot 으로 기본 세팅을 할 수 있다.

```
npm install -g yo generator-hubot

mkdir my-awesome-hubot && cd my-awesome-hubot
yo hubot --adapter=slack
```

그리고 다음과 같이 hubot을 실행한다.

```
HUBOT_SLACK_TOKEN=... ./bin/hubot --adapter slack
```

다른 Hubot 실행 옵션들은 다음 문서를 통해 확인할 수 있다. <br />
https://slack.dev/hubot-slack/advanced_usage

#### Scripts

Scripts는 https://hubot.github.com/docs/scripting 를 참고한다.

다음과 같이 package-root/scripts 내부의 coffee 파일과 js 파일이 자동으로 실행되며 robot이 주입된다.

```js
module.exports = (robot) ->
  # your code here
```

<br />

### Slack event Listen

Hubot 실행시 script로 주입된 [robot을 통해 이벤트를 listen](https://slack.dev/hubot-slack/basic_usage#listening-for-a-message) 한다. <br />

```ts
this.robot.hear(/(.*):cookie:(.*)/i, (res) => {
  this.sendMessageToWorker(res.message, MSG_TYPE.COOKIE_MESSAGE);
});

this.robot.hearReaction(async (res) => {
  if (res.message.type === 'added' && res.message.reaction === 'cookie') {
    this.sendMessageToWorker(res.message, MSG_TYPE.COOKIE_REACTION);
  }
});
```

Slack 이벤트 listen은 Hubot 내부적으로 [WebSocket 기반의 RTM Client](https://slack.dev/python-slack-sdk/real_time_messaging.html)를 통해서 가능하다.

> The Real Time Messaging (RTM) API is a WebSocket-based API that allows you to receive events from Slack in real time and send messages as users.

<br />

### Slack API 호출

[Slack Web API](https://slack.dev/hubot-slack/basic_usage#using-the-slack-web-api)를 호출하여 여러가지 정보들을 조회하거나 슬랙 메시지를 보낼 수도 있다. <br />
다음의 API들을 사용하였다.

- [users.info](https://api.slack.com/methods/users.info) : 유저의 정보를 얻어올 수 있는 API, 기본적인 프로필 정보를 얻어올 수 있음 (display name 등)
- [conversations.history](https://api.slack.com/methods/conversations.history) : 대화 히스토리 정보를 조회한다.
- [chat.getPermalink](https://api.slack.com/methods/chat.getPermalink) : 메시지 링크를 얻는다.
- [conversations.replies](https://api.slack.com/methods/conversations.replies) : 메시지를 blocks형태로 조회해서 reach text정보를 얻을 수 있다.
- [chat.postMessage](https://api.slack.com/methods/chat.postMessage) : 메시지를 전송할 수 있는 API

<br />

### Scale up

같은 토큰을 사용하는 Hubot을 여러 개 띄우게 되면 모든 Hubot으로 발생한 슬랙 이벤트가 전송되기 때문에, Hubot은 하나밖에 띄울 수 없다. <br />
Hubot을 하나 띄우는 대신, Hubot 프로세스(아래에서 Master)가 직접 메시지를 처리하지 않고 Worker 프로세스들에게 메시지 처리를 맡기도록 하여 Scale up이 가능한 구조를 만들었다.

<img src="/static/images/hey-cookie-scale-up.png" />

- Master Process
  - Hubot 을 가지고 있음
  - Hubot rtm client를 통하여 slack event listen하여 worker로 전달
  - pm2로 master, worker process 생성
- Worker Process
  - master로부터 받은 slack event message 처리 담당
  - mongodb에 데이터 저장
- Logger Process
  - 파일에 로깅 (logs/yyyy-mm-dd.log)

### 그 밖에..

슬랙 메시지로 멘션과 함께 :cookie: 이모지를 붙이면 Bot이 Cookie 선물 메시지를 전송한다. <br />
그 와 동시에 전달한 cookie 기록은 MongoDB에 저장돤다. <br />
이 후에 이를 활용하여 Leaderboard 를 만들 수도 있고 활용 방안을 고민 중이다.

---

### 참조

- [hubot-slack](https://slack.dev/hubot-slack/)

- [Slack Web API](https://api.slack.com/web)

- [리멤버의 타코문화](https://blog.dramancompany.com/2021/12/%EB%A6%AC%EB%A9%A4%EB%B2%84%EC%9D%98-%ED%83%80%EC%BD%94-%EB%AC%B8%ED%99%94%EB%A5%BC-%EC%86%8C%EA%B0%9C%ED%95%A9%EB%8B%88%EB%8B%A4/)

- [리모트로 근무하는 미국 스타트업은 어떻게 팀의 유대감을 만들까?](https://jiyu0719.medium.com/%EB%A6%AC%EB%AA%A8%ED%8A%B8%EB%A1%9C-%EA%B7%BC%EB%AC%B4%ED%95%98%EB%8A%94-%EB%AF%B8%EA%B5%AD-%EC%8A%A4%ED%83%80%ED%8A%B8%EC%97%85%EC%9D%80-%EC%96%B4%EB%96%BB%EA%B2%8C-%ED%8C%80%EC%9D%98-%EC%9C%A0%EB%8C%80%EA%B0%90%EC%9D%84-%EB%A7%8C%EB%93%A4%EA%B9%8C-2%ED%8E%B8-show-and-tell-appreciation-c503f711223f)

- [github hubot-slack](https://github.com/slackapi/hubot-slack)
