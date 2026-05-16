export type loginFormProps = {
  nickname: string,
  password: string
}

export type registerFormProps = {
  nickname: string,
  token: string,
  password: string,
  passwordSecond: string,
}

export type personData = {
  nickname: string,
  avatar?: string
}