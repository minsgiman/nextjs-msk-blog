---
title: Webpack5, Storybook7 로 migration 하기
date: '2023-01-30'
tags: ['webpack', 'storybook', 'frontend']
draft: false
summary: 'webpack v4 -> v5, storybook v6 -> v7 migrate'
---

### webpack
* v5 migrate 참고 : [v4 -> v5 migrate](https://webpack.kr/migrate/5/)
* persistent caching 적용 : [persistent caching guide](https://github.com/webpack/changelog-v5/blob/master/guides/persistent-caching.md)

  ```
  // webpack.config.base.js
  cache: {
      type: 'filesystem',
      buildDependencies: {
          config: [__filename],
      },
  },
  ```

### storybook
* v7 migrate 참고 : [Migration guide for Storybook 7.0](https://storybook.js.org/docs/react/migration-guide)
* storybook 7 locale change setting 참고 : https://storybook.js.org/recipes/react-i18next

  ```tsx
  // .storybook/decorators/StoryLayout.tsx
  import React, { Suspense, useEffect, useState } from 'react';
  import { I18nextProvider } from 'react-i18next';
  
  import I18n from '@utils/locale';
  
  import '@markup/css/th-bank.css';
  import './splash.css';
  
  const { i18n } = I18n;
  
  export function StoryLayout(Story: React.ElementType, context: any) {
    const { locale } = context.globals;
    // use to force re-render story
    const [innerLocale, setInnerLocale] = useState(locale);
  
    useEffect(() => {
      i18n.changeLanguage(locale);
    }, [locale]);
  
    i18n.on('languageChanged', (locale: string) => {
      setInnerLocale(locale);
    });
  
    return (
      <Suspense fallback={<div>loading translations...</div>}>
        <I18nextProvider i18n={i18n}>
          <div id="application" className="wrap">
            <Story key={innerLocale} />
          </div>
        </I18nextProvider>
      </Suspense>
    );
  }
  ```
  
  ```tsx
  // .storybook/preview.tsx
  
  export const globalTypes = {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: 'English', title: 'EN' },
          { value: 'th', right: 'Thai', title: 'TH' },
        ],
      },
    },
  };
  ```

* 컴포넌트 공통 arg 전달은 [argTypes -> args 으로 변경됨](https://storybook.js.org/docs/react/faq#why-are-my-args-no-longer-displaying-the-default-values)
* [on-demand-story-loading](https://storybook.js.org/docs/react/configure/overview#on-demand-story-loading) 은 story를 [CSF3 포맷으로 변경](https://storybook.js.org/docs/react/migration-guide#csf2-to-csf3) 해야 동작하기에 storyStoreV7: false로 설정해둠
  * on-demand story loading : 처음부터 전체 story를 load 하지 않고, 필요한 story만 요청시에 불러옴

  ```typescript
  // .storybook/main.ts
  
  // Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-vite)
  import type { StorybookConfig } from '@storybook/your-framework';
  
  const config: StorybookConfig = {
    framework: '@storybook/your-framework',
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    features: {
      storyStoreV7: false, // 👈 Opt out of on-demand story loading
    },
  };
  
  export default config;
  ```

### storyshot
* react renderer 버전이 맞지 않는 이슈 수정 -> 이로 인해 test옵션을 제거하여 snapshot 파일이 하나로 떨어지게 변경됨

`@storybook/addon-storyshots` 패키지 내부적으로 `react-test-renderer 18.2.0` 버전을 디폴트로 사용하고 있다. <br />
패키지 내부적으로 사용하는 18.2.0 버전이 현재 프로젝트에서 사용하는 react 버전 (16.10.2)이랑 달라서 [발생하는 에러](https://stackoverflow.com/questions/72088446/uncaught-typeerror-cannot-read-properties-of-undefined-reading-isbatchinglega)가 있었다. <br />
그래서 storyshot renderer 를 다음과 같이 `react-test-renderer 16.10.2` 버전으로 직접 설정해주어야 에러가 수정되었다. <br />

```js
//storyshot.test.js
import { create } from 'react-test-renderer';

initStoryshots({
 configPath: resolve('.storybook'),
 framework: 'react',
 renderer: create,
```

그런데 renderer 옵션이 다음 [test 옵션이 있으면 ignore](https://github.com/storybookjs/storybook/issues/3604) 되도록 되어 있어서 (이유는 잘 모르겠음..) test 옵션을 빼게 되었다.

```
initStoryshots({
...
test: multiSnapshotWithOptions(),
```

test 옵션을 빼게 되면 snapshot 결과가 모두 합쳐져서 파일 하나로 떨어지게 되어,
[[Feature Request]: Do not ignore initStoryshots renderer option when using test option](https://github.com/storybookjs/storybook/issues/22526) 이슈를 등록해두었다.



### cypress
* publicPath 관련 이슈 수정 - 참고 : https://github.com/cypress-io/cypress/issues/18435

  ```js
  // cypress/plugins/cy-preprocessor.js
  
  // fix publicPath issue. refer to https://github.com/cypress-io/cypress/issues/18435.
  const publicPath = '';
  let outputOptions = {};
  Object.defineProperty(webpackOptions, 'output', {
    get: () => {
      return { ...outputOptions, publicPath };
    },
    set: function (x) {
      outputOptions = x;
    },
  });
  ```

### 그 외

* [script-ext-html-webpack-plugin](https://www.npmjs.com/package/script-ext-html-webpack-plugin) 에서 webpack5를 지원하지 않아서 같은 역할을 하는 [@vue/preload-webpack-plugin](https://github.com/vuejs/preload-webpack-plugin) 사용
  * https://github.com/GoogleChromeLabs/preload-webpack-plugin 내용 참고하여 vuejs/preload-webpack-plugin 사용
* copy-webpack-plugin 은 webpack5 를 지원하는 버전으로 업데이트
  * 참고 : https://github.com/webpack-contrib/copy-webpack-plugin/issues/552

---

### 참조

- https://webpack.kr/migrate/5/

- https://so-so.dev/tool/webpack/whats-different-in-webpack5/
