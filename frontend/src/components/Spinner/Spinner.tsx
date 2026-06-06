import styles from "./Spinner.module.scss"

export default function Spinner({

}) {
  return (
    <div className={styles.spinnerOverlay}>
      <div
        className={styles.spinner}
        style={{
          // width: `${size}px`,
          // height: `${size}px`,
          // color: color,
          // borderWidth: `${thickness}px`,
        }}
      />
    </div>
  );
}
