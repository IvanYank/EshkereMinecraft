type FormInputProps = {
  disabled?: boolean,
  className?: string,
  title?: string,
  type?: "text" | "password",
  name: string,
  value: string,
  errorText?: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}