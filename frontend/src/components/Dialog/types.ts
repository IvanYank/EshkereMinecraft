import { ModalType } from "@/types/types"

export type DialogProps = {
  dialogType: ModalType,
  dialogRef: React.RefObject<HTMLDialogElement | null>,
  personData: any,
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>,
  setPersonData: React.Dispatch<React.SetStateAction<{
    nickname: string,
    avatar: string | undefined,
    vip: boolean,
    id: number
  }>>,
}