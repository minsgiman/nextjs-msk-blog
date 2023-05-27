---
title: ChatGPT Prompts for Web Developers
date: '2023-05-13'
tags: ['chatgpt', 'ai', 'frontend']
draft: false
summary: '웹 개발자로써 ChatGPT 를 사용할 때 유용하게 활용할 수 있는 Prompt 정리'
---

웹 개발자로써 ChatGPT 를 사용할 때 유용하게 활용할 수 있는 Prompt 정리 <br />
Prompt는 https://chat.openai.com/ 에서 실행할 수 있다.

---

## Prompt 목차

- [Code generation](#code-generation)
  + [1. html and css](#1-html-and-css)
  + [2. Javascript function](#2-javascript-function)
  + [3. write API code](#3-write-api-code)
  + [4. write database query](#4-write-database-query)
- [Code completion](#code-completion)
  + [1. 기존 코드 문맥, 스타일에 맞춰서 미작성 부분을 완성시켜준다.](#1----------------------------------)
- [Code conversion](#code-conversion)
  + [1. language or framework](#1-language-or-framework)
  + [2. CSS framework](#2-css-framework)
- [Code explanation](#code-explanation)
  + [1. explain snippet](#1-explain-snippet)
- [Code review](#code-review)
  + [1. code smells and suggest improvements](#1-code-smells-and-suggest-improvements)
  + [2. security vulnerabilities](#2-security-vulnerabilities)
- [Code refactor](#code-refactor)
  + [1. error handling and resilience](#1-error-handling-and-resilience)
  + [2. modular](#2-modular)
  + [3. performance](#3-performance)
  + [4. responsive for device](#4-responsive-for-device)
  + [5. simplify complex condition](#5-simplify-complex-condition)
- [Bug detection and fixing](#bug-detection-and-fixing)
  + [1. find bugs](#1-find-bugs)
  + [2. error fix](#2-error-fix)
- [System design and architecture](#system-design-and-architecture)
  + [1.design system](#1design-system)
- [Search Engine Optimization](#search-engine-optimization)
  + [1. HTML head for SEO](#1-html-head-for-seo)
- [Testing](#testing)
  + [1. unit test](#1-unit-test)
- [Shell commands](#shell-commands)
  + [1. shell command](#1-shell-command)
  + [2. git command](#2-git-command)
  + [3. explain command](#3-explain-command)
- [Regular expressions](#regular-expressions)
  + [1. explain regular expression](#1-explain-regular-expression)
  + [2. generate regular expression](#2-generate-regular-expression)
- [Learning](#learning)
  + [1. best practices](#1-best-practices)
  + [2. explain and find ways](#2-explain-and-find-ways)
  + [3. explain differences](#3-explain-differences)

---

## Code generation

#### 1. html and css

* **Prompt:** Generate a semantic and accessible HTML and (framework) CSS [UI component] consisting of [component parts]. The [component parts] should be [layout].
* **Example:** Generate a semantic HTML and Tailwind CSS "Contact Support" form consisting of the user's name, email, issue type, and message. The form elements should be stacked vertically and placed inside a card.

#### 2. Javascript function

* **Prompt:** Write a JavaScript function. It accepts [input] and returns [output].
* **Example:** Write a JavaScript function. It accepts a full name as input and returns avatar letters.

#### 3. write API code

* **Prompt:** Write a/ an [framework] API for [functionality]. It should make use of [database].
* **Example:** Write an Express.js API to fetch the current user's profile information. It should make use of MongoDB.

#### 4. write database query

* **Prompt:** The database has [comma-separated table names]. Write a [database] query to fetch [requirement].
* **Example:** The database has students and course tables. Write a PostgreSQL query to fetch a list of students who are enrolled in at least 3 courses.

## Code completion

#### 1. 기존 코드 문맥, 스타일에 맞춰서 미작성 부분을 완성시켜준다.

* **Prompt:** Complete the code [code snippet]
* **Example:** 
 
Complete the code:

```js
const animals = ["dogs", "cats", "birds", "fish"];
let animal = animals[Math.floor(Math.random() * animals.length)];

switch (animal) {
  case "dogs":
    console.log(
      "Dogs are wonderful companions that bring joy and loyalty into our lives. Their wagging tails and wet noses never fail to make us smile."
    );
    break;
}
```

코드를 prompt에 넣을 때는 아래와 같이 넣는다. <br />
\`\`\`js <br />
[code] <br />
\`\`\`

## Code conversion

#### 1. language or framework

* **Prompt:** Convert the below code snippet from [language/ framework] to [language/ framework]: [code snippet]
* **Example:**

Convert the below code snippet from JavaScript to TypeScript

```js
function nonRepeatingWords(str1, str2) {
  const map = new Map();
  const res = [];
  // Concatenate the strings
  const str = str1 + " " + str2;
  // Count the occurrence of each word
  str.split(" ").forEach((word) => {
    map.has(word) ? map.set(word, map.get(word) + 1) : map.set(word, 1);
  });
  // Select words which occur only once
  for (let [key, val] of map) {
    if (val === 1) {
      res.push(key);
    }
  }
  return res;
}
```

#### 2. CSS framework

* **Prompt:** Convert the below code using [CSS framework] to use [CSS framework]: [code snippet]
* **Example:** Convert the below code using Bootstrap to use Tailwind CSS: [code snippet]

## Code explanation

#### 1. explain snippet

* **Prompt:** Explain the following [language] snippet of code: [code block]


## Code review

#### 1. code smells and suggest improvements

* **Prompt:** Review the following [language] code for code smells and suggest improvements: [code block]

#### 2. security vulnerabilities

* **Prompt:** Identify any security vulnerabilities in the following code: [code snippet]

## Code refactor

#### 1. error handling and resilience
* **Prompt:** Refactor the given [language] code to improve its error handling and resilience: [code block]

#### 2. modular
* **Prompt:** Refactor the given [language] code to make it more modular: [code block]

#### 3. performance
* **Prompt:** Refactor the given [language] code to improve performance: [code block]

#### 4. responsive for device 
* **Prompt:** Refactor the below component code to be responsive across mobile, tablet, and desktop screens: [code block]

#### 5. simplify complex condition
* **Prompt:** Suggest ways to simplify complex conditionals and make them easier to read and understand: [code snippet]

## Bug detection and fixing

#### 1. find bugs
* **Prompt:** Find any bugs in the following code: [code snippet]

#### 2. error fix
* **Prompt:** I am getting the error [error] from the following snippet of code: [code snippet]. How can I fix it?

## System design and architecture

#### 1.design system

* **Prompt:** You are an expert at system design and architecture. Tell me how to design a [system]. The technology stack is [comma-separated list of technologies].
* **Example:** You are an expert at system design and architecture. Tell me how to design a hotel reservation system. The technology stack is Next.js and Firebase.

## Search Engine Optimization

#### 1. HTML head for SEO
* **Prompt:** Give an example \<head\> section of the HTML code that is optimized for Search Engine Optimization (SEO) for a [website]
* **Example:** Give an example \<head\> section of the HTML code that is optimized for Search Engine Optimization (SEO) for a social networking site for athletes

## Testing

#### 1. unit test
* **Prompt:** Write unit tests for the following [library/ framework] [function / component / etc] using [testing framework/ library]
* **Example:** 

Write unit tests for the following Javascript function using Jest as the testing framework:

```js
function nonRepeatingWords(str1, str2) {
  const map = new Map();
  const res = [];
  // Concatenate the strings
  const str = str1 + " " + str2;
  // Count the occurrence of each word
  str.split(" ").forEach((word) => {
    map.has(word) ? map.set(word, map.get(word) + 1) : map.set(word, 1);
  });
  // Select words which occur only once
  for (let [key, val] of map) {
    if (val === 1) {
      res.push(key);
    }
  }
  return res;
}
```

## Shell commands

#### 1. shell command
* **Prompt:** Write a shell command to [requirement]
* **Example:** Write a shell command to delete all files with the extension '.log' in the 'logs' folder

#### 2. git command
* **Prompt:** Write a git command to [requirement]
* **Example:** Write a git command to undo the previous commit

#### 3. explain command
* **Prompt:** Explain the following command [command]
* **Example:** Explain the following command [git switch -c feat/qwik-loaders]

## Regular expressions

#### 1. explain regular expression

* **Prompt:** Explain this regular expression: [regex]
* **Example:** 
 
Explain this regular expression in JavaScript: 

```js
const regex = /^[A-Za-z0–9._%+-]+@[A-Za-z0–9.-]+\\.[A-Za-z]{2,}$/;
```

#### 2. generate regular expression

* **Prompt:** Your role is to generate regular expressions that match specific patterns in text. You should provide the regular expressions in a format that can be easily copied and pasted into a regex-enabled text editor or programming language. Generate a regular expression javascript code that matches [text]
* **Example:** Your role is to generate regular expressions that match specific patterns in text. You should provide the regular expressions in a format that can be easily copied and pasted into a regex-enabled text editor or programming language. Generate a regular expression javascript code that matches 010-0000-0000

## Learning

#### 1. best practices
* **Prompt:** What are the best practices when creating a login form?
* **Prompt:** What are some best practices for writing clean and maintainable code in [language/framework]?

#### 2. explain and find ways
* **Prompt:** Explain the importance of web accessibility and list three ways to ensure a website is accessible

#### 3. explain differences
* **Prompt:** What are the differences between [list of similar concepts] in [language/ framework]
* **Example:** What are the differences between var, let, and const keywords in JavaScript

---

### 참조

- [50+ ChatGPT Prompts for Web Developers](https://www.builder.io/blog/ai-prompts-for-web-developers-chatgpt)

- [MUST KNOW ChatGPT Prompts for Web Developers](https://www.youtube.com/watch?v=t29DAgJ1wcU)
