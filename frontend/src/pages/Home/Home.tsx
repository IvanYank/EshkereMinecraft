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

import { Event, News, SlideUser, User } from './types';
import styles from "./Home.module.scss"


export default function Home() {
  const location = useLocation();

  const [vipUsers, setVipUsers] = useState<SlideUser[]>([
    {
      avatar: avatar,
      nickname: "Ник"
    },
    {
      avatar: avatar,
      nickname: "Ник"
    },
    {
      avatar: avatar,
      nickname: "Ник"
    },
  ])

  const [events, setEvents] = useState<Event[]>([{
    id: 0,
    title: 'Новое событие',
    description: 'Это очень крутое и интересное событие, которые случилось в этом мире. Думаю всем следует знать об этом',
    created_at: '',
    updated_at: '',
    image: ''
  }])

  const [news, setNews] = useState<News[]>([{
    id: 0,
    title: 'Новая новость',
    text: 'Это самая важная новость в важей жизни. Читайте, расскажите о ней всем своим друзьям и знакомым',
    created_at: '',
    image: ''
  }])

  const description = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.

  Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti voluptatibus quasi alias veniam iste fuga. Magnam modi, corporis eum deleniti expedita nobis ducimus commodi architecto quam repellendus atque ut. Iure.`

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
    const response = await fetch("/api/events/")

    if (response.ok) {
      const output = await response.json()

      setEvents(output.results)
    }
  }

  const getNews = async () => {
    const response = await fetch("/api/news/")

    if (response.ok) {
      const output = await response.json()
      
      setNews(output.results)
    }
  }

  const getSlidesPerView = () => {
    if (window.innerWidth > 1440) return 3;
    if (window.innerWidth > 910) return 2;
    return 1;
  };

  const getUsers = async () => {
    const response = await fetch("/api/users/")

    if (response.ok) {
      const out = await response.json()

      let users = out.results
        .filter((user: User) => user.vip_status)
        .map((user: User) => ({
          avatar: user.avatar ?? avatar,
          nickname: user.nickname
        }))

      const count = (getSlidesPerView() - (users.length % getSlidesPerView())) % getSlidesPerView();

      for (let i = 0; i < count; i++) {
        users.push({
          avatar: avatar,
          nickname: "Серьёзный никнейм"
        })
      }

      setVipUsers(users)
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
    getNews()
    getUsers()
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
              autoplay
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
                vipUsers.map(user => {
                  return (
                    <SwiperSlide>
                      <MembersSlide title={user.nickname} imageUrl={user.avatar} text={"Чем знаменит?\nА знаменит многим!"} />
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
                {news[0]?.text}
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
