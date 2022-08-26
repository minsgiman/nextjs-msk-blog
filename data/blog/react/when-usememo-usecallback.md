---
title: 언제 useMemo와 useCallback을 사용해야 하나
date: '2021-03-23'
tags: ['react']
draft: false
summary: 'Performance optimizations 를 위한 useCallback, useMemo 사용은 공짜가 아니다.'
---

Performance optimizations 를 위한 useCallback, useMemo 사용은 공짜가 아니다.

```js
const dispense = (candy) => {
  setCandies((allCandies) => allCandies.filter((c) => c !== candy));
};
const dispenseCallback = React.useCallback(dispense, []);
```

위 코드에서 보듯이 useCallback 사용은 추가로 deps([])를 정의하고 React.useCallback을 실행하는 비용을 필요로 한다. <br />
또한 original dispense function외에 추가적인 메모리 점유를 하게된다.

useMemo 또한 마찬가지로 비용이 필요하다. <br />
다음과 같은 경우 복잡한 연산을 하지 않는데, useMemo를 사용하는 것은 오히려 낭비다.

```js
const initialCandies = React.useMemo(() => ['snickers', 'skittles', 'twix', 'milkyway'], []);
```

위의 코드는 다음과 같이 변경하는 것이 좋다.

```js
const initialCandies = ['snickers', 'skittles', 'twix', 'milky way']

function CandyDispenser() {
  const [candies, setCandies] = React.useState(initialCandies)
```

그러면 언제 useMemo와 useCallback을 사용해야 할까? <br />
다음의 경우에 사용하는 것이 좋다.

- **불필요한 re-rendering이 발생할 때**
- **비용이 많이 드는 계산**

예시를 통해 확인해보자.

아래 코드에서 두개의 버튼중 하나의 버튼이라도 클릭이 된다면 DualCounter의 상태(state)는 변하게 되고, DualCounter가 리랜더링 되면서 두개의 CountButton 컴포넌트도 리랜더링을 하게 된다.

그런데 클릭한 함수의 컴포넌트만 다시 랜더링 하면 되는데, 다른 컴포넌트까지 불필요한 리랜더링이 발생한다. (하지만 대부분의 경우 불필요한 리랜더를 크게 신경쓰지 않아도 된다. 리액트 내부적으로 최적화 할것이다.) <br />
그러나 상호작용이 가능한 그래프나 차트, 애니메이션등과 같이 랜더링이 발생할때 상당한 시간이 걸리게되는 상황들도 있다.

```js
function CountButton({ onClick, count }) {
  return <button onClick={onClick}>{count}</button>;
}

function DualCounter() {
  const [count1, setCount1] = React.useState(0);
  const increment1 = () => setCount1((c) => c + 1);
  const [count2, setCount2] = React.useState(0);
  const increment2 = () => setCount2((c) => c + 1);
  return (
    <>
      <CountButton count={count1} onClick={increment1} />
      <CountButton count={count2} onClick={increment2} />
    </>
  );
}
```

아래와 같이 변경하면 CountButton의 props가 변할때만 다시 랜더링한다!

```js
const CountButton = React.memo(function CountButton({ onClick, count }) {
  return <button onClick={onClick}>{count}</button>;
});
```

하지만 DualCounter 가 다시 랜더링될 때마다 increment1과 increment2 는 다시 만들어지고 이는 CountButton의 prop변경으로 이어져 리랜더링을 유발한다.

useCallback을 사용하여 increment1과 increment2 을 메모이제이션한다.

아래의 예시는 useCallback과 React.memo를 사용해 불필요한 리랜더를 방지한 코드이다.

```js
const CountButton = React.memo(function CountButton({ onClick, count }) {
  return <button onClick={onClick}>{count}</button>;
});

function DualCounter() {
  const [count1, setCount1] = React.useState(0);
  const increment1 = React.useCallback(() => setCount1((c) => c + 1), []);
  const [count2, setCount2] = React.useState(0);
  const increment2 = React.useCallback(() => setCount2((c) => c + 1), []);
  return (
    <>
      <CountButton count={count1} onClick={increment1} />
      <CountButton count={count2} onClick={increment2} />
    </>
  );
}
```

다음으로 useMemo가 필요한 예시를 살펴보면, 아래 경우에서 calculatePrimes이 굉장히 복잡한 연산을 한다고 가정할 때 useMemo를 통한 메모이제이션은 성능상 이점을 가져올 수 있다.

```js
function RenderPrimes({ iterations, multiplier }) {
  const primes = React.useMemo(() => calculatePrimes(iterations, multiplier), [
    iterations,
    multiplier,
  ]);
  return <div>Primes! {primes}</div>;
}
```

결론은 성능 최적화를 위한 도구사용에는 비용이 필요하고, 많은 경우 리액트가 내부적으로 최적화를 하기 때문에 위에서 언급한 필요로 하는 경우에만 사용하는 것이 좋다.

---

### 참조

- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
