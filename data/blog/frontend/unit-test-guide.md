---
title: FE Unit Test Guide
date: '2024-09-01'
tags: ['test', 'frontend', 'jest']
draft: false
summary: '언제, 어떤 부분을 테스트 해야 하나?'
---

# 언제, 어떤 부분을 테스트 해야 하나?

## 테스트 가성비가 높은 코드

* 외부 의존성이 높아서 테스트 작성시 mocking 해야 하는 모듈이 많을 수록 테스트 비용이 크다.
* 중요한 로직이면서 테스트 비용이 크다면?
  * 모듈의 **리팩토링을 통해 외부 의존성과 side effect 부분을 분리하여 테스트 비용을 낮추는 것이 이상적이다.**

#### Bad Case : 테스트 하려는 로직은 간단하지만 외부 의존성이 있어 mocking 비용이 필요하다. 

```typescript
export function saveTemplateToClipboard(node, mockData) {
  const _node = cloneDeep(node);
  const _mockData = cloneDeep(mockData);
  delete _node.id;
  delete _node.optional;
  delete _node.state;
 
  const templateData = {
    node: _node,
    mockData: _mockData,
  };
 
  if (!validate(templateData)) {
    throw new Error('data is not valid');
  }
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is not available');
  }
  navigator.clipboard.writeText(JSON.stringify(templateData));
}
 
/* Test */
it(`should save correct template`, function () {
  const spyWriteText = jest.spyOn(navigator.clipboard, 'writeText');
 
  saveDataToClipboard(node, mockData);
 
  expect(spyWriteText).toHaveBeenCalledWith(JSON.stringify({ node: { children: [] }, mockData: { list1: { items: [] } } }));
});  
```

#### Good Case : 리팩토링을 통해 외부 의존성, side effect 부분을 분리하여 테스트 비용을 낮춘다.

```typescript
export function getTemplateData(node, mockData) {
  const _node = cloneDeep(node);
  const _mockData = cloneDeep(mockData);
  delete _node.id;
  delete _node.optional;
  delete _node.state;
 
  const templateData = {
    node: _node,
    mockData: _mockData,
  };
 
  if (!validate(templateData)) {
    throw new Error('data is not valid');
  }
 
  return templateData;
}
 
export function writeClipboard(data) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is not available');
  }
  navigator.clipboard.writeText(JSON.stringify(data));
}  
 
/* Test */
it(`should get correct template`, function () {
  const templateData = getTemplateData(node, mockData);
 
  expect(templateData).toMatchObject({ node: { children: [] }, mockData: { list1: { items: [] } }});
});
```

## 테스트 가치가 높은 코드

* 알고리즘, 중요 로직이 있는 코드가 테스트 되어야 한다.
* 로직이 거의 없거나 뻔한 코드에는 테스트 가치가 별로 없기 때문에 작성자가 판단하여 테스트를 skip 해도 된다.
* 테스트 커버리지가 높다고 무조건 좋은 것은 아니다. **중요한 부분을 테스트 하는 것이 중요하다.**

#### Bad Case : 아래와 같은 코드는 동작이 뻔하고, 이슈가 발생할 가능성도 거의 없기 때문에 테스트 가치가 낮다.

```typescript
export function createNode(type, data) {
  const node = nodeMap[type];
 
  if (!node) {
    throw new Error('createNode - node type is not valid');
  }
  return new node(data);
}
```

#### Good Case : 작성하고 나서 한 눈에 로직 파악이 어렵거나 잘 돌아가는지 확인이 필요하다고 생각되면, 테스트 코드를 작성하는 것이 좋다.

```typescript
/**
 * parse to number format string (ex. 3000 -> 30,000.00)
 */
export function toNumberFormat(
  value: number | string,
  { precision, isOnlyFormat, type } = {} as { precision?: number; isOnlyFormat?: boolean; type?: IDecimalAdjustType }
) {
  const re = new RegExp(/(^[+-]?\d+)(\d{3})/, 'g');
 
  const number = isOnlyFormat ? toNumber(value) : toNumberString(value, precision, type);
 
  let numberString = ObjectUtility.isNullOrUndefined(number) ? '' : number.toString();
  while (re.test(numberString)) {
    numberString = numberString.replace(re, `$1,$2`);
  }
 
  return numberString;
}
 
/* Test */
it.each([
  { amount: '', expected: '0.00' },
  { amount: 1234, expected: '1,234.00' },
  { amount: 1234567.561, expected: '1,234,567.56' },
  { amount: 1234567.565, expected: '1,234,567.57' },
])(`should be return $expected, amount is $amount and default precision 2`, ({ amount, expected }) => {
  expect(toNumberFormat(amount)).toBe(expected);
});
```

