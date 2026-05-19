import classNames from "classnames";
import styles from "./MembersSlide.module.scss"

type SlideProps = {
  id?: number,
  title?: string;
  imageUrl?: string;
  text: string;
}

export default function MembersSlide({ id, title, imageUrl, text }: SlideProps) {
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
        {
          imageUrl
            ? <img src={imageUrl} alt="Аватар участника" />
            : <div className={classNames(
              styles.imagePlaceholder,
              styles[`imagePlaceholder${id}`],
            )}>
            </div>
        }
      </div>
    </div>
  );
}
