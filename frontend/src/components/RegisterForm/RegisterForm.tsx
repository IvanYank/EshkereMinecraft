import { useState } from "react"

import FormLayout from "@/layout/FormLayout"
import FormInput from "../FormInput"

const errorListInitialState = {
  nickname: "",
  token: "",
  password: "",
  passwordSecond: ""
}

export default function RegisterForm({
  closeReg,
  setPersonData,
  setIsAuth
}: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [formValues, setFormValues] = useState({
    nickname: "",
    token: "",
    password: "",
    passwordSecond: ""
  })

  const [errorList, setErrorList] = useState(errorListInitialState)

  const formValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validate = () => {
    setErrorList(errorListInitialState)

    let errorStatus = true

    if (formValues.password.length < 6) {
      errorStatus = false
      setErrorList(prev => ({
        ...prev,
        password: "Пароль меньше 6 символов"
      }))
    }

    if (formValues.nickname.length == 0) {
      errorStatus = false
      setErrorList(prev => ({
        ...prev,
        nickname: "Поле должно быть заполнено"
      }))
    }

    if (formValues.passwordSecond.length == 0) {
      errorStatus = false
      setErrorList(prev => ({
        ...prev,
        passwordSecond: "Поле должно быть заполнено"
      }))
    }

    if (formValues.token.length == 0) {
      errorStatus = false
      setErrorList(prev => ({
        ...prev,
        token: "Поле должно быть заполнено"
      }))
    }

    return errorStatus
  }

  const submitHandler = async (e: React.SubmitEvent) => {
    e.preventDefault()

    try {
      let url = "api/users/register/"

      let headers = {
        "Content-type": "Application/json",
      };

      const { passwordSecond, ...rest } = formValues

      let body = rest

      if (validate()) {
        setIsLoading(true)

        const response = await fetch(url, {
          headers: headers,
          method: "POST",
          body: JSON.stringify(body)
        })

        const json = await response.json()

        if (response.ok) {
          setPersonData({
            id: json.user.id,
            nickname: json.user.nickname,
            avatar: json.user.avatar,
            vip: json.user.vip_status,
            urls: json.user.urls ?? []
          })

          localStorage.setItem("accessToken", json.access)

          setIsAuth(true)
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
            }))
          }
        }
      }
    } catch (e) {
      console.error(e)
    }

    setIsLoading(false)
  }

  return (
    <FormLayout title="Регистрация" submitHandler={submitHandler} isLoading={isLoading}>
      <FormInput
        title={"Никнейм"}
        name={"nickname"}
        value={formValues.nickname}
        errorText={errorList.nickname}
        onChange={formValuesChange}
        disabled={isLoading}
      />
      <FormInput
        title={"Токен"}
        name={"token"}
        value={formValues.token}
        errorText={errorList.token}
        onChange={formValuesChange}
        disabled={isLoading}
      />
      <FormInput
        title={"Пароль"}
        type={"password"}
        name={"password"}
        value={formValues.password}
        errorText={errorList.password}
        onChange={formValuesChange}
        disabled={isLoading}
      />
      <FormInput
        title={"Повторный пароль"}
        type={"password"}
        name={"passwordSecond"}
        value={formValues.passwordSecond}
        errorText={errorList.passwordSecond}
        onChange={formValuesChange}
        disabled={isLoading}
      />
    </FormLayout>
  )
}