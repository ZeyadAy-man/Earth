import HandleRegionSelect from "../Handles/HandleSelectRegion";
import styles from "./RegionDetails.module.css";
import { IoImage } from "react-icons/io5";
import { motion } from "framer-motion";

export default function RegionDetails({
  regions = [],
  loading,
  onRegionSelect,
  country,
  setSelectedRegionName,
  setRegionLoading,
  setRegionImage,
  setHotelImage,
  setAttractionImage,
  regionLoading,
  regionImage,
}) {
  const regionsLoading = loading?.regions;

  const handleChange = (e) => {
    HandleRegionSelect({
      e,
      onRegionSelect,
      regions,
      country,
      setSelectedRegionName,
      setRegionLoading,
      setRegionImage,
      setHotelImage,
      setAttractionImage,
    });
  };

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* ===== Header ===== */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>
          <span className={styles.headerEmoji}>🏙️</span>
          <span className={styles.headerText}>Regions / Governorates</span>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className={styles.body}>
        {regionsLoading ? (
          <div className={styles.skeletonWrap}>
            <div className={styles.skelLine} />
            <div className={styles.skelLineShort} />
            <div className={styles.skelImage} />
          </div>
        ) : regions && regions.length ? (
          <>
            {/* Dropdown */}
            <motion.div
              className={styles.dropdownWrap}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <select
                className={styles.dropdown}
                defaultValue=""
                onChange={handleChange}
              >
                <option value="" disabled>
                  — Select region —
                </option>
                {regions.map((r, i) => (
                  <option key={r.geonameId || r.name || i} value={i}>
                    {r.name} {r.adminCode ? `(${r.adminCode})` : ""}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Image Preview */}
            <motion.div
              className={styles.imageWrap}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {regionLoading ? (
                <div className={styles.loadingText}>Loading region image...</div>
              ) : regionImage ? (
                <motion.img
                  key={regionImage}
                  src={regionImage}
                  alt="region"
                  className={`${styles.regionImage} ${styles["fade-in"]}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              ) : (
                <div className={styles.imageEmpty}>
                  <IoImage size={20} style={{ marginRight: 8 }} />
                  No region image selected
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className={styles.noData}>No regions available.</div>
        )}
      </div>
    </motion.div>
  );
}
