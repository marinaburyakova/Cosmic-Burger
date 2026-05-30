import style from './ModalContent.module.css'

const ModalContent = () => {
  return (
    <div className={style["modal-inner"]}>
      <h2 className={style["modal-title"]}>Детали бургера</h2>
      <div className={style["modal-stats"]}>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}>Общая стоимость:</span>
          <span className={style["stat-value"]}>610 ₽</span>
        </div>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}>Ингредиентов:</span>
          <span className={style["stat-value"]}>8 шт.</span>
        </div>
        <div className={style["stat-item"]}>
          <span className={style["stat-label"]}>Калорийность:</span>
          <span className={style["stat-value"]}>~850 ккал</span>
        </div>
      </div>
      <div className={style["modal-features"]}>
        <h3>✨ Особенности:</h3>
        <ul>
          <li>Краторная булка N-200i (верх/низ)</li>
          <li>Соус традиционный галактический</li>
          <li>Мясо бессмертных моллюсков</li>
          <li>Хрустящие минеральные кольца</li>
        </ul>
      </div>
    </div>
  );
};

export default ModalContent