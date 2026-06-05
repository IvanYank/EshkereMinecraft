import styles from "./MapPage.module.scss"

export default function MapPage() {
  return (
    <div className={styles.container}>
      <iframe
        className={styles.map}
        title="Карта мира"
        loading="lazy"
        src="http://92.63.189.48:8100/"
      >
      </iframe>
    </div>
  )
}
