---
title: Web Crypto 사용
date: '2023-09-02'
tags: ['javascript', 'frontend', 'security']
draft: false,
summary: 'Web Crypto API는 웹 애플리케이션에서 암호화 및 복호화 작업을 수행하기 위한 JavaScript API다.'
---

### Web Crypto API 란?

Web Crypto API는 웹 애플리케이션에서 암호화 및 복호화 작업을 수행하기 위한 JavaScript API다.

이 API는 웹 브라우저에서 암호화 기능을 사용할 수 있게 해주며, 다양한 암호화 알고리즘과 작업을 수행하는 메서드를 제공한다.

Web Crypto API는 웹 애플리케이션에서 보안 요구사항을 충족하기 위해 다양한 암호화 작업을 수행할 수 있다. 예를 들면 다음과 같은 작업을 수행할 수 있다

* **대칭 키 암호화 (Symmetric Key Encryption)**: AES-GCM, AES-CBC 등과 같은 대칭 암호화 알고리즘을 사용하여 데이터를 암호화하고 복호화합니다. 이는 같은 키를 사용하여 암호화와 복호화를 수행하는 방식입니다.
* **비대칭 키 암호화 (Asymmetric Key Encryption)**: RSA, ECDSA 등과 같은 공개키 암호화 알고리즘을 사용하여 데이터를 암호화하고, 개인 키로만 복호화할 수 있습니다.
* **해시 함수 (Hash Functions)**: SHA-1, SHA-256, SHA-512 등과 같은 해시 함수를 사용하여 메시지나 데이터의 무결성을 검증하거나 암호화되지 않은 비밀번호를 안전하게 저장할 수 있습니다.
* **난수 생성 (Random Number Generation)**: 암호학적으로 안전한 난수를 생성할 수 있습니다. 이는 암호 키나 초기화 벡터 등의 보안에 필요한 임의의 값을 생성하는 데 사용됩니다.

Web Crypto API는 Promise 기반의 비동기 방식으로 작동하며, 웹 브라우저에서 기본으로 제공된다.

이 API는 웹 애플리케이션에서 암호화 관련 작업을 수행할 수 있도록 간편한 인터페이스를 제공하여 개발자가 보안 요구사항을 충족시킬 수 있도록 도와준다.

<br />

### Web Crypto API 사용 방법

#### SubtleCrypto

Web Crypto API는 [https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto](SubtleCrypto) 인터페이스를 통해 표준화되었다. <br />
`SubtleCrypto`는 `window.crypto.subtle` 를 통해 접근한다.

<br />

#### Encryption

여기서는 대칭키 알고리즘을 사용한다. 대칭키 암호화는 암호화, 복호화에 같은 key를 사용한다.

