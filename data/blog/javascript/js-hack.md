---
title: Javascript Hacks
date: '2018-08-09'
tags: ['javascript']
draft: false,
summary: 'Replace All | Extract Unique Values | Convert string to number | Converting NodeList to Arrays ...'
---

### Replace All

- es2021에서 String.prototype.replaceAll() 이 추가될 예정이다.

```js
var example = 'pot pot';
console.log(example.replace(/pot/, 'tom'));
// "tom pot"
console.log(example.replace(/pot/g, 'tom'));
// "tom tom"
```

### Extract Unique Values

```js
var entries = [1, 2, 2, 3, 4, 5, 6, 6, 7, 7, 8, 4, 2, 1];
var unique_entries = [...new Set(entries)];
console.log(unique_entries);
// [1, 2, 3, 4, 5, 6, 7, 8]
```

### Convert string to number

```js
the_string = '123';
console.log(+the_string);
// 123
the_string = 'hello';
console.log(+the_string);
// NaN
```

### Converting NodeList to Arrays

```js
var elements = document.querySelectorAll('p'); // NodeList
var arrayElements = Array.from(elements); // Array
```

### Getting the last item in the array

```js
var array = [1, 2, 3, 4, 5, 6];
console.log(array.slice(-1)); // [6]
console.log(array.slice(-2)); // [5,6]
console.log(array.slice(-3)); // [4,5,6]
```

### Shuffle elements from array

```js
var my_list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log(
  my_list.sort(function () {
    return Math.random() - 0.5;
  })
);
// [4, 8, 2, 9, 1, 3, 6, 5, 7]
```

### Flatten multidimensional array

```js
var entries = [1, [2, 5], [6, 7], 9];
var flat_entries = [].concat(...entries);
// [1, 2, 5, 6, 7, 9]
```
