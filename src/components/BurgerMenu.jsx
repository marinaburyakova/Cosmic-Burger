import {useState, useEffect, useCallback, useRef, memo} from "react";
import {useSelector} from "react-redux";
import BurgerIcon from "./icons/BurgerIcon";
import ListIcon from "./icons/ListIcon";
import ProfileIcon from "./icons/ProfileIcon";
import styles from "./BurgerMenu.module.css";

const BurgerMenu = memo(({onTabChange, activeMainTab, onClose}) => {
  // Точечные селекторы вместо деструктуризации
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);

  const [isOpen, setIsOpen] = useState(false);
  const isMountedRef = useRef(true);
  const menuRef = useRef(null);
  const focusTimeoutRef = useRef(null);
  const scrollBarWidthRef = useRef(0);

  // Отмечаем монтирование компонента
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Переключение меню
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Закрытие меню
  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (onClose && isMountedRef.current) {
      onClose();
    }
  }, [onClose]);

  // Обработчик клика по табу
  const handleTabClick = useCallback(
    (tab) => {
      if (onTabChange) {
        onTabChange(tab);
      }
      handleClose();
    },
    [onTabChange, handleClose]
  );

  // Закрытие по кнопке Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // ✅ ИСПРАВЛЕНО: Блокировка скролла с компенсацией прыжка контента
  useEffect(() => {
    if (!isOpen) {
      // Восстанавливаем скролл
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      return;
    }

    // Вычисляем ширину скроллбара
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    scrollBarWidthRef.current = scrollBarWidth;

    // Компенсируем прыжок контента
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Предотвращаем скролл на touch-устройствах
  useEffect(() => {
    if (!isOpen) return;

    const preventTouchMove = (e) => {
      // Разрешаем скролл внутри меню
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      e.preventDefault();
    };

    document.body.addEventListener("touchmove", preventTouchMove, {passive: false});
    return () => {
      document.body.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isOpen]);

  // ✅ ИСПРАВЛЕНО: Фокус-трап с очисткой таймера
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = menuRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    // Сохраняем предыдущий активный элемент для восстановления
    const previousActiveElement = document.activeElement;

    // Очищаем предыдущий таймер если есть
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    // Фокусируемся на первом элементе при открытии
    focusTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && firstFocusable && document.body.contains(firstFocusable)) {
        firstFocusable.focus();
      }
      focusTimeoutRef.current = null;
    }, 100);

    document.addEventListener("keydown", handleTabKey);

    return () => {
      // Очищаем таймер при размонтировании
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }

      document.removeEventListener("keydown", handleTabKey);

      // Восстанавливаем фокус при закрытии, если элемент все еще существует
      if (previousActiveElement && previousActiveElement.focus && document.body.contains(previousActiveElement)) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  // Обработчик клика вне меню
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Обработчик ошибки загрузки аватара
  const handleAvatarError = useCallback((e) => {
    e.target.src = "/default-avatar.png";
  }, []);

  return (
    <>
      <button
        className={`${styles.btn} ${isOpen ? styles.open : ""}`}
        onClick={toggleMenu}
        aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls="burger-menu-content"
      >
        <span className={styles["burger-line"]}></span>
        <span className={styles["burger-line"]}></span>
        <span className={styles["burger-line"]}></span>
      </button>

      <div
        className={`${styles["burgermenu-overlay"]} ${isOpen ? styles.open : ""}`}
        onClick={handleOverlayClick}
        aria-hidden={!isOpen}
        data-modal="burger-menu"
      >
        <div
          id="burger-menu-content"
          ref={menuRef}
          className={`${styles["burgermenu-content"]} ${isOpen ? styles.open : ""}`}
          onClick={(e) => e.stopPropagation()}
          role="menu"
          aria-label="Основное меню"
          aria-modal="true"
        >
          <button className={styles["close-btn"]} onClick={handleClose} aria-label="Закрыть меню">
            &times;
          </button>

          <div className={styles["burgermenu-header"]}>
            <div className={styles["burgermenu-avatar"]}>
              {isAuthenticated && user ? (
                <>
                  <img
                    className={styles["burger-avatar-img"]}
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.name || "Аватар"}
                    loading="lazy"
                    onError={handleAvatarError}
                  />
                  <span>{user.name || "Пользователь"}</span>
                </>
              ) : (
                <>
                  <div className={styles["burger-placeholder"]} aria-hidden="true">
                    👤
                  </div>
                  <span>Гость</span>
                </>
              )}
            </div>
          </div>

          <nav className={styles["burgermenu-nav"]}>
            <button
              className={`${styles["burgermenu-item"]} ${activeMainTab === "constructor" ? styles.active : ""}`}
              onClick={() => handleTabClick("constructor")}
              role="menuitem"
              aria-current={activeMainTab === "constructor" ? "page" : undefined}
            >
              <BurgerIcon />
              <h4>Конструктор</h4>
            </button>
            <button
              className={`${styles["burgermenu-item"]} ${activeMainTab === "orders" ? styles.active : ""}`}
              onClick={() => handleTabClick("orders")}
              role="menuitem"
              aria-current={activeMainTab === "orders" ? "page" : undefined}
            >
              <ListIcon />
              <h5>Лента заказов</h5>
            </button>
            <button
              className={`${styles["burgermenu-item"]} ${activeMainTab === "profile" ? styles.active : ""}`}
              onClick={() => handleTabClick("profile")}
              role="menuitem"
              aria-current={activeMainTab === "profile" ? "page" : undefined}
            >
              <ProfileIcon />
              <h5>Личный кабинет</h5>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
});

// ✅ Добавлено display name для отладки
BurgerMenu.displayName = "BurgerMenu";

export default BurgerMenu;
