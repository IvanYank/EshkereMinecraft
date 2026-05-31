import styles from "./FormLayout.module.scss"

export default function FormLayout({
  title,
  children,
  submitHandler,
}: FormLayoutProps) {
  return (
    <form onSubmit={submitHandler} className={styles.form}>
      <h2 className={styles.formTitle}>{title}</h2>
      {children}
      {
        submitHandler && (
          <button className={styles.formSubmit} type="submit">Отправить</button>
        )
      }
    </form>
  )
}