[지원되는 여러 대칭키 알고리즘](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#supported_algorithms)이 있지만 여기서는 Authenticated Encryption(인증암호화) 알고리즘으로 그 중에 `AES-GCM`를 사용한다.

그러면 [Authenticated Encryption(인증암호화)](https://en.wikipedia.org/wiki/Authenticated_encryption) 알고리즘이 무엇인가?

데이터나 주요 정보를 안전하게 저장하는 목적이 아니라, **인터넷과 같은 통신 매체를 통하여 안전하게 전달하고자 하는 경우는 기밀성, 무결성, 인증기능이 함께 요구**되어 진다.

* 기밀성(Confidentiality) : 암호키를 소유하지 않은 제3자는 암호문을 해독할 수 없음
* 무결성(Integrity) : 데이타의 위조/변조를 방지함
* 인증(Authentication) : 허가 받은 사용자(암호키 소유자) 여부 확인

위의 각 기능을 구현하기 위해 사용되는 암호 알고리즘은 각각 존재하며, 대표되는 알고리즘은 아래와 같다.

* 기밀성 : 대칭키 알고리즘 사용(SEED, AES 등)
* 무결성 : 해쉬 알고리즘 사용(SHA-2)
* 인증 : MAC 알고리즘 또는 HMAC(Hash MAC) 알고리즘 사용

예를 들면, 금융거래에 있어서, 500만원을 보내라는 메시지를 안전하게 전달하기 위하여 암호화만시켜 보내면, 공격자가 암호문 속에 있는 특정 데이터를 조작하여 500만원을 5억원으로 변경시킬 경우, 수신자가 위조 사항을 알아채지 못한다.

이러한 위험성을 방지하기 위하여, 암호화 시킨 다음에 인증코드를 추가하여 보내는 것이다.

이러한 기능을 한번에 수행하는 암호 알고리즘을 **Authenticated Encryption(인증 암호화) 알고리즘**이라고 부른다. 아래의 그림에서 개념적인 설명을 보여주고 있다.

<img src="/static/images/etm.jpg" />

**Authenticated Encryption 알고리즘**에는 독립된 전용 알고리즘이 있는 것이 아니라, 대칭키 알고리즘을 사용하여 특별한 모드로 구현하고 있다. <br />
NIST에서 규정한 모드로는 GCM(Galois/Counter Mode), CCM(Counter with CBC-MAC) 모드가 있다.

**Authenticated Encryption 알고리즘**은 `메시지에 대한 암호화` 와 `메시지 인증 코드 생성`을 함께 수행하는 데, 두 과정의 수행 시점에 따라 세분화 되어 진다. <br />
위의 그림과 같은 순서로 하는 방식을 EtM(Encrypt-then-MAC) 이라 하며, IPsec 암호통신 구현 시에 사용되어 지고 있다. `AES-GCM`은 EtM 방식으로 구현되어 있다.

<br />

#### Generating a Key

그러면 이제 본격적으로 암호화를 구현해보자 <br />
암호화하기 위해 먼저 대칭키를 생성해야 한다. <br />
* 참고 : https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey

```js
const generateKey = async () => {
  return window.crypto.subtle.generateKey({
    name: 'AES-GCM',
    length: 256,
  }, true, ['encrypt', 'decrypt'])
}
```

<br />

#### Encoding Data

암호화 하기 전에 데이터를 byte stream으로 인코딩한다. `TextEncoder` class를 이용하여 할 수 있다. <br />
* 참고 : https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder

```js
const encode = (data) => {
  const encoder = new TextEncoder()
  return encoder.encode(data)
}
```

<br />

#### Generating an Initialization Vector (IV)

[Initialization Vector](https://www.techtarget.com/whatis/definition/initialization-vector-IV)의 는 랜덤값으로써, secret key와 함께 암호화에 사용된다.

<img src="/static/images/iv.png" />

IV는 데이터 암호화에서 이전의 일반 text 시퀀스와 동일한 일반 text 시퀀스가 동일한 암호문을 생성하지 못하도록 방지한다. <br />
공격자가 동일하게 암호화된 데이터를 여러 번 볼 경우 원래 값을 해독하고 해석할 수 있는 단서를 얻게되기 때문이다.

IV의 생성은 다음과 같이 할 수 있다. <br />
* 참고 : https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams

```js
const generateIv = () => {
  return window.crypto.getRandomValues(new Uint8Array(12))
}
```

<br />

#### Encrypting Data

이제 암호화에 필요한 것들을 갖췄기 때문에 encrypt 함수를 구현한다. <br />
encrypt 함수에서 암호화된 데이터와 IV(이후에 decrypt하기 위해서)를 return한다.

* 참고 : https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt

```js
const encrypt = async (data, key) => {
  const encoded = encode(data)
  const iv = generateIv()
  const cipher = await window.crypto.subtle.encrypt({
    name: 'AES-GCM',
    iv: iv,
  }, key, encoded)
  return {
    cipher,
    iv,
  }
}
```

<br />

#### Transmission and Storage

암호화된 데이터는 네트워크로 전송되거나 storage에 저장된다. <br />
위의 예제에서 `SubtleCrypto`를 사용하여 결과로 얻은 암호화된 cipher 및 IV는 binary 데이터 버퍼 형태이다. <br />
이는 전송이나 저장에 이상적인 형식이 아니므로, 전송이나 저장에 이상적인 base64 형태로 encoding, decoding 해야한다.


##### Why Base64??
Base64 Encoding을 하게되면 전송해야 될 데이터의 양도 약 33% 정도 늘어난다. 6bit당 2bit의 Overhead가 발생하기 때문이다. Encoding전 대비 33%나 데이터의 크기가 증가하고, Encoding과 Decoding에 추가 CPU 연산까지 필요한데 우리는 왜 Base64 Encoding을 하는가?

문자를 전송하기 위해 설계된 Media(Email, HTML)를 이용해 플랫폼 독립적으로 Binary Data(이미지나 오디오)를 전송 할 필요가 있을 때, ASCII로 Encoding하여 전송하게 되면 여러가지 문제가 발생할 수 있다. 

대표적인 문제는 
* ASCII는 7 bits Encoding인데 나머지 1bit를 처리하는 방식이 시스템 별로 상이하다. 
* 일부 제어문자 (e.g. Line ending)의 경우 시스템 별로 다른 코드값을 갖는다.

위와 같은 문제로 **ASCII는 시스템간 데이터를 전달하기에 안전하지가 않다.** Base64는 ASCII 중 제어문자와 일부 특수문자를 제외한 64개의 **안전한 출력 문자**만 사용한다. (* 안전한 출력 문자는 문자 코드에 영향을 받지 않는 공통 ASCII를 의미한다).

즉, **"Base64는 HTML 또는 Email과 같이 문자를 위한 Media에 Binary Data를 포함해야 될 필요가 있을 때, 포함된 Binary Data가 시스템 독립적으로 동일하게 전송 또는 저장되는걸 보장하기 위해 사용한다"** 라고 정리 할 수 있을 것 같다.

<br />

#### Packing Data

binary 데이터를 base64로 인코딩한다.

* 참고 : https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String

```js
const pack = (buffer) => {
  return window.btoa(
    String.fromCharCode.apply(null, new Uint8Array(buffer))
  )
}
```

<br />

#### Unpacking Data

데이터를 전송 또는 저장후에 원본 data를 다시 읽을 때는 앞의 프로세스를 반대로 진행하면 된다. <br />
base64로 인코딩된 문자열을 다시 raw binary 버퍼로 변환한다.

* 참고 : https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String

```js
const unpack = (packed) => {
  const string = window.atob(packed)
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}
```

<br />

#### Decoding Data

암호를 해독한 후에는 결과 byte stream을 원래 형식으로 다시 디코딩해야 한다. <br /> 
이를 위해 `TextDecoder` 클래스를 사용한다.

* 참고 : https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder

```js

const decode = (bytestream) => {
  const decoder = new TextDecoder()
  return decoder.decode(bytestream)
}
```

<br />

#### Decrypting Data

이제 decrypt 함수만 구현하면 된다. 이를 위해 앞에서 언급했듯이 key뿐만 아니라 암호화 단계에서 사용된 IV도 필요하다.

* 참고 : https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt

```js

const decrypt = async (cipher, key, iv) => {
  const encoded = await window.crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: iv,
  }, key, cipher)
  return decode(encoded)
}
```

<br />

#### Putting it into Practice

이제 모든 유틸리티가 구현되었으므로 이를 사용해본다. <br />
데이터를 암호화하고 인코딩하여 안전한 endpoint로 전송한다. 그런 다음 다시 endpoint로부터 전달받고 디코딩한 후에 원본 메시지로 복호화한다. 

```js
const app = async () => {
  // encrypt message
  const first = 'Hello, World!'
  const key = await generateKey()
  const { cipher, iv } = await encrypt(first, key)
  // pack and transmit
  await fetch('/secure-api', {
    method: 'POST',
    body: JSON.stringify({
      cipher: pack(cipher),
      iv: pack(iv),
    }),
  })
  // retrieve
  const response = await fetch('/secure-api').then(res => res.json())
  // unpack and decrypt message
  const final = await decrypt(unpack(response.cipher), key, unpack(response.iv))
  console.log(final) // logs 'Hello, World!'
}
```

client 측 암호화를 구현하였다. 

위에서 구현한 내용을 참고하여 crypto 유틸을 구현한다. 

```typescript
import Base64Utility from '@utils/base64';
import ObjectUtility from '@utils/object';
import StringUtility from '@utils/string';

const AES_ALGORITHM = 'AES-GCM';
const HASH_ALGORITHM = 'SHA-256';

function isSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto != 'undefined' &&
    typeof window.crypto.subtle != 'undefined' &&
    typeof window.crypto.getRandomValues != 'undefined' &&
    typeof window.crypto.subtle.generateKey != 'undefined'
  );
}

// ref : https://github.com/googleapis/google-auth-library-nodejs/blob/9116f247486d6376feca505bbfa42a91d5e579e2/src/crypto/browser/crypto.ts
export class Crypto {
  constructor() {
    if (!isSupported()) {
      throw new Error("SubtleCrypto not found. Make sure it's an https:// website.");
    }
  }

  /*#######################################
   * private method
   *#######################################*/
  private getIvBase64 = (count = 12) => {
    const array = new Uint8Array(count);
    const iv = window.crypto.getRandomValues(array);

    return Base64Utility.encodeFromArrayBuffer(iv);
  };

  private getAesBase64 = async () => {
    const aes = await window.crypto.subtle
      .generateKey(
        {
          name: AES_ALGORITHM,
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      )
      .then((key) => {
        return window.crypto.subtle.exportKey('raw', key);
      });

    return Base64Utility.encodeFromArrayBuffer(aes);
  };

  private generateCryptoKey = (
    format: string,
    keyData: string,
    aLog: string | RsaHashedImportParams,
    key: KeyUsage[]
  ) => {
    return window.crypto.subtle.importKey(format, Base64Utility.decodeToArrayBuffer(keyData), aLog, false, key);
  };

  /*#######################################
   * public method
   *#######################################/
  /**
   * @return {Object}
   * example)
   *  - iv: "Hl3d5fD-K6uU2j4S"
   *  - aes: "pm3TPPzGj2wnuMJtpI2UyP6OLY4tnF3wvgbBYtYEIrg"
   */
  encodeAesAndIvKey = async () => {
    const iv = this.getIvBase64();
    const aes = await this.getAesBase64();

    return {
      iv: Base64Utility.urlSafeEncode(iv),
      aes: Base64Utility.trim(Base64Utility.urlSafeEncode(aes)),
    };
  };
  
  decodeAesAndIvKey = async (aesData: { iv: string; aes: string }, ciphertext: string) => {
    if (
      ObjectUtility.isEmpty(aesData) ||
      ObjectUtility.isEmptyString(aesData.aes) ||
      ObjectUtility.isEmptyString(aesData.iv) ||
      ObjectUtility.isEmptyString(ciphertext)
    ) {
      throw new Error('[Error] aesData or ciphertext is null');
    }

    const crytoKey = await this.generateCryptoKey('raw', aesData.aes, AES_ALGORITHM, ['decrypt']);
    const decryptResult = await window.crypto.subtle.decrypt(
      {
        name: AES_ALGORITHM,
        iv: Base64Utility.decodeToArrayBuffer(aesData.iv),
      },
      crytoKey,
      Base64Utility.decodeToArrayBuffer(ciphertext)
    );

    return window.atob(Base64Utility.encodeFromArrayBuffer(decryptResult));
  };
  
  encryptRsaPublicKey = async (plainString: string, key: string) => {
    const algorithm = 'RSA-OAEP';

    const crytoKey = await this.generateCryptoKey(
      'spki',
      key,
      {
        name: algorithm,
        hash: HASH_ALGORITHM,
      },
      ['encrypt']
    );

    // RSA-OAEP 로 encrypt
    const encryptData = await window.crypto.subtle.encrypt(
      {
        name: algorithm,
      },
      crytoKey, // public key
      StringUtility.convertStringToArrayBuffer(plainString) // encoding data
    );
    const encodeString = Base64Utility.urlSafeEncode(Base64Utility.encodeFromArrayBuffer(encryptData));

    return Base64Utility.trim(encodeString);
  };

  isValidRsaPublicKey = async (publicKey: string, signatureKey: string, randomPublicKey: string) => {
    const algorithm = 'RSA-PSS';

    const crytoKey = await this.generateCryptoKey(
      'spki',
      publicKey,
      {
        name: algorithm,
        hash: HASH_ALGORITHM,
      },
      ['verify']
    );

    const result = await window.crypto.subtle.verify(
      {
        name: algorithm,
        saltLength: 32,
      },
      crytoKey,
      Base64Utility.decodeToArrayBuffer(signatureKey),
      Base64Utility.decodeToArrayBuffer(randomPublicKey)
    );

    return result;
  };

  generateDigest = async (message: string) => {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };
}
```

---

### 참고

* https://davidmyers.dev/blog/a-practical-guide-to-the-web-cryptography-api
* https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=aepkoreanet&logNo=221020077297
* https://developer.mozilla.org/en-US/docs/Web/API/Crypto
* https://w3c.github.io/webcrypto/