## 도메인 로직

* 비즈니스에 중요한 결정을 내리는 부분을 포함하기 때문에 테스트가 필요하다.
* **도메인 로직 코드는 다른 코드들과 가급적 명확하게 분리하는 것이 좋으며,** 그래야 테스트 하기도 쉽다.
  * 그런 면에서 Saga, Reducer 로 명확하게 도메인 로직을 분리할 수 있는 Redux 의 장점이 있다.
    * 같은 flux 패턴을 사용하는 zustand 도 이 부분에서 장점이 있다.

## 서비스 or QA 하면서 디펙이 발생할 때

* 처음부터 모든 test case를 예측할 수는 없다. 운영하면서 디펙을 만나면 해당 부분에 대한 테스트를 강화하면서 테스트 코드가 확장되어 나간다.
  * 이런 경우 디펙을 고치기 전에 unit-test를 작성하고 디펙을 고치면 된다.
* **장애 발생시 회고가 중요하듯이, 버그 발생시 해당 부분에서 재발방지를 위해 테스트 코드를 강화하는 것은 중요하다.**

#### Good Case : buddhist year 표기시 2/29 가 3/1 로 보이는 윤년 이슈 대응을 위해 test case 강화

```typescript
/* Test */
it.each([
    { date: '2024-02-29T11:42:13.000+07:00', locale: SUPPORT_LOCALES.EN, expected: '29 Feb 24 1:42:13 PM' },
    { date: '2024-02-29T11:42:13.000+07:00', locale: SUPPORT_LOCALES.TH, expected: '29 ก.พ. 67 13:42:13' },
])(
      `[DATE_FORMAT_TYPES.TYPE9] should be return '$expected', when date is '$date' on '$locale'`,
      ({ date, locale, expected }) => {
        mockLanguage(locale);
        const result = format(date, DATE_FORMAT_TYPES.TYPE9);
        expect(result).toBe(expected);
      }
);
```

## 사용 가이드가 필요한 경우

* 원작자의 의도를 알려줘야 한다!

#### Good Case

```typescript
/* Test */
it('should filter, map, reduce process work', () => {
    const result = fx.run(
      [1, 2, 3, 4, 5],
      fx.filter((item: number) => item % 2),
      fx.map((item: number) => item * item),
      fx.take(2),
      fx.reduce((acc: number, item: number) => acc + item, 0)
    );
 
    expect(result).toBe(10);
});
```

<br /><br />

# 어떻게 테스트 해야 하나?

## 가독성 좋은 테스트 작성 방법

### 테스트 제목

* **should** 'ExpectedBehavior(예상되는 테스트 결과)', **when or for or if** 'StateUnderTest(테스트조건)'
  * **should** throw exception, **when** age is less than 18
  * **should** fail to withdraw money, **for** Invalid Account
  * **should** fail to admit, **if** mandatory fields are missing

### 테스트 내용

* 테스트 내용은 Given-When-Then 의 순서로 작성하고, 테스트 내용이 복잡해진다면 아래 예제처럼 Given, When, Then 을 주석과 함께 영역을 분리해주어도 좋다.
  * Given: 테스트에 필요한 준비물 생성 (변수, mocking 등)
  * When: 테스트 수행
  * Then: 테스트 결과 검증

```typescript
it('should display the contact list page, when clicking the contact icon on AOS device', async () => {
    // Given
    mockUserAgent(false);
    const { inputNumber, clickContactListButton, finGetContacts, onReceiverClick } = renderInputContactNumber();
    const inputValue = '0123456789';
 
    // When
    clickContactListButton();
    await enterNumberKeyPad(inputValue);
    footerButton().click();
 
    // Then
    expect(finGetContacts).toHaveBeenCalled();
    expect(inputNumber()).toHaveTextContent(inputValue);
    expect(onReceiverClick).toHaveBeenNthCalledWith(1, {
      type: TEST_RECEIVER_TYPE,
      id: inputValue,
      accountNumber: '',
      name: i18n.t('name.Desc'),
    });
});
```

## 세부구현 보다는 인터페이스를 테스트

* 테스트가 가치를 가지려면 변하기 쉬운 부분 (내부구현) 보다는 변하지 않는 부분 (인터페이스) 을 테스트 해야 한다.
* 모듈의 내부구현이 계속 바뀌더라도 그 모듈에 의존성이 있는 다른 부분들은 수정하지 않아도 된다는 것을 인터페이스 테스트를 통해 확인한다.

#### BAD Case : dayjs, dateFns 모듈은 유틸 내부에서 다른 라이브러리로 교체될 수도 있다.

