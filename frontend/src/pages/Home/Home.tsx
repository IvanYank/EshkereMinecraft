import { useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';

import MembersSlide from '@/components/MembersSlide';
import Slide from '@/components/Slide';

import avatar from "@/assets/avatar.jpg"
import slideImage from "@/assets/slide.png"

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

  //   const mainSliderText = [
  //     `Осады крепостей, полевые битвы и борьба за контроль над провинциями — здесь каждая схватка меняет баланс сил. Сражайся за свои земли, захватывай новые территории и отбивай атаки врагов. Тактика, координация и умение держать удар решают исход войны. Твоя держава растёт с каждой победой.`,
  //     `Выберите одну из четырёх профессий:
  // ⚔️ Воин — идите в бой, захватывайте территории
  // 🔨 Ремесленник — снабжайте армию оружием и провиантом
  // 🏗 Строитель — возводите неприступные крепости и красивые города
  // ⛏️ Шахтёр — добывайте ресурсы в глубинах мира

  // Каждая профессия — это уникальные механики и свой вклад в победу!`,
  //     `Политика — это не только войны! Создавай тайные союзы, веди хитрую торговлю и плети заговоры против соседей. Сегодня ты союзник, а завтра — коварный предатель с ножом в спине (буквально)`,
  //     `Ты всё ещё здесь? Серьёзно? Пока ты читаешь этот текст, другие игроки уже захватывают территории, строят империи и становятся легендами!`,
  //   ]

  // const text = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste ad itaque quod repellendus delectus doloremque, quae quibusdam earum eveniet eaque quisquam exercitationem possimus sapiente in voluptatem laborum aliquam, soluta mollitia"

  const description = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.`

  // const slides = [slide, slide, slide, slide]

  const mainSliderSlides = [
    {
      title: "Эпические сражения за территории",
      text: `Осады крепостей, полевые битвы и борьба за контроль над провинциями — здесь каждая схватка меняет баланс сил. Сражайся за свои земли, захватывай новые территории и отбивай атаки врагов. Тактика, координация и умение держать удар решают исход войны. Твоя держава растёт с каждой победой.`,
    },
    {
      title: "Найди свой путь в CubeThron",
      text: `Выберите одну из четырёх профессий:
⚔️ Воин — идите в бой, захватывайте территории
🔨 Ремесленник — снабжайте армию оружием и провиантом
🏗 Строитель — возводите неприступные крепости и красивые города
⛏️ Шахтёр — добывайте ресурсы в глубинах мира

Каждая профессия — это уникальные механики и свой вклад в победу!`,
    },
    {
      title: "Интриги, заговоры и экономика",
      text: `Политика — это не только войны! Создавай тайные союзы, веди хитрую торговлю и плети заговоры против соседей. Сегодня ты союзник, а завтра — коварный предатель с ножом в спине (буквально)`,
    },
    {
      title: "Начни свою историю прямо сейчас!",
      text: `Ты всё ещё здесь? Серьёзно? Пока ты читаешь этот текст, другие игроки уже захватывают территории, строят империи и становятся легендами!`,
    },
  ]

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
              mainSliderSlides.map(slide => {
                return (
                  <SwiperSlide>
                    <Slide title={slide.title} imageUrl={slideImage} text={slide.text} />
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
              slidesPerView={1}
              speed={1200}
              modules={[Pagination, Autoplay]}
              resistanceRatio={0}
              pagination={{
                type: 'progressbar',
              }}
              // autoplay
              breakpoints={{
                910: {
                  slidesPerView: 2,
                  spaceBetween: 30
                },
                1440: {
                  slidesPerView: 3,
                  spaceBetween: 30
                }
              }}
            >
              {
                [1, 2, 3, 4].map(_ => {
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
              <div className={styles.activityContent}>
                Ох, вы не поверите случилась беда.Да беда не малая, такое случилось, вы себе представить не сможете. Вам лучше прочитать и всё сразу поймёте
              </div>
            </div>
          </article>
          <article className={styles.activityBlock}>
            <h2 className={styles.activityTitle}>Ближайшие события</h2>
            <div className={styles.activityText}>
              <div className={styles.activityContent}>
                {events[0]?.description}
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
