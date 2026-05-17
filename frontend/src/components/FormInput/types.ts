export type Props = {
  title: string,
  type: "text" | "password",
  name: string,
  value: string,
  errorText?: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}