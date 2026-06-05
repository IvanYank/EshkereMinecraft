import { ModalType } from "@/types/types"
import { PersonData } from "../Header/types"

export type DialogProps = {
  dialogType: ModalType,
  dialogRef: React.RefObject<HTMLDialogElement | null>,
  personData: PersonData,
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>,
  setPersonData: React.Dispatch<React.SetStateAction<PersonData>>,
}