type Url = {
  id: number,
  title: string,
  url: string
}

type MemberSlideProps = {
  id?: number,
  nickname: string;
  avatar?: string;
  links?: Url[];
  isLoading?: boolean
}
