import classNames from "classnames";
import styles from "./FormInput.module.scss"

export default function FormInput({
  disabled = false,
  className,
  title,
  type = "text",
  name,
  value,
  errorText,
  onChange
}: FormInputProps) {
  return (
    <label className={classNames(styles.formBlock, className)}>
      {
        title &&
        <div className={styles.formBlockTitle}>{title}</div>
      }
      <input
        disabled={disabled}
        className={styles.formBlockInput}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
      {
        errorText != undefined &&
        <div className={styles.formBlockError}>{errorText}</div>
      }
    </label>
  );
}
