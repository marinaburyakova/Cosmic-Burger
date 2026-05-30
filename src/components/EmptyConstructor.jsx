import { useState, useEffect } from "react";
import style from "./EmptyConstructor.module.css";

const EmptyConstructor = ({ hasBun, onOpenBunSelector }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages = [
    "Начни с выбора булочки!",
    "Добавь свежих ингредиентов!",
    "Выбери свой идеальный бургер!",
    "Сделай его сочным!",
    "Твой шедевр ждет!",
    "Пора творить!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  // Десктоп версия (оставляем как было)
  return (
    <div className={style["empty-container"]}>
      <div className={style["empty-content"]}>
        <div className={style["burger-icon"]}>
          🍔
          <div className={style["burger-parts"]}>
            <span className={style["part-top"]}>🍞</span>
            <span className={style["part-middle"]}>🥩</span>
            <span className={style["part-bottom"]}>🍞</span>
          </div>
        </div>

        <h2 className={style["empty-title"]}>
          {!hasBun ? "Бургер пуст" : "Добавьте начинки"}
        </h2>

        <p className={style["empty-message"]}>
          {!hasBun 
            ? messages[currentMessageIndex] 
            : "Выбери соусы и начинки для своего идеального бургера!"}
        </p>

        {!hasBun && (
          <div className={style["button-group"]}>
    
            <button className={style["add-bun-btn"]} onClick={onOpenBunSelector}>
              Выбрать булку
            </button>
          </div>
        )}

        {!hasBun && (
          <p className={style["hint-text"]}></p>
        )}

        <div className={style["empty-stats"]}>
          <div className={style["stat-item"]}>
            <span className={style["stat-value"]}>5+</span>
            <span className={style["stat-label"]}>Начинок</span>
          </div>
          <div className={style["stat-item"]}>
            <span className={style["stat-value"]}>3</span>
            <span className={style["stat-label"]}>Соуса</span>
          </div>
          <div className={style["stat-item"]}>
            <span className={style["stat-value"]}>1000</span>
            <span className={style["stat-label"]}>Комбинаций</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyConstructor;