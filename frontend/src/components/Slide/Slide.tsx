import styles from "./Slide.module.scss"


type SlideProps = {
  title?: string;
  imageUrl: string;
  text: string;
  titleSize?: number;
  textSize?: number;
}

export default function Slide({ title, imageUrl, text, titleSize, textSize }: SlideProps) {
  return (
    <div className={styles.container}>
      <div className={styles.textBlock}>
        <h3 className={styles.title} style={{fontSize: titleSize}}>
          {title}
        </h3>
        <div className={styles.text} style={{fontSize: textSize}}>
          {text}
        </div>
      </div>
      <div className={styles.image}>
        <img src={imageUrl} alt="Slide" />
      </div>
    </div>
  );
}
