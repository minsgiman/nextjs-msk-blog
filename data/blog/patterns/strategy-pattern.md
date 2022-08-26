---
title: strategy pattern
date: '2019-05-27'
tags: ['pattern', 'javascript']
draft: false
summary: 'javascript로 구현한 strategy pattern'
---

#### javascript로 구현한 strategy pattern

```javascript
class AuthStrategy {
  auth() {
    throw new Error('auth() must be implement');
  }
}

class Auth0 extends AuthStrategy {
  auth() {
    console.log('Authenticating using Auth0 Strategy');
  }
}

class Basic extends AuthStrategy {
  auth() {
    console.log('Authenticating using Basic Strategy');
  }
}

class OpenID extends AuthStrategy {
  auth() {
    console.log('Authenticating using OpenID Strategy');
  }
}

class AuthProgram {
  constructor(authStrategy) {
    this._authStrategy = authStrategy;
  }

  authenticate() {
    if (!this._authStrategy) {
      console.log('No Authentication Strategy set.');
      return;
    }
    this._authStrategy.auth();
  }
}

const authProgram = new AuthProgram(new Basic());
authProgram.authenticate();
```
