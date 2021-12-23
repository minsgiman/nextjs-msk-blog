---
title: Polymorphic component (with typescript)
date: '2021-03-05'
tags: ['react']
draft: false
summary: 'React Polymorphic Components 구현'
---

React Polymorphic Components 구현

```js
import React from 'react';

type TextOwnProps<E extends React.ElementType> = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary';
  children: React.ReactNode;
  as?: E;
};

type TextProps<E extends React.ElementType> = TextOwnProps<E> & Omit<React.ComponentProps<E>, keyof TextOwnProps<E>>;

export const Text = <E extends React.ElementType = 'div'>({ size, color, children, as, ...props }: TextProps<E>) => {
  const Component = as || 'div';
  return (
    <Component {...props} className={`class-with-${size}-${color}`}>
      {children}
    </Component>
  );
};

function App() {
  return (
    <div className="App">
      <Text as="h1" size="lg">
        Heading
      </Text>
      <Text as="p" size="md">
        Paragraph
      </Text>
      <Text as="label" htmlFor="someId" size="sm" color="secondary">
        Label
      </Text>
    </div>
  );
}
```

---

#### 참조

- [Polymorphic Components](https://www.youtube.com/watch?v=uZ8GZm5KEXY)
