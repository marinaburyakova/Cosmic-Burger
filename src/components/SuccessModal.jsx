import { useEffect } from 'react';
import style from './SuccessModal.module.css'

const SuccessModal = ({ isOpen, onClose, orderNumber, totalPrice, ingredientsCount }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={style.ordermodalOverlay}>
      <div className={style.ordermodalContent} onClick={(e) => e.stopPropagation()}>
        <div className={style.orderSuccess}>
          <div className={style.successAnimation}>
            <div className={style.successCheckmark}>✓</div>
          </div>
          <h2 className={style.orderTitle}>Заказ оформлен!</h2>
          <div className={style.orderNumber}>
            <span className={style.ordernumberLabel}>Номер вашего заказа:</span>
            <div className={style.ordernumberValue}>{orderNumber}</div>
          </div>
          <div className={style.orderinfoMessage}>
            <p>Ваш заказ начали готовить.</p>
            <span className={style.orderStatus}>Статус заказa тут → "Лента заказов"</span>
            <p>Количество ингредиентов: {ingredientsCount} шт.</p>
            <small>Сумма: {totalPrice} ₽</small>
          </div>
          <div className={style.autocloseMessage}>
            <span>⏳ Окно закроется автоматически через 3.5 секунды</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;