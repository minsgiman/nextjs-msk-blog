---
title: bridge pattern
date: '2020-11-11'
tags: ['pattern', 'javascript']
draft: false
summary: 'javascript로 구현한 bridge pattern'
---

#### javascript로 구현한 bridge pattern

```javascript
class Circle {
  color = null

  constructor(color) {
    this.color = color
  }
  toString() {
    return `${this.color.getColorName()} Circle`
  }
}
class Rectangle {
  color = null

  constructor(color) {
    this.color = color
  }
  toString() {
    return `${this.color.getColorName()} Rectangle`
  }
}
class Triangle {
  color = null

  constructor(color) {
    this.color = color
  }
  toString() {
    return `${this.color.getColorName()} Triangle`
  }
}

class Red {
  getColorName() {
    return 'Red'
  }
}
class Blue {
  getColorName() {
    return 'Blue'
  }
}
class Green {
  getColorName() {
    return 'Green'
  }
}

const redColor = new Red()
const blueColor = new Blue()
const greenColor = new Green()

const redCircle = new Circle(redColor)
const blueCircle = new Circle(blueColor)
const greenRectangle = new Rectangle(greenColor)

console.log(redCircle.toString()) // Red Circle
console.log(blueCircle.toString()) // Blue Circle
console.log(greenRectangle.toString()) // Green Rectangle
```
