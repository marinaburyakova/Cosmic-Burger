import {useState, useMemo, useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loginUser, registerUser, logout, updateProfile, clearError} from "../store/slices/userSlice";
import PriceIcon from "./icons/PriceIcon";
import style from "./ProfilePage.module.css";
import {useTheme} from "../hooks/useTheme";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const {user, isAuthenticated, isLoading, error, sessionChecked} = useSelector((state) => state.user);
  const {userOrders} = useSelector((state) => state.orders);
  const {theme, setTheme,} = useTheme();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({name: "", email: "", password: ""});
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Решение 1: Храним только то, что не можем вычислить (изменения в форме редактирования)
  const [dirtyFields, setDirtyFields] = useState({});

  const [activeTab, setActiveTab] = useState("profile");

  // ✅ Решение 2: ВСЕ производные данные вычисляем во время рендера
  // Это главное исправление — больше никаких useEffect для setEditForm!
  const userBaseData = useMemo(
    () => ({
      name: user?.name || "",
      email: user?.email || "",
    }),
    [user?.name, user?.email]
  );

  // Финальные данные формы = базовые данные пользователя + изменения (dirtyFields)
  const editFormData = {
    name: dirtyFields.name !== undefined ? dirtyFields.name : userBaseData.name,
    email: dirtyFields.email !== undefined ? dirtyFields.email : userBaseData.email,
  };

  // ✅ Решение 3: Сброс dirty-полей — тоже вычисляем во время рендера, а не через useEffect
  // Используем запоминание предыдущего user.id, чтобы понять, изменился ли пользователь
  const [prevUserId, setPrevUserId] = useState(user?.id);

  // Если ID пользователя изменился — сбрасываем dirtyFields прямо во время рендера
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setDirtyFields({});
  }

  // Очищаем ошибку при смене формы (этот useEffect оправдан, т.к. синхронизирует с внешним состоянием ошибки)
  useState(() => {
    dispatch(clearError());
  }, [isLogin, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({email: formData.email, password: formData.password}));
    } else {
      dispatch(registerUser({name: formData.name, email: formData.email, password: formData.password}));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setActiveTab("profile");
  };

  const handleUpdateProfile = () => {
    // Отправляем только то, что изменилось (dirtyFields), а не всю форму
    dispatch(updateProfile(dirtyFields));
    setDirtyFields({});
    setIsEditing(false);
  };

  const handleFieldChange = useCallback((field, value) => {
    setDirtyFields((prev) => ({...prev, [field]: value}));
  }, []);

  const handleCancelEdit = useCallback(() => {
    setDirtyFields({});
    setIsEditing(false);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Не указано";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Показываем загрузку, пока проверяется сессия
  if (!sessionChecked) {
    return (
      <div className={style["auth-container"]}>
        <div className={style["auth-card"]}>
          <div style={{textAlign: "center", padding: "40px"}}>
            <div className={style["loading-spinner"]}></div>
            <p style={{color: "#8585AD", marginTop: "20px"}}>Проверка сессии...</p>
          </div>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован - показываем форму входа/регистрации
  if (!isAuthenticated) {
    return (
      <div className={style["auth-container"]}>
        <div className={style["auth-card"]}>
          <h2 className={style["auth-card-h2"]}>{isLogin ? "Вход в аккаунт" : "Регистрация"}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={style["form-group"]}>
                <input
                  className={style["auth-card-input"]}
                  type="text"
                  placeholder="Имя"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            )}
            <div className={style["form-group"]}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className={style["form-group"]}>
              <input
                type="password"
                placeholder="Пароль (мин. 3 символа)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            {error && <div className={style["error-message"]}>{error}</div>}
            <button className={style["auth-card-button"]} type="submit" disabled={isLoading}>
              {isLoading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
          <p className={style["auth-switch"]}>
            {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <button className={style["auth-switch-button"]} type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Если пользователь авторизован - показываем личный кабинет
  return (
    <div className={style["profile-container"]}>
      {/* Боковая панель */}
      <div className={style["profile-sidebar"]}>
        <div className={style["profile-avatar"]}>
          <img className={style["profile-avatar-img"]} src={user?.avatar} alt={user?.name} />
          <h3 className={style["profile-avatar-h3"]}>{user?.name}</h3>
          <p className={style["profile-avatar-p"]}>{user?.email}</p>
        </div>
        <nav className={style["profile-nav"]}>
          <button
            className={`${style["profile-nav-btn"]} ${activeTab === "profile" ? style["active"] : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Профиль
          </button>

          <button
            className={`${style["profile-nav-btn"]} ${activeTab === "orders" ? style["active"] : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 Мои заказы ({userOrders.length})
          </button>

          <button
            className={`${style["profile-nav-btn"]} ${activeTab === "settings" ? style["active"] : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Настройки
          </button>

          {/* Исправлено: каждый класс импортируется отдельно через пробел */}
          <button className={`${style["profile-nav-btn"]} ${style["logout"]}`} onClick={handleLogout}>
             Выйти
          </button>
        </nav>
      </div>

      {/* Контентная область */}
      <div className={style["profile-content"]}>
        {activeTab === "profile" && (
          <div className={style["profile-info"]}>
            <h2>Информация профиля</h2>
            {!isEditing ? (
              <>
                <div className={style["info-field"]}>
                  <label>Имя:</label>
                  <p>{userBaseData.name}</p>
                </div>
                <div className={style["info-field"]}>
                  <label>Email:</label>
                  <p>{userBaseData.email}</p>
                </div>
                <div className={style["info-field"]}>
                  <label>ID пользователя:</label>
                  <p>#{user?.id}</p>
                </div>
                <div className={style["info-field"]}>
                  <label>Дата регистрации:</label>
                  <p>{formatDate(user?.createdAt)}</p>
                </div>
                <button className={style["edit-btn"]} onClick={() => setIsEditing(true)}>
                   Редактировать профиль
                </button>
              </>
            ) : (
              <div className={style["edit-form"]}>
                <div className={style["form-group"]}>
                  <label>Имя:</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Ваше имя"
                  />
                </div>
                <div className={style["form-group"]}>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="Email"
                  />
                </div>
                <div className={style["edit-actions"]}>
                  <button className={style["save-btn"]} onClick={handleUpdateProfile}>
                     Сохранить
                  </button>
                  <button className={style["cancel-btn"]} onClick={handleCancelEdit}>
                    ❌ Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className={style["profile-orders"]}>
            <h2>История заказов</h2>
            {userOrders.length === 0 ? (
              <div className={style["empty-orders"]}>
                <p>У вас пока нет заказов</p>
                <small>Соберите свой первый бургер в конструкторе!</small>
              </div>
            ) : (
              <div className={style["orders-list"]}>
                {userOrders.map((order) => (
                  <div key={order.id} className={style["order-card-mini"]}>
                    <div className={style["order-header"]}>
                      <span className={style["order-id"]}>#{order.id}</span>
                      <span
                        className={`${style["order-status"]} ${
                          order.status === "Готов" ? style["done"] : style["pending"]
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className={style["order-name"]}>{order.name}</div>
                    <div className={style["order-footer"]}>
                      <span className={style["order-date"]}>{formatDate(order.timestamp)}</span>
                      <div className={style["order-price"]}>
                        <span>{order.totalPrice}</span>
                        <PriceIcon />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className={style["profile-settings"]}>
            <h2>Настройки</h2>

            {/* Настройки темы */}
            <div className={style["settings-group"]}>
              <h3> Тема оформления</h3>
              <div className={style["theme-selector"]}>
                <button
                  className={`${style["theme-option"]} ${theme === "dark" ? style.active : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  🌙 Темная
                </button>
                <button
                  className={`${style["theme-option"]} ${theme === "light" ? style.active : ""}`}
                  onClick={() => setTheme("light")}
                >
                  ☀️ Светлая
                </button>
                <button
                  className={`${style["theme-option"]} space ${theme === "space" ? style.active : ""}`}
                  onClick={() => setTheme("space")}
                >
                  🚀 Космическая
                </button>
              </div>
            </div>

            <div className={style["settings-group"]}>
              <h3>🔔 Уведомления</h3>
              <label className={style["setting-item"]}>
                <input type="checkbox" defaultChecked /> Получать уведомления о статусе заказа
              </label>
              <label className={style["setting-item"]}>
                <input type="checkbox" /> Получать новости и акции
              </label>
            </div>

            <div className={style["settings-group"]}>
              <h3>🌐 Язык</h3>
              <select className={style["language-select"]} defaultValue="ru">
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className={style["danger-zone"]}>
              <h3>⚠️ Опасная зона</h3>
              <button className={style["delete-account-btn"]} onClick={() => alert("Эта функция в разработке")}>
                🗑️ Удалить аккаунт
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
