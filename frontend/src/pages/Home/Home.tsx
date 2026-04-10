import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import avatar from "@/assets/avatar.jpg"
import slide1 from "@/assets/slide1.jpg"
import slide2 from "@/assets/slide2.jpg"
import slide3 from "@/assets/slide3.jpg"
import slide4 from "@/assets/slide4.jpg"

import Slide from '@/components/Slide';

import styles from "./Home.module.scss"

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useLocation } from 'react-router';
import { useEffect } from 'react';

export default function Home() {
  const location = useLocation();

  const text = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia"

  const description = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.`

  const slides = [slide1, slide2, slide3, slide4]

  const news = [
    {
      title: "Новость 1",
      text: "Ох, вы не поверите случилась беда. Да беда не малая, такое случилось, вы себе представить не сможете. Вам лучше прочитать и всё сразу поймёте"
    },
    {
      title: "Новость 2",
      text: "Ох, вы не поверите случилась беда. Да беда не малая, такое случилось, вы себе представить не сможете. Вам лучше прочитать и всё сразу поймёте"
    },
    {
      title: "Новость 3",
      text: "Ох, вы не поверите случилась беда. Да беда не малая, такое случилось, вы себе представить не сможете. Вам лучше прочитать и всё сразу поймёте"
    },
  ]

  const events = [
    {
      title: "Событие 1",
      description: "Описание не самое длинное, но хотя бы есть. \n\n Описание не самое длинное, но хотя бы есть. \n Описание не самое длинное, но хотя бы есть",
      date: new Date(2026, 3, 1)
    },
    {
      title: "Событие 2",
      description: "Описание не самое длинное, но хотя бы есть. \n\n Описание не самое длинное, но хотя бы есть. \n Описание не самое длинное, но хотя бы есть",
      date: new Date(2026, 3, 10)
    },
    {
      title: "Открытие сервера",
      description: "Описание не самое длинное, но хотя бы есть. \n\n Описание не самое длинное, но хотя бы есть. \n Описание не самое длинное, но хотя бы есть",
      date: new Date(2026, 3, 28)
    },
  ]

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);

      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.slider}>
          <Swiper
            slidesPerView={1}
            modules={[Pagination]}
            pagination={{ clickable: true }}
            resistanceRatio={0}
            speed={600}
            loop
          >
            {
              slides.map(slide => {
                return (
                  <SwiperSlide>
                    <Slide title={"Заголовок"} imageUrl={slide} text={text} />
                  </SwiperSlide>
                )
              })
            }
          </Swiper>
        </div>
        <div id='description' className={styles.description}>
          <h2 className={styles.descriptionTitle}>
            Куботон
          </h2>
          <div className={styles.descriptionText}>
            {description}
          </div>
        </div>
        <div className={styles.members}>
          <h2 className={styles.membersTitle}>
            Участники
          </h2>
          <div className={styles.membersList}>
            <Swiper
              slidesPerView={1}
              speed={1200}
              modules={[Autoplay]}
              resistanceRatio={0}
              loop
              autoplay
            >
              {
                slides.map(slide => {
                  return (
                    <SwiperSlide>
                      <Slide title={"Серьёзный никнейм"} imageUrl={avatar} text={"Чем знаменит?\nА знаменит многим!"} titleSize={24} />
                    </SwiperSlide>
                  )
                })
              }
            </Swiper>
          </div>
        </div>
        <div className={styles.news}>
          {
            news.map((article, i) => {
              return (
                <div className={styles.article} key={i}>
                  <h3 className={styles.articleTitle}>
                    {article.title}
                  </h3>
                  <div className={styles.articleText}>
                    {article.text}
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className={styles.events}>
          <h2 className={styles.eventsTitle}>
            Ближайшие события
          </h2>
          <div className={styles.eventsContent}>
            {
              events.map((event, index) => {
                return (
                  <div key={index} className={styles.event}>
                    <h3 className={styles.eventTitle}>
                      {event.title}
                    </h3>
                    <div className={styles.eventDescription}>
                      {event.description}
                    </div>
                    <div className={styles.eventDate}>
                      Дата: {event.date.toLocaleDateString()}
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
