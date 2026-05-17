import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import classNames from "classnames";

import avatar from "@/assets/avatar.jpg"
import logo from "@/assets/logo.svg"

import { FormData, PersonData } from "./types";
import FormInput from "../FormInput";

import styles from "./Header.module.scss"


const formInitialState = {
  nickname: "",
  password: "",
  token: "",
  passwordSecond: ""
}

const errorListInitialState = {
  nickname: "",
  token: "",
  password: "",
  passwordSecond: ""
}

export default function Header() {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [isAuth, setIsAuth] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [dialogType, setDialogType] = useState<"login" | "reg">("login")
  const [formData, setFormData] = useState<FormData>(formInitialState)

  const [personData, setPersonData] = useState<PersonData>({
    nickname: "Steve",
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
      let body;
      let url = "";

      if (dialogType === "login") {
        const { passwordSecond, token, ...rest } = formData

        url = "api/users/login/"
        body = rest
      } else if (dialogType === "reg") {
        const { passwordSecond, ...rest } = formData

        url = "api/users/register/"
        body = rest
      }

      if (validate()) {
        const response = await fetch(url, {
          headers: {
            "Content-type": "Application/json"
          },
          method: "POST",
          body: JSON.stringify(body)
        })

        const json = await response.json()

        if (response.ok) {
          setPersonData({
            nickname: json.user.nickname,
            avatar: json.user.avatar
          })

          localStorage.setItem("accessToken", json.access)
          setIsAuth(true)
          closeReg()
        } else {
          console.log(json)

          for (const key in json) {
            setErrorList(prev => ({
              ...prev,
              [key]: json[key]
            }))
          }
        }
      }
    } catch (e) {
      console.error(e)
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

  const validate = () => {
    let errorStatus = true

    setErrorList(errorListInitialState)

    for (const key in formData) {
      const typedKey = key as keyof FormData

      if (formData[typedKey].length == 0) {
        errorStatus = false
        setErrorList(prev => ({
          ...prev,
          [key]: "Поле должно быть заполнено"
        }))
      }
    }

    if (formData.password.length < 6) {
      errorStatus = false
      setErrorList(prev => ({
        ...prev,
        password: "Пароль меньше 6 символов"
      }))
    }

    if (formData.password !== formData.passwordSecond) {
      errorStatus = false
      console.log(errorList)

      setErrorList(prev => ({
        ...prev,
        passwordSecond: "Пароли не совпадают"
      }))
    }

    return errorStatus
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
            avatar: data.avatar
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