```typescript
/* Test */
it.each([
  { locale: SUPPORT_LOCALES.EN },
  { locale: SUPPORT_LOCALES.TH },
])(
  `should be return format '$expected' with default options, when option is empty and system locale is '$locale'`,
  ({ locale, expected }) => {
    jest.spyOn(i18n, 'getLanguage').mockReturnValue(locale);
    const dayjsSpy = jest.spyOn(dayjs, 'format');
    const dateFnsSpy = jest.spyOn(date-fns, 'format');
     
    formatToString(timestamp);
    if (locale === SUPPORT_LOCALES.TH) {
      expect(dayjsSpy).toHaveBeenNthCalledWith(1, '2020-03-22T16:23:12.000Z', 'DD MMM BB h:mm A', 'th');
    } else {
      expect(dateFnsSpy).toHaveBeenNthCalledWith(1, '2020-03-22T16:23:12.000Z', 'dd MMM yy h:mm A', { lacale: 'en'});
    }
  }
);
```

#### Good Case : 유틸의 결과만 확인한다.

```typescript
/* Test */
it.each([
  { locale: SUPPORT_LOCALES.EN, expected: '23 Mar 20 9:23 PM' },
  { locale: SUPPORT_LOCALES.TH, expected: '23 มี.ค. 63 21:23' },
])(
  `should return format '$expected', when option is empty and system locale is '$locale'`,
  ({ locale, expected }) => {
    jest.spyOn(i18n, 'getLanguage').mockReturnValue(locale);
 
    const result = formatToString(timestamp);
    expect(result).toBe(expected);
  }
);
```

## Mocking시에는 테스트하는 모듈이 관심있는 부분만 Mocking

* 테스트 하려는 모듈에서 신경 안써도 되는 부분은 테스트 시나리오에서 가능하면 제외한다.

#### Bad Case : 테스트 하려는 goBack 유틸에서 관심없는 history 에 대해 Mocking 하고 있다.

```typescript
function goBack(options) {
  const {
    state: { prevPathname },
  } = parseLocation();
 
  const blockToGoBackRegExp = new RegExp(`^${SIGN_IN_ROUTE.INDEX}/${AuthType.PIN_AUTH_TYPE.AUTHEN}/?$`);
  const isMatchedBlockToGoBack = blockToGoBackRegExp.test(prevPathname);
 
  if (ObjectUtility.isEmptyString(prevPathname) || isPreviousIsBankMain() || isMatchedBlockToGoBack) {
    redirectToBankMain();
  } else {
    redirect(prevPathname);
  }
}
 
/* Test */
it(`should be redirect to main`, function () {
  const spyReplaceFn = jest.spyOn(history, 'replace');
  const spyGoBackFn = jest.spyOn(history, 'goBack');
 
  mockWindowLocation({
    pathname: '/card',
  });
 
  goBack();
 
  expect(history.action).toBe('REPLACE');
  expect(history.location.pathname).toBe('/');
  expect(spyReplaceFn).toHaveBeenCalledTimes(1);
  expect(spyGoBackFn).toHaveBeenCalledTimes(0);
});
```

#### Good Case : 테스트 하려는 goBack 유틸에서 관심있는 redirectToBankMain, redirect 유틸 함수만 Mocking 하고 있다.

```typescript
/* Test */  
it(`should be redirect to main`, function () {
  const spyRedirectToBankMain = jest.spyOn(historyUtil, 'redirectToBankMain');
  const spyRedirect = jest.spyOn(historyUtil, 'redirect');
 
  mockWindowLocation({
    pathname: '/card',
  });
 
  goBack();
 
  expect(spyRedirectToBankMain).toHaveBeenCalledTimes(1);
  expect(spyRedirect).toHaveBeenCalledTimes(0);
});
```

## 변경에 유연한 selector 사용

React component 또는 Cypress 테스트를 할 때 참고한다. : [변경에 유연한 selector 사용하기](/blog/frontend/uitest-resilient-selector)


## 테스트 가이드

* test 파일은 대상 모듈 파일과 같은 디렉토리에 둔다.
* component 쪽에 비즈니스 로직이 포함되어 있다면, 가능하다면 hook으로 분리해서 테스트하는 것이 좋다.
  * 테스트는 각각 독립적이고, 명확하게 한 가지 기능이나 시스템의 행위를 테스트하는 것이 이상적이다.

* [react component unit test](/blog/react/react-component-test)

* [react hooks unit test](/blog/react/react-hook-test)

* [react query hook & zustand store hook unit test](/blog/frontend/react-query-zustand)

### storybook snapshot test

