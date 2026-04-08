import { Link, useNavigate } from "react-router";

import logo from "@/assets/logo.jpg"

import styles from "./Header.module.scss"

export default function Header() {
  const navigate = useNavigate();

  const handleClick = (url: string) => {
    const el = document.getElementById(url);

    if (el) {
      // если уже на нужной странице — просто скроллим
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // если нет — переходим на страницу
      navigate(`/#${url}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={logo} alt="Header's logo" className={styles.logo} />
        <nav className={styles.navigationBlock}>
          <button
            onClick={() => handleClick("description")}
            className={styles.link}
            type="button"
          >
            Первая ссылка
          </button>
          <button
            onClick={() => handleClick("description")}
            className={styles.link}
            type="button"
          >
            Вторая ссылка
          </button>
          <Link className={styles.link} to="/map">Интерактивная карта</Link>
        </nav>
      </div>
    </div>
  );
}
