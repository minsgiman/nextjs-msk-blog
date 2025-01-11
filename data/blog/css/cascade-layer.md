---
title: SCSS module 에 cascade layer 적용하기
date: '2025-01-11'
tags: ['css', 'nextjs']
draft: false
summary: 'cascade layer 는 css 우선순위를 명시적으로 지정할 수 있게 지원하는 css 스펙으로 현재 대부분 브라우저에서 지원하고 있다.'
---

next.js 프로젝트에 스타일을 SCSS & CSS module 을 사용하여 구현하고 있었다.

CSS module 을 사용하면 해당 CSS module 안에서의 고유한 클래스 명을 생성하여, 스타일링 하는 컴포넌트가 다른 컴포넌트와 중복되는 클래스 이름을 가지게 되는 것을 방지 할 수 있다.

* 클래스명의 전역 오염 방지 
* 컴포넌트별 CSS 관리의 편리함

하지만 next.js 에서 CSS module 을 사용하면서 CSS 우선순위에 따른 의도치 않은 문제를 겪게 된다. 

### 문제 상황

아래와 같은 상황에서 template 컴포넌트에서 전달한 className prop 의 스타일이 atomic 컴포넌트의 스타일보다 우선적으로 동작하는 것을 보장할 수 없다. <br />
아래의 상황에서는 css 선택자 깊이가 동일하기 때문에 어떤 스타일이 우선해서 동작할지 모르게 된다. (next.js 빌드에 따라 달라진다.)

##### atomic 컴포넌트

```scss
// Select.module.scss
.trigger {
    width: 100%;
    padding: 14.5px 9px 14.5px 10px;
    background-color: #f6f6f6;
    border-radius: 5px;
    column-gap: 8px;
}
```

```typescript
import styles from './Select.module.scss';

export const FormSelectTrigger = ({
  className,
  children,
  style,
}: FormSelectTriggerProps) => {
  return (
    <SelectTrigger className={classnames(styles.trigger, className)} style={style}>
      {children}
    </SelectTrigger>
  );
};
```

##### template 컴포넌트

```scss
// SizeOption.module.scss
.valueWrap {
    @include mixins.rfonts(15, false, 500);

    width: auto;
    height: 48px;
    padding: 6px;
}
```

```typescript
import styles from './SizeOption.module.scss';

export function SizeOption = () => {
  return (
     <FormSelectTrigger className={styles.valueWrap}>
       <SelectValue />
     </FormSelectTrigger>
  );
};
```

### cascade layer 를 통해 css 우선순위를 명시적으로 지정

위의 문제를 해결하기 위해 [cascade layer](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) 를 사용한다. <br />
cascade layer 는 css 우선순위를 명시적으로 지정할 수 있게 지원하는 css 스펙으로 현재 대부분 브라우저에서 지원하고 있다. <br />
적용하려는 프로젝트에서 cascade layer 의 [브라우저 지원](https://caniuse.com/css-cascade-layers) 은 문제가 없었다. <br />
만약 필요하다면, postcss 로 적용할 수 있는 [cascade-layers-polyfill](https://www.oddbird.net/2022/06/21/cascade-layers-polyfill/) 이 존재한다.

#### 구현

아래에서 layer 의 우선순위를 다음과 같이 분류하였다. 

* foundation < library < components < 그 외
  * foundation : 초기 설정 css
  * library : 3rd party (radix theme)
  * components : 전역 공통 컴포넌트

우선순위는 layers.scss 에 명시하고, next.js 의 [rootLayout](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layouts) 파일에서 가장 먼저 import 해주어 스타일 정의 가장 상단에 위치하도록 해야 한다. <br />
그 이유는 layer 우선순위를 명시하기 이전에 선언한 layer 는 명시한 우선순위를 따르지 않기 때문이다.

##### layers.scss

```scss
@layer foundation, library, components;
```


###### main.scss

```scss
@forward 'layers'; //  Must come first for the cascade layers to work as intended.

@forward 'foundation';
```

##### foundation.scss

```scss
@use 'sass:meta';

@layer foundation {
  @include meta.load-css('../../../libs/scss/main');
}
```

##### theme.scss

```scss
@import '@radix-ui/themes/styles.css' layer(library);

@layer library {
  :root,
  .light,
  .light-theme,
  .radix-themes {
    --green-1: #f9fffa;
    --green-2: #f3fcf4;
    --green-3: #e2f9e5;
  }
}
```

##### input.module.scss

```scss
@use '../../../../../scss/abstracts/variables';
@use '../../../../../scss/abstracts/mixins';

@layer components {
  .input {
    &:active,
    &:focus {
      border: 1px solid variables.$line-green;
    }

    @include input;
    width: 100%;
    padding: 15px 6px 14px;
  }
}
```

#### 적용하면서 겪은 nextjs이슈

##### **이슈 1.** layer 우선순위 정의를 style 정의 가장 앞 부분에 위치 시켜야 하나, nextjs 빌드하면서 이 순서가 보장이 안되는 문제가 있다.

rootLayout 에서 포함한 다른 컴포넌트가 스타일을 가지고 있다면, layout 우선순위 정의 css를 rootLayout 에서 가장 위에 import 하더라도, 아래와 같이 nextjs 빌드시 생성되는 layout.css 에 컴포넌트 스타일 정의를 위쪽에 넣어 버린다.

* 관련 이슈 : https://github.com/vercel/next.js/issues/47585
* workaround 수정 방법 : `@layer components` 를 정의한 컴포넌트들은 rootLayout에서 제외하고 다음 위치의 layout 으로 이동시켜서 layout.css 를 분리한다.

```scss
// static/css/app/%5Blocale%5D/layout.css?v=1736394800084

@layer components {
  .Dialog_overlay__Nxoik {
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    inset: 0;
    animation: Dialog_overlayShow__ovLYt 150ms cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 10;
  }

...

@charset "UTF-8";
@layer foundation, library, components;
```

##### **이슈 2.** `@import '@radix-ui/themes/styles.css' layer(library);` 와 같이 css import 시 layer 정의가 동작하지 않음

위와 같이 css import 를 하면 nextjs 에서 postcss 로 빌드시에 결과물이 엉뚱하게 만들어 져서 동작하지 않는 이슈가 있다.

* 관련 이슈 : https://github.com/vercel/next.js/issues/55763
* 수정 방법 : import 내용을 inline 으로 바꿔주는 [postcss-import](https://www.npmjs.com/package/postcss-import) 사용해서 해결한다.

postcss.config.js 에 다음과 같이 설정한다.

```js
module.exports = {
  plugins: {
    'postcss-import': {},
  },
};
```

---

### 참고

* https://www.w3.org/TR/css-cascade-5/#layering

* https://github.com/css-modules/css-modules/issues/401#issuecomment-2340754230

