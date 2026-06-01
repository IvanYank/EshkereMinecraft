import { useState } from "react"

import FormLayout from "@/layout/FormLayout"

import styles from "./SocialForm.module.scss"
import FormInput from "../FormInput"

export default function SocialForm() {
  const [inputsList, setInputsList] = useState([])

  const submitHandler = async () => {

  }

  return (
    <FormLayout title="Соцсети" submitHandler={submitHandler}>
      {
        <div>
          <FormInput title={""} type={"text"} name={""} value={""} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
            throw new Error("Function not implemented.")
          }}
          />
        </div>
      }
    </FormLayout>
  )
}