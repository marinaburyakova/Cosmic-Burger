import { useState } from 'react';
import ingredientsData from '../data/IngredientsData';
import PriceIcon from "./icons/PriceIcon";
import style from './BunSelector.module.css';

const BunSelector = ({ onSelectBun, onClose, currentBun }) => {
  const [selectedBunId, setSelectedBunId] = useState(currentBun?.id || null);
  
  const buns = ingredientsData.buns || [];
  
  const handleSelect = () => {
    if (selectedBunId) {
      const selectedBun = buns.find(bun => bun.id === selectedBunId);
      if (selectedBun) {
        onSelectBun(selectedBun);
        onClose();
      }
    }
  };
  
  return (
    <div className={style["selector-overlay"]} onClick={onClose}>
      <div className={style["selector-content"]} onClick={(e) => e.stopPropagation()}>
        <div className={style["selector-header"]}>
          <h3 className={style["selector-title"]}>Выберите булку</h3>
          <button className={style["selector-close"]} onClick={onClose}>✕</button>
        </div>
        
        <div className={style["buns-list"]}>
          {buns.map((bun) => (
            <div
              key={bun.id}
              className={`${style["bun-item"]} ${selectedBunId === bun.id ? style["selected"] : ''}`}
              onClick={() => setSelectedBunId(bun.id)}
            >
              <img className={style["bun-item-image"]} src={bun.image} alt={bun.name} />
              <div className={style["bun-item-info"]}>
                <div className={style["bun-item-name"]}>{bun.name}</div>
                <div className={style["bun-item-price"]}>
                  {bun.price} <PriceIcon />
                </div>
              </div>
              {selectedBunId === bun.id && (
                <span className={style["check-mark"]}>✓</span>
              )}
            </div>
          ))}
        </div>
        
        <div className={style["selector-footer"]}>
          <button className={style["cancel-button"]} onClick={onClose}>
            Отмена
          </button>
          <button 
            className={style["select-button"]} 
            onClick={handleSelect}
            disabled={!selectedBunId}
          >
            Добавить булку
          </button>
        </div>
      </div>
    </div>
  );
};

export default BunSelector;