import classNames from "classnames";

import styles from "./MembersSlide.module.scss"

export default function MembersSlide({
  id,
  nickname,
  avatar,
  links,
  isLoading = false
}: MemberSlideProps) {
  return (
    <div className={styles.container}>
      <div className={classNames(
        styles.textBlock,
        {
          [styles.textBlockLoading]: isLoading
        }
      )}>
        <h3 className={styles.title}>
          {nickname}
        </h3>
        <div className={styles.links}>
          {
            links?.length
              ? links.map((link, index) => {
                return (
                  <div key={`${nickname}_${index}`} className={styles.link}>
                    <a href={link.url} target="blank">{link.title}</a>
                  </div>
                )
              })
              : <div>{"Чем знаменит?\nА знаменит многим!"}</div>
          }
        </div>
      </div>
      <div className={styles.image}>
        {
          avatar
            ? <img src={avatar} loading="lazy" alt="Аватар участника" />
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
