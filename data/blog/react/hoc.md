---
title: React Higher-Order Components (HOC)
date: '2020-11-11'
tags: ['react']
draft: false
summary: 'HOC는 React에서 컴포넌트 로직을 재사용하기 위한 패턴이다.'
---

HOC는 React에서 컴포넌트 로직을 재사용하기 위한 패턴이다.

React 컴포넌트를 인자로 받아서 새로운 리액트 컴포넌트를 리턴하는 함수로써, HOC를 pseudo code로 다음과 같이 표현할 수 있다.

```js
const HOC = (ReactComponent) => EnhancedReactComponent
```

### HOC 구현

- axios를 통해 받은 data를 Parameter로 받은 컴포넌트에 전달하는 HOC를 구현하였다.

```js
import React, { Component } from 'react'
import axios from 'axios'

const withRequest = (url) => (WrappedComponent) => {
  return class extends Component {
    state = {
      data: null,
    }

    async initialize() {
      try {
        const response = await axios.get(url)
        this.setState({
          data: response.data,
        })
      } catch (e) {
        console.log(e)
      }
    }

    componentDidMount() {
      this.initialize()
    }

    render() {
      const { data } = this.state
      return <WrappedComponent {...this.props} data={data} />
    }
  }
}

export default withRequest
```

### HOC 사용

- 앞에서 만든 withRequest를 통해 전달받은 data를 표시해주는 Component를 구현하였다.

```js
import React, { Component } from 'react'
import withRequest from './withRequest'

class Post extends Component {
  render() {
    const { data } = this.props

    if (!data) return null

    return <div>{JSON.stringify(this.props.data)}</div>
  }
}

const PostWithData = withRequest('https://request/post/aaa')(Post)
export default PostWithData
```
