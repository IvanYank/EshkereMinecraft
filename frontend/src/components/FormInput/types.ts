type FormInputProps = {
  title: string,
  type: "text" | "password",
  name: string,
  value: string,
  errorText?: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}