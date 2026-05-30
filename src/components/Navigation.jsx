import {useSelector} from "react-redux";
import {useMediaQuery} from "../hooks/useMediaQuery";
import BurgerMenu from "./BurgerMenu";
import BurgerIcon from "./icons/BurgerIcon";
import ListIcon from "./icons/ListIcon";
import ProfileIcon from "./icons/ProfileIcon";
import LogoGlitch from "./LogoGlitch";
import style from "./Navigation.module.css";

const Navigation = ({onLogoClick, onTabChange, activeMainTab}) => {
  const {isAuthenticated, user} = useSelector((state) => state.user);
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      // ИСПРАВЛЕНО: Правильное объединение классов для мобильной панели
      <div className={`${style["nav-panel"]} ${style.mobile || ""}`}>
        <LogoGlitch onLogoClick={onLogoClick} />
        <BurgerMenu onTabChange={onTabChange} activeMainTab={activeMainTab} />
      </div>
    );
  }

  return (
    <div className={style["nav-panel"]}>
      <div className={style["nav-links"]}>
        <button
          className={`${style["nav-link"]} ${activeMainTab === "constructor" ? style.active : ""}`}
          onClick={() => onTabChange("constructor")}
        >
          <BurgerIcon />
          <h4>Конструктор</h4>
        </button>
        <button
          className={`${style["nav-link"]} ${activeMainTab === "orders" ? style.active : ""}`}
          onClick={() => onTabChange("orders")}
        >
          <ListIcon />
          <h4>Лента заказов</h4>
        </button>
      </div>

      <LogoGlitch onLogoClick={onLogoClick} />

      <button
        // ИСПРАВЛЕНО: Правильное объединение классов для кнопки профиля
        className={`${style["nav-link"]} ${style["profile-btn"] || ""}`}
        onClick={() => onTabChange("profile")}
      >
        <ProfileIcon />
        <h4>{isAuthenticated ? user?.name : "Личный кабинет"}</h4>
      </button>
    </div>
  );
};

export default Navigation;
