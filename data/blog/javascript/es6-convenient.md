---
title: ES6 편리한 기능
date: '2016-03-01'
tags: ['javascript']
draft: false,
summary: 'ES6에서 추가된 spec중 유용한 내용을 정리하였다.'
---

### Object \[key\] setting syntax

- 기존에는 Object literal 선언에 Variable key's value를 사용할 수 없었다.

```js
let myKey = 'key3';
let obj = {
  key1: 'One',
  key2: 'Two',
};
obj[myKey] = 'Three';
```

- ES6는 Object literal 선언에 Variable key's value를 사용할 수 있도록 해준다.

```js
let myKey = 'variableKey';
let obj = {
  key1: 'One',
  key2: 'Two',
  [myKey]: 'Three',
};
```

### Arrow Functions

- Function, return 키워드 사용없이 Arrow Function을 제공하여 simple하게 function선언할 수 있도록 해준다.

```js
// Adds a 10% tax to total
let calculateTotal = (total) => total * 1.1;
calculateTotal(10); // 11

// Cancel an event -- another tiny task
let brickEvent = (e) => e.preventDefault();
document.querySelector('div').addEventListener('click', brickEvent);
```

### find/findIndex

- Array에 find/findIndex function을 제공하여, 원하는 조건으로 매칭되는 첫번째 아이템을 찾을 수 있도록 해준다.

```js
let ages = [12, 19, 6, 4];

let firstAdult = ages.find((age) => age >= 18); // 19
let firstAdultIndex = ages.findIndex((age) => age >= 18); // 1
```

### The Spread Operator: ...

- Array 혹은 iterable object가 각각의 item으로 분리되어 전달할 수 있다.

```js
let numbers = [9, 4, 7, 1];
Math.min(...numbers); // 1

// Convert NodeList to Array
let divsArray = [...document.querySelectorAll('div')];

// Convert Arguments to Array
let argsArray = [...arguments];
```

### Default Argument Values

- Default Argument value를 설정할 수 있다.

```js
// Basic usage
function greet(name = 'Anon') {
  console.log(`Hello ${name}!`);
}
greet(); // Hello Anon!
```

### Modules

- export, import를 사용할 수 있다.

```js
//Math.js
export PI = 3.14;

var _sqrt = function (s, x, last) {
    return s + x + last;
};
export sqrt = function (s) {
    return _sqrt(s, s/2.0, 0.0);
};
export square(x) {
    return x * x;
};

//Main.js
import {PI, sqrt, square} from './Math';
console.log(PI); //3.14
console.log(sqrt(10)); //15
console.log(square(11)); //121

//Main2.js
import * as Math from './Math';
console.log(Math.PI); //3.14
console.log(Math.sqrt(10)); //15
console.log(Math.square(11)); //121
```

### Promise

- Promise를 사용할 수 있다.

```js
function timeout(duration = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (Math.random() > 0.5 ? resolve() : reject()), duration);
  });
}

function log() {
  console.log('done');
}

function error() {
  console.log('error');
}

//resolve면 done, reject면 error를 표시
timeout(100).then(log).catch(error);
```

### let/const

- Javascript의 경우, 변수가 존재하는 스코프를 만들기 위해 function으로 감쌀 필요가 있었는데, let/const를 사용하면, function만 아니라 괄호\{\}로 감싼 구역도 스코프가 된다. (블록 스코프)

```js
{
  var a = 10;
  let b = 20;
  const tmp = a;
  a = b;
  b = tmp;
}
// a는 블록 바깥에서 참조 가능
// b, tmp는 바깥에서 참조 불가능
```

---

### 참조

- [ECMAScript 6 Features](http://seokjun.kr/ecmascript-6-features)

- [Six Tiny But Awesome ES6 Features](https://davidwalsh.name/es6-features)
