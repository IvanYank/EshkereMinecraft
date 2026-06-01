import { useLocation } from 'react-router';
import { useEffect, useState } from 'react';

import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';

import MembersSlide from '@/components/MembersSlide';
import Slide from '@/components/Slide';

import slideImage from "@/assets/slide.webp"

import { Event, News, SlideUser, User } from './types';
import styles from "./Home.module.scss"


export default function Home() {
  const location = useLocation();

  const [vipUsers, setVipUsers] = useState<SlideUser[]>([
    {
      id: 0,
      avatar: undefined,
      nickname: "Серьёзный никнейм"
    },
    {
      id: 1,
      avatar: undefined,
      nickname: "Серьёзный никнейм"
    },
    {
      id: 2,
      avatar: undefined,
      nickname: "Серьёзный никнейм"
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

  const description = `Этот сервер создан не для одиночного выживания, а для живого политического театра, где каждый стрим - новая глава в истории вашего государства. Мир с первого дня поделён на стартовые провинции, а каждый стример станет правителем своей державы. Ваши зрители - не пассивные наблюдатели, а могучая армия, которая под вашим руководством будет защищать границы, штурмовать вражеские крепости и писать историю своими победами.
  
  При старте вы сможете получить одну из четырёх профессий, каждая из которых имеет свои уникальные механики и фишечки. Вы можете стать Войном и идти в бой за своего господина, захватывая территории, либо же уйти в тыл и обеспечивать бойцов необходимым провиантом, играя за Ремесленника. А может вы любите строить? Тогда добро пожаловать в ряды Строителей! Возводите защитные сооружения вокруг важных объектов, стройте красивые фонтанчики у главное здания или просто ставьте кусты у поместья короля. Либо вы можете быть простым Шахтёром. Копать туннели, добывать алмазики, боятся солнечного света...
  
  Куботрон - это сервер, где каждый стример - правитель. Каждый чат - армия. Каждый стрим - балдёжик`

  const mainSliderSlides = [
    {
      title: "Эпические сражения за территории",
      text: `Осады крепостей, полевые битвы и борьба за контроль над провинциями — здесь каждая схватка меняет баланс сил. Сражайся за свои земли, захватывай новые территории и отбивай атаки врагов. Тактика, координация и умение держать удар решают исход войны. Твоя держава растёт с каждой победой.`,
    },
    {
      title: "Найди свой путь в CubeThrone",
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
    if (window.innerWidth >= 1440) return 3;
    if (window.innerWidth >= 910) return 2;
    return 1;
  };

  const getUsers = async () => {
    const response = await fetch("/api/users/")

    if (response.ok) {
      const out = await response.json()
      const slidesPerView = getSlidesPerView()

      let users = out.results
        .filter((user: User) => user.vip_status)
        .map((user: User, i: number) => {
          return {
            id: i % slidesPerView,
            avatar: user.avatar,
            nickname: user.nickname
          }
        })

      const count = (slidesPerView - (users.length % slidesPerView)) % slidesPerView;

      for (let i = 0; i < count; i++) {
        users.push({
          id: i + (slidesPerView - count),
          avatar: undefined,
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

  const links = [
    "https://www.youtube.com/",
    "https://www.twitch.tv/",
    "https://www.tiktok.com/ru-RU/",
    "https://t.me/gordoslavych",
    "https://kick.com/",
    "https://vk.com/feed"
  ]

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
            CubeThrone
          </h1>
          <div className={styles.descriptionText}>
            {description}
          </div>
        </section>
        <div className={styles.border}></div>
        <section id="members" className={styles.members}>
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
                vipUsers.map(user => {
                  return (
                    <SwiperSlide>
                      <MembersSlide id={user.id} title={user.nickname} imageUrl={user.avatar} links={links} />
                    </SwiperSlide>
                  )
                })
              }
            </Swiper>
          </div>
        </section>
        <section aria-label='Блок событий' id='events' className={styles.activity}>
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
