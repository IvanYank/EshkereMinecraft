import { useState } from "react"

import { addSocialRequest } from "@/api/apiRequests"
import { SocialFormProps } from "./types"
import { PersonUrl } from "@/types/types"
import FormLayout from "@/layout/FormLayout"
import FormInput from "../FormInput"
import Check from '@/assets/check.svg?react';
import Basket from '@/assets/basket.svg?react';

import styles from "./SocialForm.module.scss"
import Spinner from "../Spinner"

export default function SocialForm({
  urls
}: SocialFormProps) {
  const [inputsList, setInputsList] = useState<PersonUrl[]>(urls
    .concat(new Array(5 - urls.length)
      .fill({
        id: -1,
        title: "",
        url: ""
      })
    )
  )

  const [loadingList, setLoadingList] = useState(new Array(5).fill(false))

  const inputChangeHandler = (index: number, type: "title" | "url", value: string) => {
    setInputsList(prev => {
      return prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, [type]: value };
        }
        return item;
      });
    });
  };

  const addNewLink = async (index: number, type: "add" | "remove") => {
    try {
      const { id, ...rest } = inputsList[index]

      let body: { id: number } | Omit<PersonUrl, "id">
      let method: "POST" | "DELETE" = "POST"

      if (type === "add") {
        method = "POST"
        body = rest
      } else {
        method = "DELETE"
        body = { id }
      }

      setLoadingList(prev => {
        return prev.map((item, idx) => index === idx ? true : item)
      })

      const response = await addSocialRequest(method, body)

      if (response.ok) {
        const body = await response.json()

        setInputsList(prev => {
          return prev.map((item, idx) => {
            if (idx === index) {
              return type === "remove"
                ? {
                  id: -1,
                  title: "",
                  url: ""
                }
                : {
                  id: body.id,
                  title: body.title,
                  url: body.url
                }
            }

            return item;
          });
        });
      }
    } catch (e) {
      console.log(e)
    }

    setLoadingList(prev => {
      return prev.map((item, idx) => index === idx ? false : item)
    })
  }

  return (
    <FormLayout title="Соцсети">
      {
        inputsList.map((value, index) => {
          return (
            <div key={index} className={styles.block}>
              <FormInput
                disabled={loadingList[index]}
                className={styles.title}
                title={"Название"}
                name={`title_${index}`}
                value={value.title}
                onChange={(e) => inputChangeHandler(index, "title", e.target.value)}
              />
              <FormInput
                disabled={loadingList[index]}
                className={styles.url}
                title={"Ссылка"}
                name={`link_${index}`}
                value={value.url}
                onChange={(e) => inputChangeHandler(index, "url", e.target.value)}
              />
              <button
                disabled={loadingList[index]}
                className={styles.actionButton}
                type="button"
                onClick={
                  value.id === -1
                    ? () => { addNewLink(index, "add") }
                    : () => { addNewLink(index, "remove") }
                }
              >
                {
                  loadingList[index]
                    ? <Spinner />
                    : (
                      value.id === -1
                        ? <Check className={styles.actionIcon} />
                        : <Basket className={styles.actionIcon} />
                    )
                }
              </button>
            </div>
          )
        })
      }
    </FormLayout>
  )
}