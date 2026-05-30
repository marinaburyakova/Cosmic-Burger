import style from './LogoGlitch.module.css'
const LogoGlitch = () => (
  <div 
    className={style.logoContainer}
  >
    <div className={style.logoText}>
      <span>✨</span>
       <img src="/images/bun-01.png" alt="Бургер" className={style["icon-img"]} />
       <span>COSMIC BURGER</span>
    </div>
  </div>
);

export default LogoGlitch;