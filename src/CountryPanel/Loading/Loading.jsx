import { motion } from "framer-motion";
import styles from "./Loading.module.css";

export default function LoadingPage() {
  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.glassBox}
        initial={{ opacity: 0, scale: .9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: .35 }}
      >
        <div className={styles.spinner} />
        <div className={styles.text}>Loading, please wait…</div>
      </motion.div>
    </div>
  );
}

