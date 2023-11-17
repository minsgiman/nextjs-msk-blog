---
title: React Higher-Order Components (HOC)
date: '2020-11-18'
tags: ['react']
draft: false
summary: 'HOC는 React에서 컴포넌트 로직을 재사용하기 위한 패턴이다.'
---

HOC는 React에서 컴포넌트 로직을 재사용하기 위한 패턴이다.

React 컴포넌트를 인자로 받아서 새로운 리액트 컴포넌트를 리턴하는 함수로써, 여러 컴포넌트에서 공통된 기능은 hook 으로도 구현할수 있지만, 기능과 함께 공통된 JSX까지도 필요할때 사용하면 유용하다.

예를 들어 기존의 페이지에 공통된 기능 구현과 Layer를 붙이고자 할 때 기존 페이지 컴포넌트는 큰 변경없이 적용할 수 있다.

### HOC 구현

```tsx
interface WithTransactionProcessInjectProps {
  flowType: string;
}

export interface WithTransactionProcessProps {
  isOverAmount: boolean;
  onCheckTransaction: () => void;
  onPreCheckProcess: () => void;
}

export function withTransactionProcess(
  InnerComponent: React.ComponentType<WithTransactionProcessProps>,
  { flowType }: WithTransactionProcessInjectProps
) {
  const TransactionProcessLayoutComponent = () => {
    const [isOverAmount, setIsOverAmount] = useState(false);

    const { show, onOpen, onClose } = useShow();

    const handleCheckTransaction = useCallback(
      () => {
        // ...
      },
      []
    );

    const handlePreCheckProcess = useCallback(
      () => {
        // ...
      },
      []
    );

    const handleAuthComplete = useCallback(() => {
      // ...
    }, []);

    return (
      <>
        <InnerComponent
          isOverAmount={isOverAmount}
          onCheckTransaction={handleCheckTransaction}
          onPreCheckProcess={handlePreCheckProcess}
        />

        <Layer show={show} isFlexFullPage={true}>
          <Uplift flowType={flowType} onCancel={onClose} onCompleted={handleAuthComplete} />
        </Layer>
      </>
    );
  };

  return TransactionProcessLayoutComponent;
}

```

### HOC 사용

```tsx
function EditSchedulePage({ isOverAmount, onCheckTransaction, onPreCheckProcess }: WithTransactionProcessProps) {
  // ...

  return (
    <EditSchedule
      // ...
    />
  );
}

export default withTransactionProcess(EditSchedulePage, {
  flowType: 'SCHEDULE_EDIT'
});
```
