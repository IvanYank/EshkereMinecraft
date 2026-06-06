import { useEffect, useState } from "react"
import classNames from "classnames"

import { getTokensRequest } from "@/api"
import FormLayout from "@/layout/FormLayout"

import styles from "./TokensForm.module.scss"

export default function TokensForm() {
  const [isLoading, setIsLoading] = useState(true)

  const [tokens, setTokens] = useState((new Array(8)
    .fill({
      id: -1,
      token: "token"
    })
  )
  )
  const [copyButtonID, setCopyButtonID] = useState<number | null>(null)

  const getActiveTokens = async () => {
    try {
      const data = await getTokensRequest()

      setTokens(data.slice(0, 8))
      setIsLoading(false)
    } catch (e) {
      console.error(e)
    }
  }

  const copyToken = async (id: number, token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopyButtonID(id)

      setTimeout(() => {
        setCopyButtonID(null)
      }, 2000)
    } catch (error) {
      console.error('Ошибка копирования', error);
    }
  }

  useEffect(() => {
    getActiveTokens()
  }, [])

  return (
    <FormLayout title="Токены">
      {
        (tokens.map((token: any, index) => (
          <div key={`${token.id}_${index}`} className={classNames(styles.token)}>
            <div className={classNames(
              styles.tokenText,
              {
                [styles.tokenTextLoading]: isLoading
              }
            )}
            >
              {token.token}
            </div>
            <button className={classNames(
              styles.tokenCopy,
              {
                [styles.tokenCopyActive]: copyButtonID === token.id
              }
            )}
              disabled={isLoading}
              type='button'
              onClick={() => copyToken(token.id, token.token)}>
              {copyButtonID === token.id ? "Copied!" : "Copy"}
            </button>
          </div>
        )))
      }
    </FormLayout>
  )
}