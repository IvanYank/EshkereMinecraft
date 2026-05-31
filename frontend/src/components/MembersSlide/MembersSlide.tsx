import classNames from "classnames";

import styles from "./MembersSlide.module.scss"

export default function MembersSlide({ id, title, imageUrl, links }: MemberSlideProps) {
  return (
    <div className={styles.container}>
      <div className={styles.textBlock}>
        <h3 className={styles.title}>
          {title}
        </h3>
        <div className={styles.links}>
          {
            links?.map((link, index) => {
              let hostname = new URL(link)
                .hostname
                .replace(/^www\./, '')

              if (hostname === "t.me") {
                hostname = "telegram"
              } else {
                hostname = hostname.split(".")[0]
              }

              return (
                <div key={`${index}_${hostname}`} className={styles.link}>
                  <a href={link} target="blank">{hostname}</a>
                </div>
              )
            })
          }
        </div>
      </div>
      <div className={styles.image}>
        {
          imageUrl
            ? <img src={imageUrl} loading="lazy" alt="Аватар участника" />
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
