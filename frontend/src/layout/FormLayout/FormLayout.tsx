import Spinner from "@/components/Spinner"
import styles from "./FormLayout.module.scss"

export default function FormLayout({
  isLoading,
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
          <button
            disabled={isLoading}
            className={styles.formSubmit}
            type="submit"
          >
            {
              isLoading
                ? <Spinner />
                : "Отправить"
            }
          </button>
        )
      }
    </form>
  )
}