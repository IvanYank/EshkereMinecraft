import { Link, useNavigate } from "react-router";
import classNames from "classnames";

import avatar from "@/assets/avatar.jpg"
import logo from "@/assets/logo.svg"

import styles from "./Header.module.scss"
import { useEffect, useRef, useState } from "react";

type loginFormProps = {
  nickname: string,
  password: string
}

type registerFormProps = {
  nickname: string,
  token: string,
  password: string,
  passwordSecond: string,
}

type personData = {
  nickname: string,
  avatar?: string
}

const initalStateLogin = {
  nickname: "",
  password: ""
}

const initalStateReg = {
  nickname: "",
  password: "",
  token: "",
  passwordSecond: ""
}

export default function Header() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false);
  const [personData, setPersonData] = useState<personData>({
    nickname: "Steve",
    avatar: undefined
  })

  const loginRef = useRef<HTMLDialogElement | null>(null);
  const regRef = useRef<HTMLDialogElement | null>(null);

  const [loginform, setLoginForm] = useState<loginFormProps>(initalStateLogin)
  const [regForm, setRegForm] = useState<registerFormProps>(initalStateReg)

  const openLogin = () => loginRef.current?.showModal();
  const closeLogin = () => loginRef.current?.close();

  const openReg = () => regRef.current?.showModal();
  const closeReg = () => regRef.current?.close();

  const handleClick = (url: string) => {
    const el = document.getElementById(url);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${url}`);
    }
  };

  const loginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const regInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const submitHandlerLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const response = await fetch("api/users/login/", {
      headers: {
        "Content-type": "Application/json"
      },
      method: "POST",
      body: JSON.stringify(loginform),
      credentials: "include"
    })

    console.log(response)

    if (response.ok) {
      const json = await response.json()

      setPersonData({
        nickname: json.user.nickname,
        avatar: json.user.avatar
      })

      localStorage.setItem("accessToken", json.access)
      setIsAuth(true)
      closeLogin()
    }
  }

  const submitHandlerReg = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { passwordSecond, ...body } = regForm

    const response = await fetch("api/users/register/", {
      headers: {
        "Content-type": "Application/json"
      },
      method: "POST",
      body: JSON.stringify(body)
    })

    console.log(response)

    if (response.ok) {
      const json = await response.json()

      setPersonData({
        nickname: json.user.nickname,
        avatar: json.user.avatar
      })

      localStorage.setItem("accessToken", json.access)
      setIsAuth(true)
      closeReg()
    }
  }

  const logoutHandler = async () => {
    const response = await fetch("api/users/logout/", {
      headers: {
        "Content-type": "Application/json"
      },
      method: "POST",
    })

    if (response.ok) {
      setIsAuth(false)
    }
  }

  const closeLoginDialog = () => {
    setLoginForm(initalStateLogin)
  }

  const closeRegDialog = () => {
    setRegForm(initalStateReg)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")

    if (token) {
      (async () => {
        const response = await fetch("api/users/me/", {
          headers: {
            "Content-type": "Application/json",
            "Authorization": `Bearer ${token}`,
          }
        })

        console.log(response)

        if (response.ok) {
          const data = await response.json()

          setPersonData({
            nickname: data.nickname,
            avatar: data.avatar.replace("http://localhost", "")
          })

          setIsAuth(true)
        }
      })()
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link className={styles.logo} to="/">
          <img src={logo} alt="Header's logo" className={styles.logoImage} />
        </Link>
        <nav className={styles.navigation}>
          <ul className={styles.navigationList}>
            <li className={styles.navigationElement}>
              <button
                onClick={() => handleClick("description")}
                className={styles.link}
                type="button"
              >
                Первая ссылка
              </button>
            </li>
            <li className={styles.navigationElement}>
              <button
                onClick={() => handleClick("description")}
                className={styles.link}
                type="button"
              >
                Вторая ссылка
              </button>
            </li>
            <li className={styles.navigationElement}>
              <Link className={styles.link} to="/map">Интерактивная карта</Link>
            </li>
          </ul>
        </nav>
        {!isAuth
          ? (
            <div className={styles.auth}>
              <button type="button" onClick={openLogin} className={styles.authButton}>Войти</button>
              <button type="button" onClick={openReg} className={classNames(styles.authButton, styles.authButtonRegistry)}>Регистрация</button>
            </div>
          )
          : (
            <div className={styles.person}>
              <span className={styles.personNickname}>{personData.nickname}</span>
              <button type="button" popoverTarget="person-popover" className={styles.personAvatar}>
                <img src={personData.avatar ? `http://localhost${personData.avatar}` : avatar} alt="Аватар" />
              </button>
              <div id="person-popover" popover="auto" className={styles.personPopover}>
                <button type="button" style={{ textDecoration: "line-through" }}>
                  Настройки
                </button>
                <button type="button" onClick={logoutHandler}>
                  Выйти
                </button>
              </div>
            </div>
          )
        }
        <dialog className={styles.dialog} ref={loginRef} onClose={closeLoginDialog}>
          <form onSubmit={submitHandlerLogin} className={styles.form}>
            <button className={styles.formClose} type="button" onClick={closeLogin}></button>
            <h2 className={styles.formTitle}>Авторизация</h2>
            <label className={styles.formBlock}>
              <div className={styles.formBlockTitle}>Никнейм</div>
              <input
                className={styles.formBlockInput}
                type="text"
                name='nickname'
                value={loginform.nickname}
                onChange={loginInputChange}
              />
            </label>
            <label className={styles.formBlock}>
              <div className={styles.formBlockTitle}>Пароль</div>
              <input
                className={styles.formBlockInput}
                type="password"
                name='password'
                value={loginform.password}
                onChange={loginInputChange}
              />
            </label>
            <button className={styles.formSubmit} type="submit">Отправить</button>
          </form>
        </dialog>
        <dialog className={styles.dialog} ref={regRef} onClose={closeRegDialog}>
          <form onSubmit={submitHandlerReg} className={styles.form}>
            <button className={styles.formClose} type="button" onClick={closeReg}></button>
            <h2 className={styles.formTitle}>Регистрация</h2>
            <label className={styles.formBlock}>
              <div className={styles.formBlockTitle}>Никнейм</div>
              <input
                className={styles.formBlockInput}
                type="text"
                name='nickname'
                value={regForm.nickname}
                onChange={regInputChange}
              />
            </label>
            <label className={styles.formBlock}>
              <div className={styles.formBlockTitle}>Токен</div>
              <input
                className={styles.formBlockInput}
                type="text"
                name='token'
                value={regForm.token}
                onChange={regInputChange}
              />
            </label>
            <label className={styles.formBlock}>
              <div className={styles.formBlockTitle}>Пароль</div>
              <input
                className={styles.formBlockInput}
                type="password"
                name='password'
                value={regForm.password}
                onChange={regInputChange}
              />
            </label>
            <label className={styles.formBlock}>
              <div className={styles.formBlockTitle}>Повторный пароль</div>
              <input
                className={styles.formBlockInput}
                type="password"
                name='passwordSecond'
                value={regForm.passwordSecond}
                onChange={regInputChange}
              />
            </label>
            <button className={styles.formSubmit} type="submit">Отправить</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
