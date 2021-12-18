---
title: flexbox를 사용한 Image 중앙에 위치시키기
date: '2020-11-11'
tags: ['css']
draft: false
summary: '아래의 horizontal div에서는 row방향으로 중앙정렬하고 vertical div에서는 column방향으로 중앙정렬하여 이미지가 중앙에 위치된다.'
---

- 아래의 horizontal div에서는 row방향으로 중앙정렬하고 vertical div에서는 column방향으로 중앙정렬하여 이미지가 중앙에 위치된다.

```css
div.horizontal {
  display: flex;
  justify-content: center;
}

div.vertical {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

```html
<div class="horizontal">
  <div class="vertical">
    <img src="img-source" />
  </div>
</div>
```
