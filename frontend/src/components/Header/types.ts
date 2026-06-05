import { PersonUrl } from "@/types/types"

export type PersonData = {
  id: number,
  nickname: string,
  avatar: string | undefined,
  vip: boolean,
  urls: PersonUrl[]
}