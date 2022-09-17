---
title: useImperativeHandle 사용하기
date: '2022-09-17'
tags: ['react']
draft: false
summary: 'useImperativeHandle은 ref를 사용할 때 부모 컴포넌트에 노출되는 인스턴스 값을 커스텀할 수 있게 한다.'
---

[useImperativeHandle](https://ko.reactjs.org/docs/hooks-reference.html#useimperativehandle)은 ref를 사용할 때 부모 컴포넌트에 노출되는 인스턴스 값을 커스텀할 수 있게 한다. <br />
forwardRef 와 함께 사용해야 한다.

다음은 useImperativeHandle를 사용하는 예제이다. <br />
부모 컴포넌트에서 ref를 통해 child 엘리먼트를 일일히 찾을 필요없이 useImperativeHandle을 통해서 ref를 커스텀하여 반환하고 있다.

```js
function CustomModal({ open, onClose }, ref) {
  const closeRef = useRef();
  const confirmRef = useRef();
  const denyRef = useRef();

  useImperativeHandle(ref, () => {
    return {
      focusCloseBtn: closeRef.current.focus(),
      focusConfirmBtn: confirmRef.current.focus(),
      focusDenyBtn: denyRef.current.focus(),
    };
  });

  if (!open) return null;

  return (
    <div>
      <button ref={closeRef} onClick={onClose}>
        &times;
      </button>
      <h1>Title</h1>
      <div>
        <button ref={confirmRef}>Confirm</button>
        <button ref={denyRef}>Deny</button>
      </div>
    </div>
  );
}

export default React.forwardRef(CustomModal);
```

```js
function App() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef();

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <button onClick={() => modalRef.current.focusCloseBtn()}>Focus Close Btn</button>
      <button onClick={() => modalRef.current.focusConfirmBtn()}>Focus Confirm Btn</button>
      <button onClick={() => modalRef.current.focusDenyBtn()}>Focus Deny Btn</button>
      <CustomModal ref={modalRef} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

---

### 참조

- [Learn useImperativeHandle](https://www.youtube.com/watch?v=zpEyAOkytkU)

- [useImperativeHandle Hook Ultimate Guide](https://blog.webdevsimplified.com/2022-06/use-imperative-handle/)
