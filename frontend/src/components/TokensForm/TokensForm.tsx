import { useEffect, useState } from "react"
import classNames from "classnames"

import { getTokensRequest } from "@/api"
import FormLayout from "@/layout/FormLayout"

import styles from "./TokensForm.module.scss"

export default function TokensForm() {
  const [copyButtonID, setCopyButtonID] = useState<number | null>(null)
  const [tokens, setTokens] = useState([])

  const getActiveTokens = async () => {
    try {
      const data = await getTokensRequest()
      setTokens(data.slice(0, 8))
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
        // isTokensLoading
        //   ? <div className={styles.placeholder}></div>
        // :
        tokens.map((token: any) => (
          <div key={token.id} className={styles.token}>
            <div className={styles.tokenText}>{token.token}</div>
            <button className={classNames(
              styles.tokenCopy,
              {
                [styles.tokenCopyActive]: copyButtonID === token.id
              }
            )}
              type='button'
              onClick={() => copyToken(token.id, token.token)}>
              {copyButtonID === token.id ? "Copied!" : "Copy"}
            </button>
          </div>
        ))
      }
    </FormLayout>
  )
}