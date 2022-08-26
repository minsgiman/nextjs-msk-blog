---
title: 변경에 유연한 selector 사용하기 (UI 테스트)
date: '2022-01-08'
tags: ['cypress', 'test', 'frontend']
draft: false
summary: '코드 리팩토링, DOM 엘리먼트 구조 변경등이 발생한다면, 작성해놓은 UI 테스트 결과에 영향을 미칠 수 있다.'
---

### 사용자가 사용하는 방식과 유사한 selector

코드 리팩토링, DOM 엘리먼트 구조 변경등이 발생한다면, 작성해놓은 UI 테스트 결과에 영향을 미칠 수 있다.

Testing Library의 [Guiding Principles](https://testing-library.com/docs/guiding-principles/) 다음 내용에 따르면, 사용자가 사용하는 방식과 유사하게 테스트 코드를 작성할수록 테스트 코드에 자신감을 준다고 한다.

> The more your tests resemble the way your software is used, the more confidence they can give you.

[Testing Library](https://testing-library.com/)에서는 사용자가 관심없는 className 을 통한 selector가 아닌, **사용자가 실제 요소를 찾는 방법처럼** [role](https://testing-library.com/docs/queries/byrole), [label](https://testing-library.com/docs/queries/bylabeltext), [placeholder](https://testing-library.com/docs/queries/byplaceholdertext), [text](https://testing-library.com/docs/queries/bytext), [display value](https://testing-library.com/docs/queries/bydisplayvalue), [alt text](https://testing-library.com/docs/queries/byalttext), [title](https://testing-library.com/docs/queries/bytitle), [test ID](https://testing-library.com/docs/queries/bytestid) 를 통해 찾는 방법을 제시한다.

selector로 className을 사용하는 방법을 지양하는 이유는 일반적으로 class는 스타일을 지정하기 위한 방법으로 사용되고, 여러개의 class중 어떤 것이 특정 엘리먼트를 나타내는지 파악하기 어렵기 때문에 테스트 코드와 소스 코드 간의 관계가 너무 암묵적이게 된다. 이러한 테스트 코드는 리팩토링과 같은 변경에 취약할 수 밖에 없다.

사용자가 사용하는 방식과 유사한 테스트 코드는 UI 변경에 유연하게 대응할 수 있고, 테스트 내용을 통해 프로젝트 내 비개발자 구성원들과 커뮤니케이션한다면 도움을 줄 것이다. <br />

### Cypress에서 Testing Library selector 사용하기

위의 selector들은 [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/) 을 참고하여 cypress 에서 사용 가능하다. <br />
[priority](https://testing-library.com/docs/queries/about/#priority)에서 제시한 우선순위에 따라 사용한다.

```js
cy.findByRole('dialog').click();
cy.findByRole('button', { name: /Jackie Chan/i }).click();

cy.findByLabelText('Label 1').click().type('Hello Input Labelled By Id');
cy.findAllByLabelText(/^Label \d$/).should('have.length', 2);
cy.findByPlaceholderText('Input 1').click().type('Hello Placeholder');
cy.findAllByPlaceholderText(/^Input \d$/).should('have.length', 2);
cy.findByText('Button Text 1').click().should('contain', 'Button Clicked');
cy.findByAltText('Image Alt Text 1').click();

cy.findByDisplayValue('Display Value 1').click().clear().type('Some new text');
```

위의 쿼리들로 요소를 선택하기 어렵다면, data-testid를 사용할 수 있다. <br />
data-testid를 통한 selector는 다음과 같이 사용한다.

```html
<input data-testid="middle-popup-input" />
```

```js
cy.findByTestId('middle-popup-input').focus().type(memo);
```

---

### 참조

- [Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)

- [Testing Library](https://testing-library.com/docs/)
