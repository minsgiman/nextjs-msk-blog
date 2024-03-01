---
title: DFS 문제 풀이
date: '2023-03-02'
tags: ['algorithm', 'javascript']
draft: false
summary: ''
---

### 문제

세로길이가 n 가로길이가 m인 격자 모양의 땅 속에서 석유가 발견되었습니다. 석유는 여러 덩어리로 나누어 묻혀있습니다. 당신이 시추관을 수직으로 단 하나만 뚫을 수 있을 때, 가장 많은 석유를 뽑을 수 있는 시추관의 위치를 찾으려고 합니다. 시추관은 열 하나를 관통하는 형태여야 하며, 열과 열 사이에 시추관을 뚫을 수 없습니다.

<img src="/static/images/dfs-practice-1.png" />

예를 들어 가로가 8, 세로가 5인 격자 모양의 땅 속에 위 그림처럼 석유가 발견되었다고 가정하겠습니다. 상, 하, 좌, 우로 연결된 석유는 하나의 덩어리이며, 석유 덩어리의 크기는 덩어리에 포함된 칸의 수입니다. 그림에서 석유 덩어리의 크기는 왼쪽부터 8, 7, 2입니다.

<img src="/static/images/dfs-practice-2.png" />

시추관은 위 그림처럼 설치한 위치 아래로 끝까지 뻗어나갑니다. 만약 시추관이 석유 덩어리의 일부를 지나면 해당 덩어리에 속한 모든 석유를 뽑을 수 있습니다. 시추관이 뽑을 수 있는 석유량은 시추관이 지나는 석유 덩어리들의 크기를 모두 합한 값입니다. 시추관을 설치한 위치에 따라 뽑을 수 있는 석유량은 다음과 같습니다.

<img src="/static/images/dfs-practice-3.png" width="400" />

오른쪽 그림처럼 7번 열에 시추관을 설치하면 크기가 7, 2인 덩어리의 석유를 얻어 뽑을 수 있는 석유량이 9로 가장 많습니다. <br />
석유가 묻힌 땅과 석유 덩어리를 나타내는 2차원 정수 배열 land가 매개변수로 주어집니다. 이때 시추관 하나를 설치해 뽑을 수 있는 가장 많은 석유량을 return 하도록 solution 함수를 완성해 주세요.

### 풀이

```javascript
const IMove = [-1, 0, 1, 0];
const JMove = [0, -1, 0, 1];
const moveLength = IMove.length;

function solution(land) {
    const n = land.length;
    const m = land[0].length;

    const visited = Array.from({ length : n }, () => Array(m).fill(0));
    const jOilResult = Array(m).fill(0);
    let jSet = new Set([]);
    let eachOilResult = 0;

    const dfs = (i, j) => {
        eachOilResult += 1;
        jSet.add(j);

        for (let k = 0; k < moveLength; k++) {
            const nextI = i + IMove[k];
            const nextJ = j + JMove[k];

            if (nextI < 0 || nextI >= n || nextJ < 0 || nextJ >= m || visited[nextI][nextJ] === 1) {
                continue;
            }
            visited[nextI][nextJ] = 1;
            if (land[nextI][nextJ] === 1) {
                dfs(nextI, nextJ);
            }
        }
    };

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (visited[i][j]) {
                continue;
            }
            visited[i][j] = 1;

            if (land[i][j] === 1) {
                eachOilResult = 0;
                jSet = new Set([]);
                dfs(i, j);
                jSet.forEach((markedJ) => {
                    jOilResult[markedJ] += eachOilResult;
                });
            }
        }
    }

    return Math.max(...jOilResult);
}

console.log(solution([[0, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0], [1, 1, 0, 0, 0, 1, 1, 0], [1, 1, 1, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 1, 1]])); // 9
```
