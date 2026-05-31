import SettingsForm from '../SettingsForm'
import RegisterForm from '../RegisterForm'
import TokensForm from '../TokensForm'
import SocialForm from '../SocialForm'
import LoginForm from '../LoginForm'

import { DialogProps } from './types'
import styles from './Dialog.module.scss'

export default function Dialog({
  dialogType,
  dialogRef,
  personData,
  setPersonData,
  setIsAuth,
}: DialogProps) {
  const closeReg = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog className={styles.dialog} ref={dialogRef}>
      <button className={styles.dialogClose} type="button" onClick={closeReg}></button>
      {
        dialogType === "Авторизация" && (
          <LoginForm
            closeReg={closeReg}
            setPersonData={setPersonData}
            setIsAuth={setIsAuth}
          />
        )
      }
      {
        dialogType === "Регистрация" && (
          <RegisterForm
            closeReg={closeReg}
            setPersonData={setPersonData}
            setIsAuth={setIsAuth}
          />
        )
      }
      {
        dialogType === "Настройки" && (
          <SettingsForm
            closeReg={closeReg}
            setPersonData={setPersonData}
            oldAvatar={personData.avatar}
            id={personData.id}
          />
        )
      }
      {
        dialogType === "Токены" && (
          <TokensForm />
        )
      }
      {/* {
        dialogType === "Соцсети" && (
          <SocialForm />
        )
      } */}
    </dialog>
  )
}