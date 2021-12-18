---
title: 코딩 컨벤션 (React + Typescript)
date: '2020-11-11'
tags: ['react']
draft: false
summary: 'react 코딩 컨벤션'
---

## React Component 정의

`optional`

다음의 템플릿을 기본으로 작성하며, 클래스 컴포넌트 사용은 지양한다.

```ts
// FunctionComponent.tsx

type FunctionComponentProps = {
  //...
}

export function FunctionComponent({ ... }: FunctionComponentProps) {
  //...
}
```

## Custom hook 정의

`optional`

다음의 템플릿을 기본으로 작성하며, 이름은 "use-"로 정의한다.

```ts
// useCustom.tsx

type CustomOptions = {
  //...
}

export function useCustom({ ... }: CustomOptions) {
  //...
}
```

## key prop

`optional`

key prop으로 index를 사용하지 않고, item의 유니크한 id를 사용하는 것을 권장한다. <br />
index를 사용하는 경우 삽입, 삭제시 불필요한 리렌더링이 발생하고 원치않는 렌더링 결과가 발생할 수 있다. <br />
id가 없는 경우에는 uuid를 생성하여 key로 사용하는 것을 권장한다.

```ts
// bad
{
  todos.map((todo, index) => <Todo {...todo} key={index} />)
}

// good
{
  todos.map((todo) => <Todo {...todo} key={todo.id} />)
}
```

## JSX 태그 괄호

`mandatory`

JSX태그를 한 줄 이상으로 정의하는 경우에는 괄호로 wrapping한다.

```ts
// bad
return (
  <MyComponent variant="long body" foo="bar">
    <MyChild />
  </MyComponent>
)

// good
return (
  <MyComponent variant="long body" foo="bar">
    <MyChild />
  </MyComponent>
)

// good, when single line
return <MyComponent>{body}</MyComponent>
```

## Tag Self Closing

`mandatory`

children이 없는 경우에는 항상 태그를 self closing 한다.

```ts
// bad
<span
  key={idx}
  data-label={`${val}${idx + 1}`}
></span>

// good
<span
  key={idx}
  data-label={`${val}${idx + 1}`}
/>
```

## Event Type

`mandatory`

Event 타입은 React에서 제공해주는 타입을 사용한다. (React.ChangeEvent, React.MouseEvent)

```ts
const handleChange = useCallback(
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target?.value;
    onChange(val);
  },
  []
);

const handleClick = useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    ...
  },
  []
);
```

## Style Props

`mandatory`

style prop에 대한 타입은 React에서 제공해주는 타입을 사용한다. (React.CSSProperties)

```ts
type ContainerProps = {
  styles: React.CSSProperties
}

export function Container({ styles }: ContainerProps) {
  return <div style={styles}>Text here</div>
}
```

## Generic Props

`optional`

props가 multiple 타입인 경우 Generic으로 처리가능하다면 Generic을 적극 사용한다.

```ts
type ListProps<T> = {
  items: T[]
  onClick: (value: T) => void
}

export function List<T extends { id: number }>({ items, onClick }: ListProps<T>) {
  return (
    <div>
      {items.map((item, index) => {
        return (
          <div key={item.id} onClick={() => onClick(item)}>
            {item}
          </div>
        )
      })}
    </div>
  )
}
```

```ts
return (
  <List
    items={[
      {
        id: 1,
        name: 'Bruce',
      },
      {
        id: 2,
        name: 'Clark',
      },
    ]}
    onClick={(item) => console.log(item)}
  />
)
```

## useRef non-null assertion

`optional`

useRef 사용시 reference에 접근할 때는 항상 null이 아닌 것이 확실하다면 초기값에 non-null assertion Operator(!)를 붙여준다. <br />
그러면 다음과 같이 current에 optional을 붙여줄 필요가 없다. `inputRef.current?.focus();`

```ts
export function DomRef() {
  const inputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div>
      <input type='text' ref={inputRef} >
    </div>
  )
}
```
