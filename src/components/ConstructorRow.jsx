import {memo, useMemo, useCallback} from "react";
import DeleteIcon from "./icons/DeleteIcon";
import DragIcon from "./icons/DragIcon";
import PriceIcon from "./icons/PriceIcon";
import style from "./ConstructorRow.module.css";

const ConstructorRow = memo(({item, type, onRemove, isLocked = false, dragListeners = null}) => {
  // Мемоизация CSS классов
  const containerStyle = useMemo(() => {
    const classes = [style["constructor-row"]];

    if (type === "top") {
      classes.push(style["row-top"]);
    } else if (type === "bottom") {
      classes.push(style["row-bottom"]);
    }

    return classes.join(" ");
  }, [type]);

  // Мемоизация обработчика ошибки изображения
  const handleImageError = useCallback((e) => {
    e.target.src = "/placeholder-image.png";
  }, []);

  // Мемоизация рендера иконки перетаскивания
  const dragHandle = useMemo(() => {
    if (isLocked) return null;

    return (
      <div className={style["drag-handle"]} {...(dragListeners ?? {})} style={{cursor: "grab"}}>
        <DragIcon />
      </div>
    );
  }, [isLocked, dragListeners]);

  // Мемоизация кнопки удаления
  const removeButton = useMemo(() => {
    if (isLocked) {
      return <div className={style["lock-placeholder"]} style={{width: 24}} aria-hidden="true" />;
    }

    return (
      <button className={style["remove-btn"]} onClick={onRemove} aria-label={`Удалить ${item.name}`} type="button">
        <DeleteIcon />
      </button>
    );
  }, [isLocked, onRemove, item.name]);

  // Мемоизация текста названия с суффиксом
  const itemName = useMemo(() => {
    if (type === "top") return `${item.name} (верх)`;
    if (type === "bottom") return `${item.name} (низ)`;
    return item.name;
  }, [item.name, type]);

  return (
    <div className={containerStyle}>
      {dragHandle}

      <div className={style["row-image"]}>
        <img
          className={style["menu-item"]}
          src={item.image}
          alt={item.name}
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      <div className={style["row-name"]}>{itemName}</div>

      <div className={style["row-price"]}>
        {item.price} <PriceIcon />
      </div>

      {removeButton}
    </div>
  );
});

// Добавляем display name для отладки
ConstructorRow.displayName = "ConstructorRow";

export default ConstructorRow;
