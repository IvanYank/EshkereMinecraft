import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import classNames from "classnames";

import logo from "@/assets/logo.webp"

import { FormData, PersonData } from "./types";
import FormInput from "../FormInput";

import styles from "./Header.module.scss"

const formInitialState = {
  nickname: "",
  password: "",
  token: "",
  passwordSecond: "",
  old_password: "",
  new_password: ""
}

const errorListInitialState = {
  nickname: "",
  token: "",
  password: "",
  passwordSecond: "",
  old_password: "",
  new_password: ""
}

export default function Header() {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [isAuth, setIsAuth] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [dialogType, setDialogType] = useState<"login" | "reg" | "settings">("login")
  const [formData, setFormData] = useState<FormData>(formInitialState)

  const [personData, setPersonData] = useState<PersonData>({
    nickname: "Серьёзный никнейм",
    avatar: undefined
  })

  const [errorList, setErrorList] = useState(errorListInitialState)

  const handleClick = (url: string) => {
    const el = document.getElementById(url);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${url}`);
    }
  };

  const openLogin = () => {
    setDialogType("login")
    dialogRef.current?.showModal()
  };

  const openReg = () => {
    setDialogType("reg")
    dialogRef.current?.showModal()
  };

  const openSettings = () => {
    setDialogType("settings")
    dialogRef.current?.showModal()
  };

  const closeReg = () => {
    setErrorList(errorListInitialState)
    dialogRef.current?.close()
  };

  const formDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const submitHandler = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let headers;
      let body;
      let url = "";

      if (dialogType === "login") {
        const { passwordSecond, token, ...rest } = formData

        url = "api/users/login/"

        headers = {
          "Content-type": "Application/json",
        }

        body = rest
      } else if (dialogType === "reg") {
        const { passwordSecond, ...rest } = formData

        url = "api/users/register/"

        headers = {
          "Content-type": "Application/json",
        }

        body = rest
      }
      else if (dialogType === "settings") {
        const { old_password, new_password } = formData
        const accessToken = localStorage.getItem("accessToken")

        url = "api/users/change_password/"

        headers = {
          "Content-type": "Application/json",
          "Authorization": `Bearer ${accessToken}`,
        }

        body = {
          old_password,
          new_password
        }
      }

      if (validate()) {
        const response = await fetch(url, {
          headers: headers,
          method: "POST",
          body: JSON.stringify(body)
        })

        const json = await response.json()

        if (response.ok) {
          switch (dialogType) {
            case "settings":

              break;
            case "login":
            case "reg":
              setPersonData({
                nickname: json.user.nickname,
                avatar: json.user.avatar
              })

              localStorage.setItem("accessToken", json.access)
              setIsAuth(true)

              break;
          }

          closeReg()
        } else {
          for (const key in json) {
            setErrorList(prev => ({
              ...prev,
              [key]: json[key]
            }))
          }

          if (json.error) {
            setErrorList(prev => ({
              ...prev,
              nickname: json.error,
              password: json.error,
              old_password: json.error,
              new_password: json.error,
            }))
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const logoutHandler = async () => {
    try {
      const response = await fetch("api/users/logout/", {
        method: "POST",
      })

      if (response.ok) {
        setIsAuth(false)
        localStorage.removeItem("accessToken")
      }
    } catch (e) {
      console.error(e)

      setIsAuth(false)
      localStorage.removeItem("accessToken")
    }
  }

  const validate = () => {
    setErrorList(errorListInitialState)

    let errorStatus = true

    switch (dialogType) {
      case "login":
      case "reg":
        if (formData.password.length < 6) {
          errorStatus = false
          setErrorList(prev => ({
            ...prev,
            password: "Пароль меньше 6 символов"
          }))
        }

        if (formData.nickname.length == 0) {
          errorStatus = false
          setErrorList(prev => ({
            ...prev,
            nickname: "Поле должно быть заполнено"
          }))
        }

        if (formData.password !== formData.passwordSecond) {
          errorStatus = false

          setErrorList(prev => ({
            ...prev,
            passwordSecond: "Пароли не совпадают"
          }))
        }

        if (formData.passwordSecond.length == 0) {
          errorStatus = false
          setErrorList(prev => ({
            ...prev,
            passwordSecond: "Поле должно быть заполнено"
          }))
        }

        if (formData.token.length == 0) {
          errorStatus = false
          setErrorList(prev => ({
            ...prev,
            token: "Поле должно быть заполнено"
          }))
        }

        break;

      case "settings":
        if (formData.old_password.length < 6) {
          errorStatus = false
          setErrorList(prev => ({
            ...prev,
            old_password: "Пароль меньше 6 символов"
          }))
        }

        if (formData.new_password.length < 6) {
          errorStatus = false
          setErrorList(prev => ({
            ...prev,
            new_password: "Пароль меньше 6 символов"
          }))
        }

        break;
    }

    console.log(errorList)

    return errorStatus
  }

  const getMe = async (accessToken: string) => {
    return fetch("/api/users/me/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  const checkAuth = async () => {
    let token = localStorage.getItem("accessToken")

    if (!token) {
      setIsAuth(false)
      return
    }

    setIsAuthLoading(true)

    let response = await getMe(token)

    if (response.status === 403) {
      const refreshResponse = await fetch("/api/users/refresh/", {
        method: "POST",
      })

      if (!refreshResponse.ok) {
        localStorage.removeItem("accessToken")
        setIsAuth(false)
        setIsAuthLoading(false)
        return
      }

      const refreshData = await refreshResponse.json()

      localStorage.setItem("accessToken", refreshData.access)
      response = await getMe(refreshData.access)
    }

    if (!response.ok) {
      setIsAuth(false)
      setIsAuthLoading(false)
      return
    }

    const data = await response.json()

    setPersonData({
      nickname: data.nickname,
      avatar: data.avatar,
    })

    setIsAuth(true)
    setIsAuthLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link className={styles.logo} to="/">
          <img src={logo} alt="Header's logo" className={styles.logoImage} />
        </Link>
        <nav className={classNames(styles.navigation, { [styles.navigationActive]: isOpen })
        }>
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
        {(!isAuthLoading && !isAuth)
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
                {
                  personData.avatar
                    ? <img src={personData.avatar} alt="Аватар пользователя" />
                    : <div className={styles.personAvatarPlaceholder}></div>
                }
              </button>
              {
                !isAuthLoading &&
                (
                  <div id="person-popover" popover="auto" className={styles.personPopover}>
                    <button type="button" onClick={openSettings}>
                      Настройки
                    </button>
                    <button type="button" onClick={logoutHandler}>
                      Выйти
                    </button>
                  </div>
                )
              }
            </div>
          )
        }
        <dialog className={styles.dialog} ref={dialogRef} onClose={() => setFormData(formInitialState)}>
          <form onSubmit={submitHandler} className={styles.form}>
            <button className={styles.formClose} type="button" onClick={closeReg}></button>
            {
              dialogType === "login" && (
                <>
                  <h2 className={styles.formTitle}>Авторизация</h2>
                  <FormInput
                    title={"Никнейм"}
                    type={"text"}
                    name={"nickname"}
                    value={formData.nickname}
                    errorText={errorList.nickname}
                    onChange={formDataChange}
                  />
                  <FormInput
                    title={"Пароль"}
                    type={"password"}
                    name={"password"}
                    value={formData.password}
                    errorText={errorList.password}
                    onChange={formDataChange}
                  />
                </>
              )
            }
            {
              dialogType === "reg" && (
                <>
                  <h2 className={styles.formTitle}>Регистрация</h2>
                  <FormInput
                    title={"Никнейм"}
                    type={"text"}
                    name={"nickname"}
                    value={formData.nickname}
                    errorText={errorList.nickname}
                    onChange={formDataChange}
                  />
                  <FormInput
                    title={"Токен"}
                    type={"text"}
                    name={"token"}
                    value={formData.token}
                    errorText={errorList.token}
                    onChange={formDataChange}
                  />
                  <FormInput
                    title={"Пароль"}
                    type={"password"}
                    name={"password"}
                    value={formData.password}
                    errorText={errorList.password}
                    onChange={formDataChange}
                  />
                  <FormInput
                    title={"Повторный пароль"}
                    type={"password"}
                    name={"passwordSecond"}
                    value={formData.passwordSecond}
                    errorText={errorList.passwordSecond}
                    onChange={formDataChange}
                  />
                </>
              )
            }
            {
              dialogType === "settings" && (
                <>
                  <h2 className={styles.formTitle}>Настройки</h2>
                  <FormInput
                    title={"Старый пароль"}
                    type={"password"}
                    name={"old_password"}
                    value={formData.old_password}
                    errorText={errorList.old_password}
                    onChange={formDataChange}
                  />
                  <FormInput
                    title={"Новый пароль"}
                    type={"password"}
                    name={"new_password"}
                    value={formData.new_password}
                    errorText={errorList.new_password}
                    onChange={formDataChange}
                  />
                </>
              )
            }
            <button className={styles.formSubmit} type="submit">Отправить</button>
          </form>
        </dialog>
        <button
          className={classNames(
            styles.burger,
            {
              [styles.burgerActive]: isOpen
            }
          )}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
  );
}
