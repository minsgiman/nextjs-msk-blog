---
title: React Testing Library 로 React 컴포넌트 테스트하기
date: '2022-05-27'
tags: ['react', 'test']
draft: false
summary: 'Prefetch는 브라우저가 idle time에 미래에 사용될 리소스들을 미리 다운로드 받아서 캐시하여, 미래에 방문할 페이지의 로딩 속도를 빠르게 해주는 기능이다.'
---

[React Testing Library](https://testing-library.com/docs/react-testing-library/intro)는 React 컴포넌트를 테스트하기 위해 설계된 라이브러리다. <br />
먼저 RTL은 기존 테스팅 도구와 어떤점이 다른지 알아보았다.

#### RTL vs Enzyme

> So rather than dealing with instances of rendered React components, your tests will work with actual DOM nodes.

공식 문서는 RTL이 DOM Testing library 임을 강조하고 있다. <br />
React component 인스턴스가 아니라, 테스트가 실제 브라우저에 그려진 DOM nodes 를 이용해 이루어진다. <br />
따라서 RTL 라이브러리는 실제 유저의 행동과 동일하게 DOM 을 찾아다니며 의도대로 그려졌는 지를 확인한다.

Enzyme 이 React component 관점에서 잘 실행이 되었는 지를 테스트하는 툴이라면, RTL 은 엔드유저 입장에서 개발자의 의도대로 화면이 보이는 지를 테스트 하는 툴이다.

RTL은 테스트가 사용자가 앱과 상호작용하는 방식과 유사해야 한다는 기본적인 라이브러리의 철학을 가지고 있다. <br />
그래서 올바른 props나 state가 컴포넌트에서 변경되었는지 테스트하는 대신 RTL는 사용자가 보고 수행하는 작업을 테스트하도록 설계되었다. <br />
테스트 환경이 사용자가 애플리케이션을 사용하는 환경과 비슷할수록 테스트를 더욱 신뢰할 수 있다.

#### 설치

테스트를 위해서 다음 github을 참고하여 설치한다.

- [testing-library/react](https://github.com/testing-library/react-testing-library)
- [testing-library/user-event](https://github.com/testing-library/user-event)
- [testing-library/jest-dom](https://github.com/testing-library/jest-dom#table-of-contents)

#### 선언적 테스트 작성

```ts
function renderComplexInput(
  props?: Partial<Omit<ComplexInputProps, 'onClickName' | 'onClickContact'>>
) {
  const onNameClick = jest.fn()
  const onClickContact = jest.fn()

  render(<ComplexInput onReceiverClick={onNameClick} onClickContact={onClickContact} {...props} />)

  const contactButton = () => screen.queryByTestId('button-contact')
  const inputTitle = () => screen.getByTestId('span-title')
  const inputKeywordSearch = () => screen.getByTestId('input-keyword-search')
  const emptyResultBox = () => screen.queryByTestId('div-empty-result-box')

  function clickContactButton() {
    userEvent.click(contactButton() as HTMLElement)
  }

  function typeSearchKeyword(keyword: string) {
    userEvent.type(inputKeywordSearch(), keyword)
  }

  return {
    contactButton,
    inputTitle,
    inputKeywordSearch,
    emptyResultBox,
    clickContactButton,
    typeSearchKeyword,
    onNameClick,
    onClickContact,
  }
}

it('IOS에서는 contact 버튼이 보여지지 않아야 한다.', () => {
  mockUserAgent(true) // ios user agent mock
  const { contactButton } = renderComplexInput()

  expect(contactButton()).not.toBeInTheDocument()
})

it('AOS에서는 contact 버튼이 보여지고 클릭이 동작한다.', () => {
  mockUserAgent(false) // aos user agent mock
  const { contactButton, clickContactButton, onClickContact } = renderComplexInput()

  expect(contactButton()).toBeInTheDocument()

  clickContactButton()
  expect(onClickContact).toHaveBeenCalled()
})

it(`검색결과가 없으면 검색결과없음 문구가 보여져야 한다.`, () => {
  const { typeSearchKeyword, emptyResultBox } = renderComplexInput()

  typeSearchKeyword('xxxxx')
  expect(emptyResultBox()).toBeInTheDocument()
})
```

renderComplexInput 에서 구현한 선언적 프로그래밍을 통해 함수명을 읽기만 해도 어떤 테스트를 하는지 즉시 파악할 수 있다. <br />
또한 renderComplexInput 에서 내보낸 테스트 헬퍼를 다른 테스트 케이스에서 재사용할 수 있다.

참고로 위의 코드에서 render, userEvent는 내부적으로 이미 act로 wrapping 되어있기 때문에 DOM반영을 기다리기 위해서 act로 다시 wrapping할 필요는 없다. <br />
RTL 사용관련하여 [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) 를 읽어보면 좋다.

---

### 참고

- [React Testing Library를 이용한 선언적이고 확장 가능한 테스트](https://ui.toast.com/weekly-pick/ko_20210630)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [When should I use act() in react-testing-library?](https://flyingsquirrel.medium.com/when-should-i-use-act-in-react-testing-library-d7dd22a3340e)
