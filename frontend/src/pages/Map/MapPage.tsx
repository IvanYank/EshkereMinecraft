import styles from "./MapPage.module.scss"

export default function MapPage() {
  return (
    <div className={styles.container}>
      <iframe
        className={styles.map}
        title="Карта мира"
        loading="lazy"
        src="https://cubethrone.fun/maps/"
      >
      </iframe>
    </div>
  )
}
