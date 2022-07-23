---
title: Power of generator
date: '2022-07-16'
tags: ['javascript']
draft: false,
summary: 'Custom iterables data structure'
---

## Custom iterables data structure

[iterable protocol](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)은 Javascript 객체가 iteration 동작을 정의하거나 사용하는 것을 허용한다. <br />
object가 iterable 하기 위해서 Symbol.iterator 를 key로 하는 @@iterator 메소드를 구현한다.

| Property          | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| [Symbol.iterator] | object를 반환하는, arguments 없는 function. iterator protocol 을 따른다. |

[iterator protocol](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols#iterator)은 value들의 sequence를 만드는 표준방법을 정의한다. iterator 객체는 next()메소드를 가지고 있고, next 메소드는 done, value 속성을 가진 object를 반환하도록 구현되어 있다.

아래 예제에서 iterable과 iterator 프로토콜을 준수하는 generator를 정의하여, cardDeck을 iterable 하게 만들었다.

```js
const cardDeck = {
  suits: ['♣', '♦', '♥', '♠'],
  court: ['J', 'Q', 'K', 'A'],
  [Symbol.iterator]: function* () {
    for (let suit of this.suits) {
      for (let i = 2; i <= 10; i++) yield suit + i
      for (let c of this.court) yield suit + c
    }
  },
}

[...cardDeck]
// (52) ['♣2', '♣3', '♣4', '♣5', '♣6', '♣7', '♣8', '♣9', '♣10', '♣J', '♣Q', '♣K', '♣A', '♦2', '♦3', '♦4', '♦5', '♦6', '♦7', '♦8', '♦9', '♦10', '♦J', '♦Q', '♦K', '♦A', '♥2', '♥3', '♥4', '♥5', '♥6', '♥7', '♥8', '♥9', '♥10', '♥J', '♥Q', '♥K', '♥A', '♠2', '♠3', '♠4', '♠5', '♠6', '♠7', '♠8', '♠9', '♠10', '♠J', '♠Q', '♠K', '♠A']
```

[yield\*](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/yield*) 표현식은 다른 generator 또는 iterable객체에 yield를 위임할때 사용된다. <br />
아래 예제에서 yield\* 를 통해 recursive iteration 을 구현한다.

```js
function binaryTreeNode(value) {
  let node = { value };
  node[Symbol.iterator] = function* depthFirst() {
    yield node.value;
    if (node.leftChild) yield* node.leftChild;
    if (node.rightChild) yield* node.rightChild;
  };
  return node;
}

function buildTree() {
  const root = binaryTreeNode('root');
  root.leftChild = binaryTreeNode('branch left');
  root.rightChild = binaryTreeNode('branch right');
  root.leftChild.leftChild = binaryTreeNode('leaf L1');
  root.leftChild.rightChild = binaryTreeNode('leaf L2');
  root.rightChild.leftChild = binaryTreeNode('leaf R1');
  return root;
}

const tree = buildTree();

[...tree];
// (6) ['root', 'branch left', 'leaf L1', 'leaf L2', 'branch right', 'leaf R1']
```

<br />

## lazy evaluation & infinite sequences

generator의 Lazy Evaluation 속성을 통해 효율적으로 필요한 만큼만 순회한다.

```js
function* infinityAndBeyond() {
  let i = 1;
  while (true) {
    yield i++;
  }
}

function* take(n, iterable) {
  for (let item of iterable) {
    if (n <= 0) return;
    n--;
    yield item;
  }
}

[...take(5, infinityAndBeyond())];
// (5) [1, 2, 3, 4, 5]

function* map(iterable, mapFn) {
  for (let item of iterable) {
    yield mapFn(item);
  }
}

[
  ...take(
    9,
    map(infinityAndBeyond(), (x) => x * x)
  ),
];
// (9) [1, 4, 9, 16, 25, 36, 49, 64, 81]
```

<br />

## animation

Observable 을 animation frame마다 generator를 통해 읽어와 reactive 하게 화면을 업데이트 할 수 있다.

```js
function* dateGen() {
  while (true) {
    yield Date.now();
  }
}

const genDate = dateGen();
const appEl = document.getElementById('app');

function render() {
  appEl.innerHTML = genDate.next().value;
  window.requestAnimationFrame(render);
}

render();
```

<br />

## data streams (async iteration data loading)

object의 async iterable 동작을 정의하기 위해서는 [Symbol.asyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) 를 key로 하는 @@asyncIterator 메소드를 구현한다. <br />
Symbol.asyncIterator를 정의하면 해당 object는 [for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) 에서 사용할 수 있다.

아래 예제에서 nextUrl이 없을때까지 순차적으로 API를 호출한다.

```js
getSwapiPagerator = (endpoint) =>
  async function* () {
    let nextUrl = `https://swapi.dev/api/${endpoint}`;
    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();
      nextUrl = data.next;
      yield data.results;
    }
  };

const starWars = {
  characters: {
    [Symbol.asyncIterator]: getSwapiPagerator('people'),
  },
  planets: {
    [Symbol.asyncIterator]: getSwapiPagerator('planets'),
  },
  ships: {
    [Symbol.asyncIterator]: getSwapiPagerator('starships'),
  },
};

for await (const page of starWars.characters) {
  for (const character of page) {
    console.log(character.name);
  }
}
```

<br />

## State Machines

yield 는 value를 받을수도 있고 내보낼 수도 있다.

`let balance = yield;` 에서 balance에는 밖에서 전달받은 value가 할당된다. <br />
`yield balance;` 는 balance를 밖으로 전달한다.

이를 이용하여 아래 예제처럼 State Machines으로 활용할 수 있다.

```js
function* bankAccount() {
  let balance = 0;
  while (balance >= 0) {
    balance += yield balance;
  }
  return 'bankrupt!';
}

let acct = bankAccount();
acct.next(); // {value: 0, done: false}
acct.next(50); // {value: 50, done: false}
acct.next(-10); // {value: 40, done: false}
acct.next(-60); // {value: 'bankrupt!', done: true}
```

<br />

## generators can function as coroutines

제어권을 넘겨주고 다시 받을 수 있어서 여러개의 generator간에 상호작용을 구현할 수 있다.

```js
let players = {};
let queue = [];

function send(name, msg) {
  console.log(msg);
  queue.push([name, msg]);
}

function run() {
  while (queue.length) {
    let [name, msg] = queue.shift();
    players[name].next(msg);
  }
}

function* knocker() {
  send('asker', 'knock knock');
  let question = yield;
  if (question !== "who's there?") return;
  send('asker', 'gene');
  question = yield;
  if (question !== 'gene who?') return;
  send('asker', 'generator!');
}

function* asker() {
  let knock = yield;
  if (knock !== 'knock knock') return;
  send('knocker', "who's there?");
  let answer = yield;
  send('knocker', `${answer} who?`);
}

players.knocker = knocker();
players.asker = asker();
send('asker', 'asker get ready...'); // call first .next()
send('knocker', 'knocker go!'); // start the conversation
run();

// asker get ready...
// knocker go!
// knock knock
// who's there?
// gene
// gene who?
// generator!
```

---

### 참고

- [The Power of JS Generators](https://www.youtube.com/watch?v=gu3FfmgkwUc&list=LL&index=1&t=2s)

- [the-power-of-js-generators](https://observablehq.com/@anjana/the-power-of-js-generators)

- [Symbol.iterator, 내장 이터레이터, (iterator 객체).next(), 제너레이터](https://valuefactory.tistory.com/279)

- [JavaScript async iterators](https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/)
