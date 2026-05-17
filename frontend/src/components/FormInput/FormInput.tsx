import styles from "./FormInput.module.scss"
import { Props } from "./types";

export default function FormInput({
  title,
  type,
  name,
  value,
  errorText,
  onChange
}: Props) {
  return (
    <label className={styles.formBlock}>
      <div className={styles.formBlockTitle}>{title}</div>
      <input
        className={styles.formBlockInput}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
      <div className={styles.formBlockError}>{errorText}</div>
    </label>
  );
}
