---
title: Schema Validation Layer (with zod)
date: '2023-01-29'
tags: ['schema', 'validation', 'frontend', 'zod']
draft: false
summary: 'Generic으로 타입을 넣어주는 방식은 Compile Time에서 에러가 잡히지 않기 때문에 Run Time에서 예상치 못한 문제가 발생할 수 있다. 이러한 문제를 Schema Validation Layer 를 추가하여 해결해본다.'
---

API 반환값을 추론하기 위해 예상되는 타입을 Generic으로 기존에 넣어주었다.

```ts
export default async function fetchPosts() {
  const { data } = await axios.get<Post>('https://jsonplaceholder.typicode.com/posts');
  return data;
}

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
```

하지만 실제로는 `Post`가 아닌 `Post[]`를 반환함에도 타입에러가 잡히지 않는다. <br />
`Generic`으로 타입을 넣어주는 방식은 Compile Time에서 에러가 잡히지 않기 때문에 Run Time에서 예상치 못한 문제가 발생할 수 있다.

이러한 문제를 **Schema Validation Layer** 를 추가하여 해결해본다.

## Schema Validation

npm에 Schema Validation을 지원하는 패키지가 다양하게 있다. ([링크](https://www.npmjs.com/search?q=keywords%3Aschema%2C%20validation)) <br />
그 중에 [zod](https://github.com/colinhacks/zod)를 사용해본다.

위 예제를 zod 로 Schema Validaition 을 하면 아래와 같이 작성할 수 있다.

```ts
// schema/post.ts
import axios from 'axios';
import { z } from 'zod';

export const Post = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});
export type Post = z.infer<typeof Post>;

export const Posts = z.array(Post);
export type Posts = z.infer<typeof Post>;
```

```ts
export default async function fetchPosts() {
  const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');

  return Posts.parse(data);
}
```

만약 잘못된 Schema 로 parse 를 시도한다면, ZodError 를 throw 한다.

<img src="/static/images/zodError.png" />

zod 는 schema 단에서 데이터를 다룰 수 있는 매우 많은 method 를 제공해준다. <br />
그리고, `infer` method 를 사용하면 schema 를 기반으로 추론한 타입을 사용할 수 있다.

## Zod Schema

#### .optional

```
body: z.string().optional(),
```

다음과 같이 사용하면 `body?: string` 의 의미를 갖는다.

#### .nullable

```
body: z.string().nullable(),
```

다음과 같이 사용하면 `body: string | null` 의 의미를 갖는다. <br />
이 경우, body 필드가 parse 대상에 없는 경우 Error 를 던진다.

#### .nullish

```
body: z.string().nullish(),
```

다음과 같이 사용하면 `body?: string | null | undefined` 의 의미를 갖는다. <br />
위 예시는 `z.string().optional().nullabe()` 과 동일하다.

#### z.enum

```ts
const Fish = z.enum(['Salmon', 'Tuna', 'Trout']);
console.log(Fish.enum); // => {Salmon: "Salmon", Tuna: "Tuna", Trout: "Trout"};
console.log(Fish.enum.Salmon); // => "Salmon"
console.log(Fish.options); // => ["Salmon", "Tuna", "Trout"]
```

Zod 는 enum 을 위한 자체적인 메서드를 지원한다. enum 으로 생성한 값은 `.enum`, `.options` 으로 다양한 값으로 사용할 수 있다.

#### z.nativeEnum

```ts
enum FishEnum {
  Salmon = 'Salmon',
  Tuna = 'Tuna',
  Trout = 'Trout',
}

const Fish = z.nativeEnum(FishEnum);
```

앞서 소개한 z.enum() 이 enum 을 정의하거나 유효성을 검증하는 가장 추천되어지는 방식이지만, 이미 존재하는 enum 을 사용해야 하는 경우도 있다. 이럴 경우, `z.nativeEnum` 을 사용하여 스키마를 정의할 수 있다.

#### z.infer

```ts
const Post = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});
type Post = z.infer<typeof Post>;
//  type Post = {
//     id: number;
//     userId: number;
//     title: string;
//     body: string;
//  }
```

infer 를 사용하면 만들어 둔 스키마를 기반으로 타입 추론을 해준다.

## Zod Method

#### .parse

`ZodSchema.parse()` 의 형태로 사용하며, 만든 Schema 가 인자에 들어오는 대상을 parse 할 수 있는지 검증하고, 유효하다면, schema 타입에 맞는 value를 반환한다. 유효하지 않다면 error 를 throw 한다.

API 반환 값을 parsing 하는 용도 외에 다양한 방식으로 사용할 수도 있다.

payload 에 들어갈 값 중에 id 를 걸러줘야 하고, 해당 값을 넣으면 서버에서 오류를 뱉는다고 가정한다. 그렇다면 다음과 같은 방식을 사용할 수 있을것이다.

```ts
function fetchSomething(payload: { id: string; name: string; content: string }) {
  const newPayload = Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => key !== 'id')
  );

  // do something...
}
```

그러나, payload 에 또 다른 값이 영향을 주어서 filter 해야 하는 값이 또 추가된다면 해당 로직을 재수정 해야하고, 이는 매우 귀찮은 작업이다. 이를 parse 로 해결할 수 있다.

```ts
const Something = z.object({
  name: z.string();
  content: z.string();
})
type Something = z.infer<typeof Something>;

function fetchSomething(payload: Something) {
  const newPayload = Something.parse(payload);

  // do something...
}
```

로직이 매우 간단해지고, 다른 필드가 추가적으로 들어오더라도 안전하게 payload 를 서버에 넘겨줄 수 있다.

#### .safeParse

앞서 소개한 parse 는 인자가 parsing 을 통과하지 못하면 Error 를 throw 한다. <br />
그러나, error 가 throw 되는 것을 원치 않는 경우도 있을 것이다. <br />
예를 들어, parsing 에 실패했을 때 다른 로직을 실행할 수도, 기존 값을 수정할 수도 있을 것이다.

safeParse는 다음과 같이 사용한다.

```ts
let name: unknown = 'myName';
console.log(z.string().safeParse(name)); // => { success: true; data: "myName" }

name = 1;
console.log(z.string().safeParse(name)); // => { success: false; error: ZodError }

const { success, data, error } = z.string().safeParse(name);

if (!success) {
  // do something!!
}
```

#### .preprocess

때때로 Schema 에 통과하기 전 값을 변형시키고 싶은 경우가 있다. <br />
예를 들어, 서버에서 넘겨주는 데이터 인터페이스가 바뀌었고 하위 호환성을 위해 기존 인터페이스를 유지 시켜줘야 할 필요가 있는 경우 preprocess 를 유용하게 사용할 수 있다.

```ts
const PostV2 = z.preprocess(
  (input: any) => {
    input.subtitle = input.version === 1 ? '' : input.subtitle;
    // or input.subtitle ??= ""

    return input;
  },
  z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    body: z.string(),
    subtitle: z.string(),
  })
);
```

#### .transform

transform 은 Schema 를 통과한 데이터를 변형시켜 줄 때 사용한다. <br />
서버에서 넘겨준 데이터와 클라이언트에서 렌더링을 위해 필요한 데이터의 인터페이스가 다른 경우가 흔히 있다.

이런 경우, 값을 가공하는 역할을 `Schema Validation Layer` 에 위임함으로써 주 로직을 보다 깔끔하게 관리할 수 있다.

```ts
export type Url = z.infer<typeof Url>; // Type Inference => Url: string
export const Url = z
  .object({
    protocol: z.string(),
    host: z.string(),
    pathname: z.string(),
  })
  .transform(({ protocol, host, pathname }) => {
    return `${protocol}//${host}${pathname}`;
  });
```

---

### 참고

- https://www.pumpkiinbell.com/blog/remote/scheme-validation-layer

- https://github.com/colinhacks/zod
