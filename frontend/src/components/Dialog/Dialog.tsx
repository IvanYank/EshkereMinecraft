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
  onCloseDialog
}: DialogProps) {
  const closeReg = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog className={styles.dialog} ref={dialogRef} onClose={onCloseDialog}>
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
            isVip={personData.vip}
          />
        )
      }
      {
        dialogType === "Токены" && (
          <TokensForm />
        )
      }
      {
        dialogType === "Соцсети" && (
          <SocialForm
            urls={personData.urls}
          />
        )
      }
    </dialog>
  )
}