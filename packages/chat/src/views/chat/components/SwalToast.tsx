import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import css from './SwalToast.module.css'

interface ToastProps {
  message: string
  duration: number
  onClose?: () => void
}

interface ToastContainerProps {
  // `forwardRef` 需要一个 `ref` 参数，并且 ref 的类型为组件的实例
  // （在本例中，即 `ToastContainer` 组件的实例）
  // 由父组件通过 `ref` 属性传递
  // 此处 `React.FC` 是组件类型的默认值
  // 如果你的组件有 PropTypes，则需要将其填写在此处的 angular brackets 中（例如 `React.FC<Props>`）
  // 如果你的组件不需要 props，则可以直接写成 `React.ForwardRefRenderFunction<{}, ToastContainerRef>`
  // `{}` 是 props 类型的默认值
  // `ToastContainerRef` 是 ref 的类型，用于描述要暴露给外部组件的接口
  ref?: React.RefObject<ToastContainerRef>
}

// 定义一个接口，用于描述要暴露给外部组件的接口
// 在本例中，该接口中包含一个 `showToast` 方法
export interface ToastContainerRef {
  showToast: (toastProps: ToastProps) => void
}

// 使用 `forwardRef` 函数封装 `ToastContainer` 组件
const ToastContainer = forwardRef<ToastContainerRef, ToastContainerProps>((props, ref) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  // 定义 `showToast` 方法，用于接收外部调用，并在 Ref 中存储组件实例
  useImperativeHandle(
    ref,
    () => ({
      showToast: (newToast: ToastProps) => setToasts((prevToasts) => [...prevToasts, newToast]),
    }),
    [],
  )

  const handleToastClose = (index: number) => {
    setToasts((prevToasts) => prevToasts.filter((_, i) => i !== index))
  }

  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={index}
          message={toast.message}
          duration={toast.duration || 3000}
          onClose={() => handleToastClose(index)}
        />
      ))}
    </>
  )
})

const Toast: React.FC<ToastProps> = ({ message, duration, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    setIsVisible(true)

    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose && onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  return (
    <>
      {isVisible && (
        <div className={css.toastContainer}>
          <div className={css.toastContent}>
            <div className={css.toastMessage}>{message}</div>
          </div>
        </div>
      )}
    </>
  )
}

// 定义别名 WrappedToastContainer，通过 extends 去掉 defaultProps，并导出
type WrappedToastContainer = React.ForwardRefRenderFunction<
  ToastContainerRef,
  ToastContainerProps & React.RefAttributes<ToastContainerRef>
> & {
  defaultProps?: undefined
}
const WrappedToastContainer = ToastContainer as WrappedToastContainer

export default WrappedToastContainer
