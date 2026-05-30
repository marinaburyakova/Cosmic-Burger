import { memo, useCallback } from "react";
import PriceIcon from './icons/PriceIcon';
import styles from "./IngredientCard.module.css";

const IngredientCard = memo(({ item, onAdd, count = 0, onCardClick }) => {
  // Мемоизация обработчика клика по карточке
  const handleCardClick = useCallback(() => {
    onCardClick(item);
  }, [onCardClick, item]);

  // Мемоизация обработчика добавления
  const handleAddClick = useCallback((e) => {
    e.stopPropagation(); // Предотвращаем всплытие
    onAdd(item);
  }, [onAdd, item]);

  // Мемоизация обработчика ошибки изображения
  const handleImageError = useCallback((e) => {
    e.target.src = '/placeholder-image.png';
  }, []);

  // Мемоизация обработчика клавиатуры
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  return (
    <div 
      className={styles.ingredientCard} 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${item.name}, цена ${item.price} рублей`}
    >
      <div className={styles.ingredientImg}>
        <img 
          src={item.image} 
          alt={item.name} 
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        {count > 0 && (
          <div className={styles.counterBadge} aria-label={`Выбрано ${count}`}>
            {count}
          </div>
        )}
      </div>
      
      <div className={styles.ingredientPrice}>
        <span>{item.price}</span>
        <PriceIcon aria-hidden="true" />
      </div>
      
      <div className={styles.ingredientName}>{item.name}</div>
      
      <button
        type="button"
        className={styles.addButton}
        onClick={handleAddClick}
        aria-label={`Добавить ${item.name}`}
        title={`Добавить ${item.name}`}
      >
        +
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомное сравнение для оптимизации
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.image === nextProps.item.image &&
    prevProps.count === nextProps.count &&
    prevProps.onAdd === nextProps.onAdd &&
    prevProps.onCardClick === nextProps.onCardClick
  );
});

IngredientCard.displayName = "IngredientCard";

export default IngredientCard;