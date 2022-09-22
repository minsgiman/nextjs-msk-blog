---
title: Headless UI Library
date: '2022-09-22'
tags: ['frontend', 'headless', 'react']
draft: false
summary: 'Headless라는 개념은 스타일링을 담당하게 되는 부분을 과감하게 제외하고 상태와 관련된 부분만을 다루자고 이야기한다.'
---

### Headless

어떤 상태를 가지고 있는 컴포넌트는 이 상태를 제어하는 부분과 스타일을 제어하는 부분을 나눌 수 있다. <br />
Headless라는 개념은 스타일링을 담당하게 되는 부분을 과감하게 제외하고 상태와 관련된 부분만을 다루자고 이야기한다.

### 스타일 정의에 대한 역할 위임

독자적인 스타일을 가지고 있는 여러 서드파티(Third-party) 라이브러리를 스타일 재정의 없이 제품에 사용하는 순간 UI 디자인의 통일성과 제품의 완성도가 떨어지게 된다.

**스타일은 라이브러리를 사용하는 개발자에게 위임하고 Headless UI는 상태와 그 상태를 제어할 수 있는 인터페이스만 노출한다.** <br />
원하는 디자인 시스템을 가져다 쓰거나 직접 스타일을 구현하는 자유를 주는 것이다.

### 좋은 점

#### Separation of Concerns (관심사의 분리)

사용자 인터페이스를 스타일링하는 코드와 비즈니스 로직은 별도로 관리되어야 한다. <br />
UI에는 수많은 경우가 존재하고 이는 변경에 그만큼 취약하다고 볼 수 있다. 이에 반해 데이터를 다루는 로직은 상대적으로 변경 가능성이 낮다.

(무지성으로) 변경에 대응하다 보면 좋지 않은 코드가 자연스럽게 생산된다. 이러한 이유로 변경 가능성이 높은 코드와 변경 가능성이 낮은 코드를 분리해둬야 한다. <br />
관심사를 분리하는 것이 결국 변경 가능성에 따른 분리가 되었고 스타일링을 담당하는 코드와 상태를 다루는 코드를 분리하는 것이 좋은 코드의 출발점이 될 수 있다.

#### Maintenance (유지보수 용이성)

스타일을 담당하는 코드가 함께 추상화되었다면 이 스타일을 재정의하기 위한 여러 인터페이스를 열어둬야 한다. <br />
(수많은 Props와 함께) 컴포넌트에게 Props는 외부에 노출되는 인터페이스를 의미하며 이 인터페이스는 가장 중요한 관리의 대상이 된다. <br />
외부로 노출되는 인터페이스 중 하나가 그 역할이 달라지거나 수정되는 순간 바로 Breacking Change를 발생시키기 때문이다.

라이브러리 또는 저수준 모듈에서의 Breaking Change는 프로덕션 레벨 코드의 ‘변경’을 의미한다. 변경은 버그가 발생할 가능성을 높인다.

즉, **변경에 취약한 UI를 고려하여 외부로 공개되는 인터페이스가 많아질수록 추상화된 코드는 관리가 어려워지기 때문에 각각 관리함으로써 보다 코드를 잘 관리할 수 있게 되는 것이다.**

### 구현

Tailwind Labs에서 개발한 [Headless UI](https://headlessui.com/) 라이브러리를 사용해볼 수 있다. <br />
기능은 있지만 스타일이 없는 Headless UI Component 를 제공한다. <br />
구현 예제는 다음 레포를 참고한다. <br />
https://github.com/minsgiman/YT-HeadlessUI-React-Tutorials

---

### 참조

- [Headless UI Library란?](https://jbee.io/react/headless-concept/)

- [Headless UI](https://headlessui.com/)

- [Building a command palette with Tailwind CSS, React, and Headless UI](https://www.youtube.com/watch?v=-jix4KyxLuQ&t=1s)
