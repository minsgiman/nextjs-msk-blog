---
title: State Pattern
date: '2019-05-26'
tags: ['pattern', 'javascript']
draft: false
summary: 'javascript로 구현한 State pattern'
---

#### javascript로 구현한 State pattern

```javascript
class Red {
  constructor(light) {
    this.light = light
    this.light.onRedLight()
  }

  next() {
    this.light.setState(new Green(this.light))
  }
}

class Yellow {
  constructor(light) {
    this.light = light
    this.light.onYellowLight()
  }

  next() {
    this.light.setState(new Red(this.light))
  }
}

class Green {
  constructor(light) {
    this.light = light
    this.light.onGreenLight()
  }

  next() {
    this.light.setState(new Yellow(this.light))
  }
}

class TrafficLight {
  constructor() {
    this.currentState = new Red(this)
  }

  setState(state) {
    this.currentState = state
  }

  onRedLight() {
    console.log('Red State')
  }

  onYellowLight() {
    console.log('Yellow State')
  }

  onGreenLight() {
    console.log('Green State')
  }

  next() {
    this.currentState.next()
  }
}

const trafficLight = new TrafficLight() // Red State
trafficLight.next() // Green State
trafficLight.next() // Yellow State
trafficLight.next() // Red State
```
