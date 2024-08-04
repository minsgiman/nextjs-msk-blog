---
title: Next.js 캐싱
date: '2024-08-02'
tags: ['frontend', 'nextjs', 'react', 'cache']
draft: false
summary: 'Next.js 캐싱을 통해 웹서버 성능을 개선하기 위한 방법들을 알아본다.'
---

Next.js 캐싱을 통해 웹서버 성능을 개선하기 위한 방법들을 알아본다.

웹 페이지 요청 과정을 표현한 아래 다이어그램에서 노란색 부분, 즉 [TTFB(Time to First Byte)](https://web.dev/articles/ttfb?hl=ko)에 해당하는 영역이 웹 서버의 성능으로부터 영향을 받습니다.

<img src="/static/images/navigation-timing.svg" />

[웹 서버의 성능을 향상시키기 위해 알려진 방법](https://medium.com/@surksha8/10-proven-strategies-to-boost-your-next-js-app-performance-2de166dcff50)들은 여러 가지 있지만, <br />
그 중 상품 관련 페이지의 서버 렌더링 결과에 캐싱을 적용함으로써, 큰 개선 효과를 얻고자 한다. <br />
상품의 개수가 적고, 트래픽이 발생할 때 특정 상품으로 집중되는 특징은 [Cache Hit Ratio](https://www.cloudflare.com/learning/cdn/what-is-a-cache-hit-ratio/)에 너무나 유리한 조건입니다.

## Next.js의 캐싱 매커니즘

| 매커니즘                    | 대상                  | 장소       | 목적                               | 기간                   |
|-------------------------|----------------------|----------|----------------------------------|----------------------|
| **Request Memoization** | fetch 함수의 return값    | 서버       | React Component tree에서 data의 재사용 | request 생명주기 동안      |
| **Data Cache**          | Data                 | 서버       | 유저 요청이나 deployment에 의해 저장된 데이터   | 영구적(revalidate 가능)   |
| **Full Route Cache**    | HTML, RSC Payload    | 서버       | **렌더링 cost 감소 및 성능 향상**          | 영구적(revalidate 가능)   |
| **Router Cache**	       | RSC Payload          | 클라이언트    | 네비게이션에 의한 서버 요청 감소               | 세션 또는 정해진 시간 동안      |

### Request Memoization

웹 서버로 페이지 요청이 들어오면 페이지에 필요한 데이터들을 fetch하게 되는데, 이때 동일한 endpoint로의 API fetch를 여러 컴포넌트에서 수행할 필요가 있다면 Request Memoization이 동작합니다. (React가 fetch 함수를 확장해놓았기 때문에 별도 설정은 필요 없습니다.)
상위 컴포넌트에서 API fetch 결과를 prop drilling 하는것 대신, 각 컴포넌트에서 fetch를 수행하도록 구현해도 실제 API 요청은 최초 1회만 전송되고 나머지는 응답값을 재사용합니다.

참고 : https://nextjs.org/docs/app/building-your-application/caching#request-memoization

<img src="/static/images/deduplicated-fetch-requests.jpg" />


Request Memoization은 서버에서 호출되는 `GET` 메서드에만 적용되므로, `POST`나 `DELETE` API 또는 클라이언트에서 호출되는 API에는 적용되지 않습니다. <br />
그리고 **한 번의 서버 렌더링 동안만 유효**하기 때문에 따로 revalidate 할 필요가 없을 뿐 아니라 할 수도 없습니다.

### Data Cache

우리가 일반적으로 생각할 수 있는 API 캐싱입니다.

```js
// Revalidate at most every hour
fetch('https://...', { next: { revalidate: 3600 } })
```

Next.js가 확장해놓은 fetch 함수에 `next.revalidate` 옵션을 넘기면 Data Cache가 동작합니다. <br />
성공적으로 데이터를 가져왔다면 그 응답값을 저장해두었다가 동일한 경로로 fetch 함수를 실행할 때 실제 API 호출은 건너뛰고 저장해놓은 응답값을 반환합니다. <br />
하나의 요청 동안만 유효한 `Request Memoization`과 다르게 `Data Cache`는 일정 시간 동안에 웹 서버로 들어오는 모든 요청에 대해 동작합니다. <br />
만약 `next.revalidate`를 1초로 설정했다면, 1초에 1000명의 사용자가 접속해도 실제 API 요청은 1회 전송됩니다.

참고 : https://nextjs.org/docs/app/building-your-application/caching#revalidating-1

<img src="/static/images/time-based-revalidation.jpg" />

Data Cache를 설명하는 위 이미지에서 한 가지 짚고 싶은 부분은 revalidate 시간이 지나더라도 첫 요청은 캐싱된 값을 (STALE 상태여도) 반환한다는 것입니다. <br />
반환 후 백그라운드에서 API를 호출해서 값을 업데이트하는데, 개발자 의도와 다르게 동작할 수 있기 때문에 캐시를 적용할 때 주의가 필요합니다.

강제로 Data Cache를 revalidate 하려면 [revalidatePath](https://nextjs.org/docs/app/building-your-application/caching#revalidatepath)를 사용해야 합니다. <br />
`router.refresh`로는 Data Cache가 revalidate되지 않고, `revalidatePath`를 사용해야 합니다. (이때는 즉시 revalidate 되기 때문에, 다음 첫 요청에도 새로운 값을 반환합니다.)

`revalidatePath` 를 사용하는 케이스는 공식문서에 다음과 같이 나와있다.

* [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) - to revalidate data in response to a third party event (e.g. webhook).
* [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - to revalidate data after a user interaction (e.g. form submission, clicking a button).


### Full Route Cache

웹 서버의 성능을 눈에 띄게 향상시키려면 Full Route Cache를 적용해야 합니다. 서버 렌더링 과정에서 웹 서버의 리소스(특히 CPU)를 대부분 사용하게 되는데, Full Route Cache는 서버 렌더링 결과를 재사용함으로써 이를 줄일 수 있습니다.

[static-and-dynamic-rendering](https://nextjs.org/docs/app/building-your-application/caching#static-and-dynamic-rendering)

<img src="/static/images/static-and-dynamic-routes.jpg" />

Full Route Cache를 적용하려면 페이지를 Static 렌더링 되도록 구성해야 합니다. <br />
다시 말해 [Dynamic Function](https://nextjs.org/docs/app/building-your-application/caching#dynamic-functions)을 사용하지 않아야 하는데, 그렇지 않으면 그림과 같이 Full Route Cache 단계가 SKIP 됩니다.
Full Route Cache를 좀 더 자세히 알고 싶다면 [공식문서](https://nextjs.org/docs/app/building-your-application/caching#full-route-cache)를 참고하시길 바랍니다.

### Router Cache

Client 사이드에서 React Server Component Payload를 [Router Cache](https://nextjs.org/docs/app/building-your-application/caching#router-cache)를 통해 캐싱한다. Prefetch 또한 Router Cache를 통해 캐싱된다. <br />
Full Route Cache가 서버사이드에서 캐싱되고 Static 렌더링 라우트만 캐싱하는 반면, **Router Cache는 브라우저에서 user session 기간동안 캐시하며 Static 과 Dynamic 렌더링 모두 캐싱한다.**  

<img src="/static/images/nextjs-router-cache.png" width="500" />

강제로 Router Cache 를 갱신하는 방법은 https://nextjs.org/docs/app/building-your-application/caching#invalidation-1 를 참고한다.

## Next.js의 캐싱 적용하기

#### 1. 캐싱 대상 정하기 

개인화된 페이지(장바구니, 결제 등)는 동일한 응답을 내려줘서는 안 되기 때문에 캐싱 적용 대상에서 제외한다. <br />
상품 목록/상세 페이지는 비로그인 상태에서도 누구나 조회 가능하고 트래픽이 몰릴 가능성이 있기 때문에 아주 적절한 대상이다.

#### 2. 코드변경

##### 캐시 디버깅 컴포넌트 구현

브라우저에 렌더링 된 페이지가 Full Route Cache를 HIT 했는지를 확인하기 위해 간단한 서버 컴포넌트 하나를 추가했습니다.

```ts
function DebugCache({path}: {path: string}) {
  return (
    <div>
      {dayjs().valueOf()}
      <RevalidateButton path={path}/>
    </div>
  );
}
```

```ts
'use client'
function RevalidateButton({ path }: {path: string}) {
  return <button onClick={() => revalidateFullRouteCache(path)}>revalidate</button>
}
```

```ts
'use server'
import { revalidatePath } from 'next/cache';

export async function revalidateFullRouteCache(path) {
  if (path) {
    revalidatePath(path, 'layout');
  }
}
```

브라우저에서 새로고침을 해도 dayjs().valueOf()값이 동일하다면 Full Route Cache가 HIT 했다고 판단할 수 있습니다.

#### generateStaticParams 사용을 통한 static route로 변경

Full Route Cache가 동작하게 하려면 [Dynamic routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)에 [ISR](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration)을 적용하고, 사용 중인 [Dynamic Function](https://nextjs.org/docs/app/building-your-application/caching#dynamic-functions)을 제거해야 한다. <br />
[generateStaticParams](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#generating-static-params)를 통해서 ISR 방식의 static route로 바꿈으로써 Full Route Cache를 적용할 수 있다.

* URL PATH
    * 다국어를 지원하며 url path에 언어값이 포함되어있습니다. 지원하는 언어는 고정돼 있기 때문에, generateStaticParams에 바로 적용해서 static 페이지로 만듭니다.

        ```ts
        // app>[lang]>layout.tsx
        export function generateStaticParams() {
          return SUPPORTED_LANGS.map(locale => ({ locale }));
        }
        ```
    * 상품 상세 페이지도 url path에 상품 ID 값이 포함되어있습니다. 하지만 다국어와는 다르게 상품의 ID 값은 고정된 값이 아니기 때문에 generateStaticParams에서 빈 배열을 리턴해줍니다. 이렇게 하면 ISR로 동작하게됩니다. 

        ```ts
        // app>[lang]>(static)>상품상세>[id]>page.tsx
        export async function generateStaticParams() {
          return [];
        }
        ```

* Dynamic Functions

서비스에서 여러 가지 인증 체계를 사용하기 때문에 일관된 인증 처리를 위해 [middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)에서 `cookies, headers, searchParams` 를 사용해서 전처리하고 있다. <br />
모두 dynamic function이기 때문에 middleware 대신 클라이언트에서 전처리하도록 AuthProvider 를 추가한다.

```ts
// before
// middleware(Server)에서 Client로 마이그레이션 돼야 하는 코드 예시입니다.
export function middleware(request: NextRequest) {

  const { nextUrl } = request;
  nextUrl.searchParams.set(SEARCH_PARAM_KEYS.REGION_TYPE, regionType);
  
  const responseForSetCookie = NextResponse.redirect(nextUrl);
  responseForSetCookie.cookies.set(COOKIE_KEYS.USER_TYPE, getUserType());

  // ...
  // ...

  return responseForSetCookie;
}
```

```ts
// after
'use client';

function AuthProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    document.cookie = `${COOKIE_KEYS.USER_TYPE}=${getUserType()}; domain=.melon.com; path:/;`;
    
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(SEARCH_PARAM_KEYS.REGION_TYPE, getRegionType());
    
    ...
    ...

  }, []);

  return children;
}
```

이외에도 API를 호출하는 함수에서 인증을 위해 사용하고 있는 dynamic function을 인증이 필요 없는 상품 목록/상세 페이지에서는 사용하지 않도록 처리한다.

```ts
// before
// API 호출하는 부분에서 제거돼야 하는 코드 예시입니다.
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();

  return {
    [HEADER_KEYS.CHANNEL_TYPE]: cookieStore.get(COOKIE_KEYS.CHANNEL_TYPE)?.value as ChannelTypes,
    [HEADER_KEYS.REGION_TYPE]: cookieStore.get(COOKIE_KEYS.REGION_TYPE)?.value as RegionTypes,
  };
```

* Full Route Cache 적용

static route가 가능하게 되었다면, layout.tsx에 [revalidate](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate) 시간을 설정해서 Full Route Cache가 동작하도록 해줍니다.

```ts
// app>[lang]>(static)>상품상세>[id]>layout.tsx
export const revalidate = 1; // seconds
```

> Full Route Cache는 Data Cache가 HIT 되었을 때에만 동작합니다. ([참고](https://nextjs.org/docs/app/building-your-application/caching#data-cache-and-full-route-cache))
> 따라서 Full Route Cache를 적용하려는 페이지의 모든 fetch에는 next.revalidate 값이 (Full Route Cache의 revalidate 값보다 크거나 같게) 설정돼야 합니다.


---

### 참조

- [공식문서 Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js 캐싱으로 웹 서버 성능 최적화](https://fe-developers.kakaoent.com/2024/240418-optimizing-nextjs-cache/)
