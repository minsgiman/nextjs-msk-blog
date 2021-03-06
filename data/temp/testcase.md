---
title: 효율적인 테스트 케이스
date: '2020-05-30'
tags: ['test', 'frontend']
draft: false
summary: '내부 구현 & 인터페이스 테스트 | TC 개수 | 모듈의 변경과 의존성 테스트 | 현재, 미래를 위한 TC'
---

#### 내부 구현 & 인터페이스 테스트

모듈의 내부 구현이란 모듈의 외부 인터페이스 뒤에 숨겨진 캡슐화 된 것들을 말한다.

내부 구현에 대해 직접적으로 TC를 작성하는 것은 피해야 하고 오직 공개된 외부 인터페이스를 통해서만 테스트해야 한다.

반복되는 테스트를 자동화하기 위해 내부 구현에 대한 TC를 "임시로" 작성하는 것은 괜찮지만 결국 외부 인터페이스를 테스트하는 TC들만 남겨야 한다.

TDD의 프로세스를 따라가다 보면 외부에 공개될 인터페이스인 줄 알았는데 결론적으로 내부 구현으로 옮겨지는 경우도 많다.

이러한 모듈에 변화에 따라 내부 구현을 직접적으로 테스트하는 TC들도 지워지거나 외부 인터페이스 테스트의 일부로 흡수되어야 한다.

#### TC 개수

TC개수는 적을수록 좋다. 최소의 TC로 최대의 효과를 낼수록 테스트의 가치는 더 뚜렷해진다.

너무 많은 TC는 프로젝트의 민첩성을 떨어트리고 오히려 프로젝트의 걸림돌이 될 수 있다.

그렇기 때문에 커버리지는 늘리면서 TC개수는 적게 유지할 수 있도록 모듈의 인터페이스를 통해 테스트 해야 한다.

#### 모듈의 변경과 의존성 테스트

App 안에서 각자의 책임을 지고 협업을 해나가는 모듈들은 일부 기능이 변경될 수도 있고 성능이 더 좋은 모듈로 교체될 수도 있다.

TC는 모듈의 기능이 일부 변경되거나 추가되었을 때 기존 시스템에서 해당 모듈이 책임져야 할 역할을 충실이 이행할 수 있는지를 보장해준다.

그리고 모듈의 내부 구조가 리팩토링 되어 변경되거나 혹은 아예 새로운 모듈로 다시 만들어졌을 때 Application이라는 거대한 시스템에서 모듈이 잘 맞물려 돌아갈 수 있는지에 대한 신뢰성을 보장해준다.

TC는 대상 모듈이 무엇이든 시스템에 맞물려 정상적으로 돌아갈 수 있는지만 확인해야 한다.

TC는 바뀔 수 있는 구체적인 모듈이 아닌 바뀌지 않을 모듈의 책임을 테스트해야 한다.

따라서 모듈의 내부구현이 계속 바뀌더라도 그 모듈에 의존성이 있는 애플리케이션의 다른 부분들은 수정하지 않아도 된다는 것을 인터페이스를 테스트 하는 TC를 통해 확인한다.

#### 현재, 미래를 위한 TC

현재를 위해 작성되는 TC는 개발하고 있는 코드의 테스트를 자동화한다.

그래서 인풋 값을 조절하며 결괏값을 확인할 때 소요되는 시간을 줄여 준다.

그 과정에서 내부 구현에(혹은 외부 인터페이스인 줄 알았던) 해당하는 메서드를 잠깐 테스트할 수도 있다.

그리고 TC가 쌓여감에 따라 이후에 작성된 코드가 사이드 이팩트로 이전 코드를 망치는 것을 예방해준다.

미래를 위한 TC는 대상 모듈의 기능이 변경되거나 추가될 때 변경된 내용이 기존 스펙에 충족하는지 자동으로 확인해주며 변경된 코드에 의해 발생할 수 있는 문제를 최소화 해주어야 한다.

TC를 작성하면서 소비한 시간에 대한 충분한 효율을 얻으려면 현재를 위해 TC를 작성하되 개발이 진행되면서 미래를 위한 TC들로 바뀌어야 한다.

즉, 개발을 진행하면서 필요 없는 TC들은 지우거나 더 나은 테스트로 개선되어야 한다.