* 작성한 모든 Storybook - Story 의 html 형태의 스냅샷을 코드 수정이 발생할때마다 비교하여 의도하지 않은 UI 변화가 발생했는지 테스트를 수행.
  * 코드 수정 전의 html snapshot을 코드 수정 후의 snapshot 과 비교
  * snapshot 결과가 바뀌었을 때 의도한 수정이라면 jest 로 test 수행시 `-u` 옵션을 주어 snapshot 을 업데이트한다. 만약 의도하지 않았다면 코드를 다시 수정해야 한다.

테스트 방법

* storybook v8 이전 (~v7) : [storyshots](https://www.npmjs.com/package/@storybook/addon-storyshots) addon을 사용하여 테스트를 진행한다.
  * 테스트 설정은 https://storybook.js.org/docs/7.6/writing-tests/snapshot-testing 를 참고
* storybook v8 부터 : storyshots 은 deprecated 되어, storybook v8 부터는 [jest](https://jestjs.io/) 와 [playwright](https://playwright.dev/) 를 통해 snapshot 테스트를 진행한다.
  * 테스트 설정은 https://storybook.js.org/docs/writing-tests/snapshot-testing 를 참고
  * 단, ci 서버의 OS 에서 playwright 를 지원하지 않는 경우, [execute-tests-on-multiple-stories](https://storybook.js.org/docs/writing-tests/snapshot-testing/snapshot-testing#execute-tests-on-multiple-stories) 를 참고하여 playwright 대신 [react-testing-library](https://github.com/testing-library/react-testing-library) 로 가상의 dom 에 snapshot 을 그려서 테스트를 수행한다.


```typescript
// storybook.test.ts
import type { Meta, StoryFn } from '@storybook/react';
import { composeStories } from '@storybook/react';
import { render } from '@testing-library/react';
import * as glob from 'glob';
import path from 'path';

jest.mock('lodash-es/memoize', () => {
  return jest.fn((fn) => fn);
});

jest.mock('css-filter-converter', () => {
  return {
    hexToFilter: () => {
      return {
        color:
          'brightness(0) saturate(100%) invert(94%) sepia(9%) saturate(5344%) hue-rotate(358deg) brightness(105%) contrast(103%)',
      };
    },
  };
});

type StoryFile = {
  default: Meta;
  [name: string]: StoryFn | Meta;
};

const compose = (
  entry: StoryFile
): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry);
  } catch (e) {
    throw new Error(
      `There was an issue composing stories for the module: ${JSON.stringify(
        entry
      )}, ${e}`
    );
  }
};

function getAllStoryFiles() {
  const storyFiles = glob
    .sync(
      path.join(
        __dirname,
        '**/Renderer',
        '**/*.{stories,story}.{js,jsx,mjs,ts,tsx}'
      )
    )
    .map((filePath) => {
      return {
        filePath,
        storyFile: require(filePath),
      };
    })
    .filter(
      ({ storyFile }) => !storyFile.default.parameters?.snapshot?.disable
    );

  return storyFiles.map(({ filePath, storyFile }) => {
    const storyDir = path.dirname(filePath);
    const componentName = path
      .basename(filePath)
      .replace(/\.(stories|story)\.[^/.]+$/, '');

    return { filePath, storyFile, storyDir, componentName };
  });
}

describe('Stories Snapshots', () => {
  getAllStoryFiles().forEach(({ storyFile, componentName }) => {
    const meta = storyFile.default;
    const title = meta.title || componentName;

    describe(title, () => {
      const stories = Object.entries(compose(storyFile)).map(
        ([name, story]) => ({ name, story })
      );

      if (stories.length <= 0) {
        throw new Error(
          `No stories found for this module: ${title}. Make sure there is at least one valid story for this module.`
        );
      }

      stories.forEach(({ name, story }) => {
        test(name, async () => {
          const mounted = render(story());
          // Ensures a consistent snapshot by waiting for the component to render by adding a delay of 1 ms before taking the snapshot.
          await new Promise((resolve) => setTimeout(resolve, 1));
          expect(mounted.container).toMatchSnapshot();
        });
      });
    });
  });
});
```

```typescript
// Image.stories.ts
import { headerImageMock } from '@node/mocks';
import type { Meta, StoryObj } from '@storybook/react';

import { Image, ImageProps } from './Image';

const meta: Meta<ImageProps> = {
  component: Image,
  args: {
    node: headerImageMock,
  },
};

export default meta;

type Story = StoryObj<ImageProps>;

export const Default: Story = {};

export const WithAlignItemsCenter: Story = {
  args: {
    node: {
      ...headerImageMock,
      style: { ...headerImageMock.style, alignItems: 'center' },
    },
  },
};

export const WithParentRowBox: Story = {
  args: {
    parentBoxLayout: 'horizontal',
  },
};
```
