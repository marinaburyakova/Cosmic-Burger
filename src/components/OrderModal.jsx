import {useState, useEffect} from "react";
import style from "./OrderModal.module.css";

const OrderModal = ({isOpen, onClose, totalPrice, ingredientsCount, onSubmit}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Имитация отправки заказа на сервер
    setTimeout(() => {
      setIsSubmitting(false);
      onClose(); // Сначала закрываем OrderModal

      // Небольшая задержка перед вызовом onSubmit, чтобы SuccessModal открылся после закрытия
      setTimeout(() => {
        if (onSubmit) {
          onSubmit();
        }
      }, 100);
    }, 1500);
  };

  // Сброс состояния при закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsSubmitting(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={style["order-modal-overlay"]} onClick={onClose}>
      <div className={style["order-modal-content"]} onClick={(e) => e.stopPropagation()}>
        {/* Кнопка закрытия (крестик) */}
        <button className={style["order-modal-close"]} onClick={onClose}>
          ×
        </button>

        {/* Подтверждение заказа */}
        <div className={style["order-confirm"]}>
          <div className={style["order-icon"]}>
            <img src="/images/bun-02.png" alt="Бургер" className={style["order-icon-img"]} />
          </div>
          <h2 className={style["order-title"]}>Подтверждение заказа</h2>

          <div className={style["order-summary"]}>
            <div className={style["summary-item"]}>
              <span>Количество ингредиентов:</span>
              <strong>{ingredientsCount} шт.</strong>
            </div>
            <div className={style["summary-item"]}>
              <span>Общая стоимость:</span>
              <strong>{totalPrice} ₽</strong>
            </div>
          </div>

          {ingredientsCount === 0 && (
            <div className={style["order-warning"]}>⚠️ Вы не выбрали ни одного ингредиента!</div>
          )}

          {/* Кнопки действий */}
          <div className={style["order-actions"]}>
            <button className={style["order-cancel-btn"]} onClick={onClose}>
              Отмена
            </button>
            <button
              className={style["order-submit-btn"]}
              onClick={handleSubmit}
              disabled={isSubmitting || ingredientsCount === 0}
            >
              {isSubmitting ? "Оформляем..." : "Подтвердить заказ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
