---
title: NoSQL Couchbase DB
date: '2018-05-11'
tags: ['nosql db', 'backend']
draft: false
summary: 'Couchbase DB는 Document 기반의 Key-Value 스토어이다. 뷰, 맵&리듀스 함수, 클러스터링 등을 지원한다.'
---

### Document 기반의 Key-Value 스토어

- 키는 최대 250 바이트, 값(밸류)의 경우에는 카우치베이스 버킷의 경우 20MB, Memcached 방식의 버킷의 경우 1MB 까지 저장이 가능하다.
- 저장할때, 키와 값뿐만 아니라 메타데이타가 같이 저장되는데, 메타 데이타에는 CAS,TTL,Flag 값 3가지가 저장된다.
- CAS는 데이타에 대한 일종의 타임 스탬프와 같은 개념으로, 여러 클라이언트가 같이 데이타를 ACCESS 했을때, 일관성(Consistent) 문제가 생기는 것을 해결해줄 수 있다.
- TTL 은 Time To Live 로, 데이타의 유효 시간을 정의한다.
- FLAG는 카우치베이스 클라이언트에서 사용하는 메타데이타 이다

### 뷰 (view)

- incremental view 컨셉을 가지고 있다.

- 데이터가 버킷에 저장될 때마다 생성된 뷰에 같이 저장되는데, 이때 뷰코드(View Code - Map & Reduce) 라는 로직을 통해서 뷰에 저장된다.

- 키-밸류 스토어 기능만 제공하는 일반 NoSQL에 비해서 filtering 뿐만 아니라, Indexing,grouping,ordering과 같은 다양한 기능을 이 뷰를 이용하여 사용할 수 있다.

### 맵&리듀스 함수

- 맵함수는 두개의 인자를 전달받는다. "doc"는 버킷내의 저장된 개별 데이타로 각 데이터별로 id와 JSON 도큐먼트의 값을 갖는다.

- "meta"는 그 데이터에 대한 메타 데이터 (flag, css 값등)을 리턴한다.

- 맵함수에서 이렇게 받은 개별 데이터를 emit함수로 가공하여 리턴한다.

- emit(인자1, 인자2)의 인자1은 뷰의 KEY값을 리턴하고, 인자2는 뷰의 Value값을 리턴한다.

- 맵함수를 끝내면 ID(원래 Data ID),KEY,VALUE 형식의 데이터셋이나오고, 이를 "Index"라고 부른다.

```js
function(doc, meta){
    emit(doc.role, doc.country);
}
```

- 저장된 Index를 이용해서 Reduce함수를 실행할 수 있고, Reduce함수를 이용해서는 Grouping 기능을 사용할 수 있다.

### 노드별 메모리 레이아웃

- 카우치베이스의 경우, memcached를 이용하는 만큼 서버의 메모리 공간 계산이 매우 중요하다.
- 카우치 베이스는 버킷의 키를 모두 메모리에 로딩해놓고 있다. 최소 메모리 공간은 전체키의 합보다는 최소한 커야 한다.그리고 각 도큐먼트당 60바이트의 메타 정보 저장공간이 필요하다. (키크기 + 60 바이트)_전체레코드수 / 노드수 _ 3 (복제본수) 가 노드당 최소 메모리양이다.

### 카우치베이스 서버 클러스터는 1개 부터 1024개 까지 노드로 구성 될 수 있다.

- 노드 하나가 하나의 카우치베이스 인스턴스.

- 데이터는 클러스터내 노드들에서 파티션되고 분산된다.

### 카우치베이스 서버는 두개의 주요 컴포넌트가 있다. (클러스터 매니저, 데이터 매니저)

- 클러스터 매니저

  - 클러스터내 노드 설정
  - 노드간 데이터 rebalancing
  - 페일오버 후 데이터 복제 핸들링
  - 통계자료 수집, 로깅
  - 클라이언트가 어디서 데이터를 찾아야 하는지 알려줄 수 있게 클러스터 맵(Cluster map)을 업데이트하며 관리한다.
  - 어드민 API를 노출하고 있고 웹 매니징 콘솔도 있다.
  - 클러스터 매니저는 distributed, concurrent 한 처리에 적합 하도록 Erlang/OTP로 만들어졌다.

- 데이터 매니저

  - 데이터 저장소와 검색에대한 관리
  - 메모리 케시 레이어, Disk Persistence Mechanism, 쿼리 엔진을 포함하고 있다
  - 카우치베이스 클라이언트는 카우치베이스 매니저가 제공하는 클라이언트 맵을 사용한다. 이 맵을 통해 필요한 데이터를 가진 노드를 찾고 그 노드와 통신한다.

### 데이터 스토리지

- 카우치베이스는 데이터를 버킷에 관리한다.

  - 리소스와 연관된 로지컬한 그룹이다.

- 두가지의 버킷종류를 제공한다. (카우치베이스, 멤케시)

- memcache 버킷

  - 1MB 크기의 메모리에 바이너리로 데이터를 저장한다.
  - 데이터를 디스크에 저장하지 않는다.
  - Redundancy 하려고 노드에 데이터를 복제 하지 않는다.

- 카우치베이스 버킷

  - JSON Document, Primitive data 타입이나 Binary blob 형태로 20MB 까지 데이터를 저장 할 수 있다.
  - 데이터는 메모리에 캐시되고 디스크에 저장된다.
  - 데이터는 부하분산을 위해 클러스터 내에서 노드간에 동적으로 Rebalance된다.
  - 데이터가 하나에서 세게까지 복제되도록 설정 가능하다.
  - Document는 vBuckets ( 가상버킷 )으로 클러스터내에 세분화 된다.

### 메타데이터

- 데이터가 저장될 때 Expiration, Check-and-Set, Flags와 같은 동작을 위한 부가정보를 생성

- 내부적으로 사용할 정보도 저장 ( Data format: JSON, Base64, Revision, Id)

- 2.1 이상에서는 Document당 메타데이터 크기는 56 Bytes를 사용

### Client Libraries Thread Safety

- .NET, Java SDK는 커넥션을 재사용 할 때 Thread safety를 보장할 수 있다.

- C client library는 Thread safe 하지 않다. #libcouchbase

  - Python, PHP, Ruby SDK는 libcouchbase 에 의존하고 있고, 여러 쓰레드가 같은 클라이언트 커넥션 객체에 엑세스 하지 않음
  - Node.js 역시 libcouchbase 사용하고, 근본적으로 싱글 쓰레드라 이슈가 아님. 클러스터와 같이 멀티코어 모듈을 사용한다면 카우치베이스 커넥션 객체를 각 쓰레드마다 생성해야 함

### 카우치베이스 클라이언트 초기화

- 클라이언트를 최초 생성할 때 클러스터 설정을 검색해야함.

  - 클러스터에 대한 정보를 받을 수 있는 HTTP API 있음
  - ServersList: 모든 서버와 서버들의 상태
  - vBucketsMap: vBuckets 리스트. 서버맵에서의 인덱스 정보등,,

- Document를 저장하고 검색하려면 클라이언트는 1~1024사이의 번호를 받는다. ( Document가 저장된 vBcuket 번호 )

- 클러스터 맵이 한번 생성된 이후로는 클라이언트는 HTTP Long Polling 같은걸로 node에 계속 query 하고 Noti 받음

### Document 저장과 검색

- Key Access와 View Querying는 포트를 달리 사용함

- 키 기반 사용은

  - Memcached binary protocol 사용
  - 대부분 카우치베이스 클라이언트 라이브러리는 멤케시 클라이언트 라이브러리 기반
