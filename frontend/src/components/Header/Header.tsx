import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import classNames from "classnames";

import logo from "@/assets/logo.webp"

import { PersonData } from "./types";
import { ModalType } from "@/types/types";
import styles from "./Header.module.scss"

// const Dialog = lazy(() => import("../Dialog"))

import Dialog from "../Dialog";

export default function Header() {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [isAuth, setIsAuth] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [dialogType, setDialogType] = useState<ModalType>("Авторизация")

  const [personData, setPersonData] = useState<PersonData>({
    id: 0,
    nickname: "Серьёзный никнейм",
    avatar: undefined,
    vip: false,
    urls: []
  })

  const handleClick = (url: string) => {
    const el = document.getElementById(url);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${url}`);
    }
  };

  const openDialog = (type: ModalType) => {
    setDialogType(type)
    dialogRef?.current?.showModal()
  }

  const onCloseDialog = () => {
    setDialogType(null)
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
      id: data.id,
      nickname: data.nickname,
      avatar: data.avatar,
      vip: data.vip_status,
      urls: data.urls ?? []
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
        <nav className={classNames(styles.navigation, { [styles.navigationActive]: isMenuOpen })
        }>
          <ul className={styles.navigationList}>
            <li className={styles.navigationElement}>
              <button
                onClick={() => handleClick("description")}
                className={styles.link}
                type="button"
              >
                Описание
              </button>
            </li>
            <li className={styles.navigationElement}>
              <button
                onClick={() => handleClick("members")}
                className={styles.link}
                type="button"
              >
                Участники
              </button>
            </li>
            <li className={styles.navigationElement}>
              <button
                onClick={() => handleClick("events")}
                className={styles.link}
                type="button"
              >
                События
              </button>
            </li>
            <li className={styles.navigationElement}>
              <button type="button"
                className={styles.link}
                onClick={() => { window.location.href = "https://cubethrone.fun/installer/CubeThrone.exe" }}>
                Лаунчер
              </button>
            </li>
            {/* <li className={styles.navigationElement}>
              <Link className={styles.link} to="/map">Карта</Link>
            </li> */}
            <li className={styles.navigationElement}>
              <Link className={styles.link} to="/rules">Правила</Link>
            </li>
          </ul>
        </nav>
        {(!isAuthLoading && !isAuth)
          ? (
            <div className={styles.auth}>
              <button type="button" onClick={() => openDialog("Авторизация")} className={styles.authButton}>Войти</button>
              <button type="button" onClick={() => openDialog("Регистрация")} className={classNames(styles.authButton, styles.authButtonRegistry)}>Регистрация</button>
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
                    {
                      personData.vip &&
                      (
                        <>
                          <button type="button" onClick={() => openDialog("Соцсети")}>
                            Соцсети
                          </button>
                          <button type="button" onClick={() => openDialog("Токены")}>
                            Токены
                          </button>
                        </>
                      )
                    }
                    <button type="button" onClick={() => openDialog("Настройки")}>
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
        {/* {
          isModalOpen && (
            <Suspense fallback={null}> */}
        <Dialog
          dialogType={dialogType}
          dialogRef={dialogRef}
          personData={personData}
          setPersonData={setPersonData}
          setIsAuth={setIsAuth}
          onCloseDialog={onCloseDialog}
        // setIsModalOpen={setIsModalOpen}
        />
        {/* </Suspense>
          )
        } */}
        <button
          className={classNames(
            styles.burger,
            {
              [styles.burgerActive]: isMenuOpen
            }
          )}
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
  );
}
