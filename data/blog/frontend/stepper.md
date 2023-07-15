---
title: Stepper 구현
date: '2023-06-20'
tags: ['frontend', 'react', 'mobile']
draft: false
summary: 'frontend에서 여러 step 들을 통해 상태를 수집하고, 결과 페이지를 보여주는 다음과 같은 "설문조사" 패턴이 있다.'
---

frontend에서 여러 step 들을 통해 상태를 수집하고, 결과 페이지를 보여주는 다음과 같은 "설문조사" 패턴이 있다. <br /> 
이 패턴에 해당하는 플로우로는 회원가입, 상품가입등이 있다.

<img src="/static/images/page-pattern.png" />

그러면 이 패턴을 구현하는 방법으로는 다음과 같이 여러개의 routing 페이지를 만들고, 여러 페이지에서 공유하는 상태는 전역 상태로 관리할 수 있다. 

<img src="/static/images/multi-pages.png" />

그러나 위와 같이 구현하였을 때 다음과 같은 몇 가지 문제점이 있다.

#### 흩어져 있는 페이지 흐름
    * 페이지들간의 이동 순서 흐름을 파악하기 위해서는 각 페이지별로 있는 router.push 코드를 따라가 봐야 알 수 있다.
#### 흩어져 있는 페이지 상태
    * 여러 단계 페이지에서 공통으로 사용하는 state를 global state 를 통해 접근한다. global state 관련 API를 수정하면 여기 뿐 아니라 앱 전체 대상으로 데이터 흐름을 추적해야 한다.

그래서 흩어져 있는 페이지 흐름, 상태를 한 곳으로 모아서 응집도를 높혀야 한다. <br />
이를 위한 방법으로 `Stepper`를 구현하여 사용하고 있다. <br />
`useStepper` 를 통해 현재 step 위치를 제어하고, `Stepper` 에서는 이에따라 현재 step index에 해당하는 child만 보여준다.


#### Stepper 사용 
```ts
export default function UserProfile() {
  const { activeStepIdx, onMovePrev, onMoveNext } = useStepper(2, 0);
  const [customerInfo, setCustomerInfo] = useState();

  const fetchCustomerProfile = useCallback(() => {
    fetchCustomerInfo.request.then((data) => {
      setCustomerInfo(data)
    });
  }, []);

  const handleGoMenu = useCallback(() => {
    HistoryUtility.redirect(MAIN_ROUTES.MENU);
  }, []);

  useEffectOnce(() => {
    fetchCustomerProfile();
  });

  return (
    <Stepper currentIdx={activeStepIdx}>
      <UserProfileView profileInfo={customerInfo} onEditClick={onMoveNext} onBackClick={handleGoMenu} />
      <UserProfileEdit profileInfo={customerInfo} onClick={onMovePrev} />
    </Stepper>
  );
}
```

#### useStepper.tsx
```ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import HistoryUtility from '@utils/history';
import ObjectUtility from '@utils/object';

export const useStepper = (length: number, initIdx?: number) => {
  const history = useHistory();

  const { hash, state } = useMemo(() => HistoryUtility.parseLocation<unknown>(), []);

  const [activeStepIdx, setActiveStepIdx] = useState(
    !ObjectUtility.isNullOrUndefined(initIdx) ? initIdx : hash.activeStepIdx ? Number.parseInt(hash.activeStepIdx) : 0
  );

  const handleMovePrev = useCallback(
    (onGoBack?: () => void) => {
      if (activeStepIdx <= 0) {
        if (onGoBack) {
          onGoBack();
        } else {
          HistoryUtility.goBack();
        }
        return;
      }
      setActiveStepIdx((v) => --v);
    },
    [activeStepIdx]
  );

  const handleMoveNext = useCallback(() => {
    if (activeStepIdx >= length - 1) {
      return;
    }
    setActiveStepIdx((v) => ++v);
  }, [activeStepIdx, length]);

  useEffect(() => {
    history.replace({
      hash: HistoryUtility.generateHashParam({
        ...hash,
        activeStepIdx: activeStepIdx.toString(),
      }),
      search: location.search,
      state,
    });
  }, [history, hash, state, activeStepIdx]);

  return {
    activeStepIdx,
    onMovePrev: handleMovePrev,
    onMoveNext: handleMoveNext,
  };
};
```

#### Stepper.tsx
```ts
import React, { useEffect, useState } from 'react';

import { useEffectOnce } from '@hooks/useEffectOnce';
import ObjectUtility from '@utils/object';

import { useStepContext } from './StepContext';

export interface IStepperProps {
  currentIdx?: number;
  children: React.ReactNode[];
}

export const Stepper = ({ currentIdx, children }: IStepperProps) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const { stepIdx, stepLength, setStepLength } = useStepContext();

  useEffect(() => {
    const idx = currentIdx === undefined ? stepIdx : currentIdx;

    if (!(idx < 0 || idx > stepLength)) {
      setActiveStep(idx);
    }
  }, [stepIdx, currentIdx, stepLength]);

  useEffectOnce(() => {
    setStepLength?.(children ? children.length : 0);
  });

  return (
    <>
      {!ObjectUtility.isNullOrUndefined(activeStep) ? (
        children?.find((_, idx) => {
          return idx === activeStep;
        })
      ) : (
        <></>
      )}
    </>
  );
};
```

#### StepContext.tsx
```ts
import { useContext, createContext } from 'react';

interface ICommonDataType extends Record<string, unknown> {
  type?: string;
}

interface IStepContextType {
  stepIdx: number;
  stepLength: number;
  commonData: ICommonDataType;
  setStepIdx: (stepIdx: number) => void;
  setStepLength: (stepLength: number) => void;
  setCommonData: (commonData: ICommonDataType) => void;
  movePrev: () => boolean;
  moveNext: () => boolean;
}

const ctx = createContext<IStepContextType | undefined>(undefined);

export const StepCtxProvider = ctx.Provider;

export function useStepContext() {
  const context = useContext(ctx);

  // if (!context) {
  //   throw new Error('context must have a value');
  // }

  return context || ({} as IStepContextType);
}
```

그리고 얼마 전 Toss 에서는 위의 Stepper와 유사한 것을 [useFunnel](https://slash.page/ko/libraries/react/use-funnel/README.i18n) 이라는 이름으로 구현한 발표를 보았다.

발표 영상 : https://www.youtube.com/watch?v=NwLWX2RNVcw

funnel debugger 까지 시각적으로 볼 수 있도록 개발하였는데 나중에 사용해보아야 겠다. 


---

### 참고

- [useFunnel git](https://github.com/toss/slash/tree/main/packages/react/use-funnel)

- [토스ㅣSLASH 23 - 퍼널: 쏟아지는 페이지 한 방에 관리하기](https://www.youtube.com/watch?v=NwLWX2RNVcw)

