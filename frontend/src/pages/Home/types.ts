export type Event = {
  id: number,
  title: string,
  description: string,
  created_at: string,
  updated_at: string,
  image: string,
}

export type News = {
  id: number,
  title: string,
  text: string,
  created_at: string,
  image: string,
}

export type User = {
  avatar: string,
  id: number,
  nickname: string,
  vip_status: boolean,
  registered_at: string,
}

export type SlideUser = {
  id?: number,
  avatar?: string,
  nickname: string,
}
