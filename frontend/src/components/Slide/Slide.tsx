import styles from "./Slide.module.scss"

export default function Slide({ title, imageUrl, text}: SlideProps) {
  return (
    <div className={styles.container}>
      <div className={styles.textBlock}>
        <h3 className={styles.title}>
          {title}
        </h3>
        <div className={styles.text}>
          {text}
        </div>
      </div>
      <div className={styles.image}>
        <img loading="lazy" src={imageUrl} alt="Slide" />
      </div>
    </div>
  );
}
