import { useState } from "react"

import { changeAvatarRequest, changePasswordRequest } from "@/api"
import FormLayout from "@/layout/FormLayout"
import FormInput from "../FormInput"

import styles from "./SettingsForm.module.scss"
import Spinner from "../Spinner"

const errorListInitialState = {
  old_password: "",
  new_password: ""
}

export default function SettingsForm({
  oldAvatar,
  closeReg,
  setPersonData,
  isVip
}: SettingsFormProps) {
  const [formValues, setFormValues] = useState({
    old_password: "",
    new_password: ""
  })

  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false)

  const [avatarFile, setAvatarFile] = useState<any>()
  const [avatar, setAvatar] = useState(oldAvatar)
  const [avatarIsChanged, setAvatarIsChanged] = useState(false)

  const [errorList, setErrorList] = useState(errorListInitialState)

  const validate = () => {
    setErrorList(errorListInitialState)

    let errorStatus = true

    if (formValues.old_password.length < 6) {
      errorStatus = false
      setErrorList(prev => ({
        ...prev,
        old_password: "Пароль меньше 6 символов"
      }))
    }

    if (formValues.new_password.length < 6) {
      errorStatus = false
      setErrorList(prev => ({
        ...prev,
        new_password: "Пароль меньше 6 символов"
      }))
    }

    return errorStatus
  }

  const saveAvatarHandler = async () => {
    try {
      if (!avatarFile) return;

      setIsLoadingAvatar(true)

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await changeAvatarRequest(formData)

      if (response.ok) {
        const body = await response.json()

        const oldAvatarURL = avatar
        const newAvatarURL = `https://cubethrone.fun/${body.avatar}`

        setAvatarIsChanged(false)
        setAvatar(newAvatarURL);
        setPersonData((prev: any) => {
          return {
            ...prev,
            avatar: newAvatarURL
          }
        })

        URL.revokeObjectURL(oldAvatarURL)
      }
    } catch (e) {
      console.error(e)
    }

    setIsLoadingAvatar(false)
  }

  const changePasswordHandler = async () => {
    try {
      if (validate()) {
        setIsLoadingPassword(true)

        const response = await changePasswordRequest(formValues)

        if (response.ok) {
          // closeReg()
        } else {
          const json = await response.json()

          for (const key in json) {
            setErrorList(prev => ({
              ...prev,
              [key]: json[key]
            }))
          }

          if (json.error) {
            setErrorList(prev => ({
              ...prev,
              old_password: json.error,
              new_password: json.error,
            }))
          }
        }
      }
    } catch (e) {
      console.error(e)
    }

    setIsLoadingPassword(false)
  }

  const avatarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setAvatarFile(file)
      setAvatar(URL.createObjectURL(file));
      setAvatarIsChanged(true)
    }
  };

  const formDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <FormLayout title="Настройки">
      {
        isVip && (
          <div className={styles.settingsBlock}>
            <label className={styles.avatar}>
              <img
                className={styles.avatarPreview}
                src={avatar}
                alt="Предпросмотр аватара"
              />
              <input type="file" accept=".png,.jpg,.jpeg" onChange={avatarChange} />
            </label>
            <button disabled={!avatarIsChanged || isLoadingAvatar} className={styles.handlerButton} onClick={saveAvatarHandler} type="button">
              {
                isLoadingAvatar
                  ? <Spinner />
                  : "Сохранить"
              }
            </button>
          </div>
        )
      }
      <div className={styles.settingsBlock}>
        <FormInput
          title={"Старый пароль"}
          type={"password"}
          name={"old_password"}
          value={formValues.old_password}
          errorText={errorList.old_password}
          onChange={formDataChange}
        />
        <FormInput
          title={"Новый пароль"}
          type={"password"}
          name={"new_password"}
          value={formValues.new_password}
          errorText={errorList.new_password}
          onChange={formDataChange}
        />
        <button disabled={isLoadingPassword} className={styles.handlerButton} type="button" onClick={changePasswordHandler}>
          {
            isLoadingPassword
              ? <Spinner />
              : "Изменить"
          }
        </button>
      </div>
    </FormLayout>
  )
}