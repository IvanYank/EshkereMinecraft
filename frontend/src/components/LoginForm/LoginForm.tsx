import FormLayout from "@/layout/FormLayout"
import FormInput from "../FormInput"
import { useState } from "react"

const errorListInitialState = {
  nickname: "",
  password: ""
}

export default function LoginForm({
  closeReg,
  setPersonData,
  setIsAuth
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [formValues, setFormValues] = useState({
    nickname: "",
    password: ""
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

    return errorStatus
  }

  const submitHandler = async (e: React.SubmitEvent) => {
    e.preventDefault()

    try {
      let url = "api/users/login/"

      let headers = {
        "Content-type": "Application/json",
      };

      if (validate()) {
        setIsLoading(true)

        const response = await fetch(url, {
          headers: headers,
          method: "POST",
          body: JSON.stringify(formValues)
        })

        const json = await response.json()

        if (response.ok) {
          setPersonData({
            id: json.user.id,
            nickname: json.user.nickname,
            avatar: `https://cubethrone.fun/${json.user.avatar}`,
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
    <FormLayout title="Авторизация" submitHandler={submitHandler} isLoading={isLoading}>
      <FormInput
        disabled={isLoading}
        title={"Никнейм"}
        name={"nickname"}
        value={formValues.nickname}
        errorText={errorList.nickname}
        onChange={formValuesChange}
      />
      <FormInput
        disabled={isLoading}
        title={"Пароль"}
        type={"password"}
        name={"password"}
        value={formValues.password}
        errorText={errorList.password}
        onChange={formValuesChange}
      />
    </FormLayout>
  )
}