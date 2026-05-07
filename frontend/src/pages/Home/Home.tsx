import { useLocation } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';

import MembersSlide from '@/components/MembersSlide';
import Slide from '@/components/Slide';
import avatar from "@/assets/avatar.jpg"
import slide from "@/assets/slide.png"

import styles from "./Home.module.scss"

type Event = {
  id: number,
  title: string,
  description: string,
  created_at: string,
  updated_at: string,
  image: string,
}


export default function Home() {
  const [events, setEvents] = useState<Event[]>([{
    id: 0,
    title: '',
    description: '',
    created_at: '',
    updated_at: '',
    image: ''
  }])

  const location = useLocation();

  const text = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia"

  const description = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.`

  const slides = [slide, slide, slide, slide]

  const getEvents = async () => {
    const response = await fetch("/api/events")

    if (response.ok) {
      const output = await response.json()
      setEvents(output.results)
    }
  }

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);

      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  useEffect(() => {
    getEvents()
  }, [])

  // IvanOdmen
  // 123456qwerty

  // Ivan
  // 123123123

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <section aria-label='Главный слайдер' className={styles.slider}>
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
        </section>
        <section id='description' aria-label='Описание' className={styles.description}>
          <h1 className={styles.descriptionTitle}>
            Куботон
          </h1>
          <div className={styles.descriptionText}>
            {description}
          </div>
        </section>
        <div className={styles.border}></div>
        <section className={styles.members}>
          <h2 className={styles.membersTitle}>
            Участники
          </h2>
          <div className={styles.membersList}>
            <Swiper
              slidesPerView={3}
              spaceBetween={30}
              speed={1200}
              modules={[Pagination, Autoplay]}
              resistanceRatio={0}
              pagination={{
                type: 'progressbar',
              }}
              autoplay
            >
              {
                slides.map(slide => {
                  return (
                    <SwiperSlide>
                      <MembersSlide title={"Серьёзный никнейм"} imageUrl={avatar} text={"Чем знаменит?\nА знаменит многим!"} />
                    </SwiperSlide>
                  )
                })
              }
            </Swiper>
          </div>
        </section>
        <section aria-label='Блок событий' className={styles.activity}>
          <article className={styles.activityBlock}>
            <h2 className={styles.activityTitle}>Новости</h2>
            <div className={styles.activityText}>
              Ох, вы не поверите случилась беда.Да беда не малая, такое случилось, вы себе представить не сможете. Вам лучше прочитать и всё сразу поймёте
            </div>
          </article>
          <article className={styles.activityBlock}>
            <h2 className={styles.activityTitle}>Ближайшие события</h2>
            <div className={styles.activityText}>
              {events[0]?.description}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
