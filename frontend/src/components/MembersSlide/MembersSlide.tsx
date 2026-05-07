import styles from "./MembersSlide.module.scss"

type SlideProps = {
  title?: string;
  imageUrl: string;
  text: string;
}

export default function MembersSlide({ title, imageUrl, text }: SlideProps) {
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
        <img src={imageUrl} alt="avatar" />
      </div>
    </div>
  );
}
