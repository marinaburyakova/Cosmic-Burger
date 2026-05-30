import style from './IngredientModalContent.module.css'
const IngredientModalContent = ({ ingredient, onClose }) => {
  if (!ingredient) return null;

  const getTypeIcon = () => {
    switch(ingredient.type) {
      case 'bun': return '🍔';
      case 'sauce': return '🥫';
      case 'main': return '🥩';
      default: return '✨';
    }
  };

  const getTypeName = () => {
    switch(ingredient.type) {
      case 'bun': return 'Булка';
      case 'sauce': return 'Соус';
      case 'main': return 'Начинка';
      default: return 'Ингредиент';
    }
  };

  const getNutritionData = () => {
    // Разные данные для разных типов
    const nutritionMap = {
      bun: { calories: 250, proteins: 8, fats: 12, carbs: 35 },
      sauce: { calories: 80, proteins: 2, fats: 5, carbs: 8 },
      main: { calories: 180, proteins: 15, fats: 10, carbs: 5 }
    };
    return nutritionMap[ingredient.type] || { calories: 150, proteins: 10, fats: 8, carbs: 15 };
  };

  const nutrition = getNutritionData();

  return (
    <div className={style["modal-inner"]}>
      <div className={style["modal-header"]}>
        <span className={style["modal-type-icon"]}>{getTypeIcon()}</span>
        <h2 className={style["modal-title"]}>{ingredient.name}</h2>
      </div>
      
      <div className={style["modal-ingredient-image"]}>
        <img src={ingredient.image} alt={ingredient.name} />
      </div>

      <div className={style["modal-type-badge"]}>
        Тип: {getTypeName()}
      </div>

      <div className={style["modal-stats"]}>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}> Цена:</span>
          <span className={style["stat-value"]}>{ingredient.price} ₽</span>
        </div>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}>🔥 Калории:</span>
          <span className={style["stat-value"]}>{nutrition.calories} ккал</span>
        </div>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}>🥩 Белки:</span>
          <span className={style["stat-value"]}>{nutrition.proteins} г</span>
        </div>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}>🍯 Жиры:</span>
          <span className={style["stat-value"]}>{nutrition.fats} г</span>
        </div>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}>🌾 Углеводы:</span>
          <span className={style["stat-value"]}>{nutrition.carbs} г</span>
        </div>
      </div>

      <div className={style["modal-description"]}>
        <h3>☑️ Описание</h3>
        <p>
          {ingredient.type === 'bun' && 'Свежайшая космическая булка, испеченная по особому рецепту. Идеально подходит для любого бургера!'}
          {ingredient.type === 'sauce' && 'Уникальный соус, приготовленный по технологии звездных поваров. Придаст вашему бургеру неповторимый вкус!'}
          {ingredient.type === 'main' && 'Отборные ингредиенты из самых дальних уголков галактики. Гарантия качества и свежести!'}
        </p>
      </div>

      <div className={style["modal-actions"]}>
        <button 
          className={style["modal-add-btn"]}
          onClick={() => {
            onClose();
            // Здесь можно добавить логику добавления ингредиента
          }}
        >
          Добавить в бургер
        </button>
      </div>

      <p className={style["modal-note"]}>Кликните вне окна или нажмите ESC для закрытия</p>
    </div>
  );
};
export default IngredientModalContent