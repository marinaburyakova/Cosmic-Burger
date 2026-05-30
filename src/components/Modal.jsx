import React from 'react'
import style from './Modal.module.css'
const Modal = ({ isOpen, onClose, children }) => {
  // Закрытие по Escape
  React.useEffect(() => {
     if (!isOpen) return // Если закрыто, ничего не делаем
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose]) // Добавили isOpen в зависимости

  // Блокировка скролла фона
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  if (!isOpen) return null
  return (
    <div className={style["modal-overlay"]} onClick={onClose}>
      <div className={style["modal-content"]} onClick={(e) => e.stopPropagation()}>
        <button className={style["modal-close"]} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
