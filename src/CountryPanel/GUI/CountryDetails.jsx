import { useEffect, useMemo, useState } from "react";
import {
  IoFlag,
  IoLocationSharp,
  IoTime,
  IoPeople,
  IoCopy,
  IoChevronBack,
  IoChevronForward,
  IoGlobe,
} from "react-icons/io5";
import styles from "./CountryDetails.module.css";
/**
 * Props:
 * - geoData { lat, lon }
 * - country (REST Countries object)
 * - weatherData (optional)
 * - capitalImage (string or array)  // backwards compatible
 *
 * This component is backward-compatible with your existing usage.
 */
export default function CountryDetails({
  geoData,
  country,
  weatherData,
  capitalImage,
}) {
  const [copied, setCopied] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const capitalImages = useMemo(() => {
    if (!capitalImage) return [];
    if (Array.isArray(capitalImage)) return capitalImage;
    return [capitalImage];
  }, [capitalImage]);

  // Auto-advance slideshow every 4s if more than 1 image
  useEffect(() => {
    if (capitalImages.length <= 1) return;
    const id = setInterval(() => {
      setImgIndex((i) => (i + 1) % capitalImages.length);
    }, 4000);
    return () => clearInterval(id);
  }, [capitalImages.length]);

  // Copy coords
  const handleCopyCoords = async () => {
    if (!geoData) return;
    const text = `${geoData.lat.toFixed(6)}, ${geoData.lon.toFixed(6)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      // ignore
    }
  };

  // Format helpers
  const fmtNumber = (n) =>
    n == null ? "N/A" : typeof n === "number" ? n.toLocaleString() : n;
  const fmtArea = (a) =>
    a == null ? "N/A" : `${Number(a).toLocaleString()} km²`;
  const getLanguages = (c) =>
    c?.languages ? Object.values(c.languages).join(", ") : "N/A";
  const getCurrencies = (c) =>
    c?.currencies
      ? Object.values(c.currencies)
          .map((cu) => `${cu.name}${cu.symbol ? ` (${cu.symbol})` : ""}`)
          .join(", ")
      : "N/A";

  // Local time attempt: parse "UTC+02:00" or use Intl if an IANA zone exists
  const localTime = useMemo(() => {
    if (!country) return null;
    const tzs = country.timezones || [];
    if (tzs.length === 0) return null;

    const first = tzs[0]; // RESTCountries gives something like "UTC+02:00" often
    // Try parse "UTC±HH:MM"
    const m = first.match(/^UTC([+-]\d{1,2})(?::?(\d{2}))?$/i);
    if (m) {
      const hours = parseInt(m[1], 10);
      const mins = parseInt(m[2] || "0", 10);
      const now = new Date();
      // compute UTC milliseconds then add offset
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const offsetMs = (hours * 60 + (hours >= 0 ? mins : -mins)) * 60000;
      return new Date(utc + offsetMs);
    }
    // Else try Intl with timezone string (if it's IANA)
    try {
      const dt = new Date();
      const fmt = new Intl.DateTimeFormat(undefined, {
        timeZone: first,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      // just format to string (we also return a Date object by creating one from formatted pieces is complicated)
      return fmt.format(dt);
    } catch (err) {
      return null;
    }
  }, [country]);

  // Render skeleton if no country
  if (!country) {
    return (
      <div className={styles["cd-root"]}>
        <div className={styles["cd-skeleton header"]} />
        <div className={styles["cd-skeleton line"]} />
        <div className={styles["cd-skeleton line short"]} />
        <div className={styles["cd-skeleton image"]} />
      </div>
    );
  }

  return (
    <div className={styles["cd-root fade-in-cd"]}>
      {/* header */}
      <div className={styles["cd-header"]}>
        {country?.flags?.svg ? (
          <img src={country.flags.svg} alt="flag" className={styles["cd-flag"]} />
        ) : (
          <div className={styles["cd-flag cd-flag-empty"]}>🏳️</div>
        )}

        <div className={styles["cd-title-group"]}>
          <div className={styles["cd-name"]}>{country?.name?.common}</div>
          <div className={styles["cd-sub"]}>
            <span className={styles["cd-chip"]}>
              <IoGlobe size={14} style={{ marginRight: 6 }} />
              {country?.region} {country?.subregion ? `• ${country.subregion}` : ""}
            </span>
            {country?.cca2 && (
              <span className={styles["cd-chip"]}>Code: {country.cca2}</span>
            )}
          </div>
        </div>
      </div>

      {/* main info rows */}
      <div className={styles["cd-grid"]}>
        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>
            <IoFlag /> Capital
          </div>
          <div className={styles["cd-row-value"]}>{country?.capital?.[0] || "N/A"}</div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>
            <IoPeople /> Population
          </div>
          <div className={styles["cd-row-value"]}>
            {fmtNumber(country?.population) || "N/A"}
          </div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>
            <IoLocationSharp /> Coordinates
          </div>
          <div className={styles["cd-row-value coords-inline"]}>
            <div>
              {geoData
                ? `${geoData.lat.toFixed(4)}, ${geoData.lon.toFixed(4)}`
                : "N/A"}
            </div>
            <button className={styles["cd-copy-btn"]} onClick={handleCopyCoords}>
              {copied ? "✓ Copied" : <><IoCopy /> Copy</>}
            </button>
          </div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>
            <IoTime /> Local Time
          </div>
          <div className={styles["cd-row-value"]}>
            {localTime
              ? typeof localTime === "string"
                ? localTime
                : localTime.toLocaleString()
              : "N/A"}
          </div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>Area</div>
          <div className={styles["cd-row-value"]}>{fmtArea(country?.area)}</div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>Languages</div>
          <div className={styles["cd-row-value"]}>{getLanguages(country)}</div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>Currencies</div>
          <div className={styles["cd-row-value"]}>{getCurrencies(country)}</div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>Timezones</div>
          <div className={styles["cd-row-value"]}>
            {(country?.timezones || []).slice(0, 3).join(", ") || "N/A"}
          </div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>Neighbors</div>
          <div className={styles["cd-row-value"]}>
            {country?.borders && country.borders.length > 0
              ? country.borders.join(", ")
              : "None"}
          </div>
        </div>

        <div className={styles["cd-row"]}>
          <div className={styles["cd-row-label"]}>Weather</div>
          <div className={styles["cd-row-value"]}>
            {weatherData
              ? `${(weatherData.weather?.[0]?.description || "").replace(
                  /\b\w/g,
                  (ch) => ch.toUpperCase()
                )} — ${((weatherData.main?.temp || 0) - 273.15).toFixed(1)}°C`
              : "N/A"}
          </div>
        </div>
      </div>

      {/* capital image / slideshow */}
      <div className={styles["cd-image-wrap"]}>
        {capitalImages.length > 0 ? (
          <div className={styles["cd-image-stage"]}>
            <button
              className={styles["cd-img-nav"]}
              onClick={() =>
                setImgIndex((i) => (i - 1 + capitalImages.length) % capitalImages.length)
              }
              aria-label="prev"
            >
              <IoChevronBack />
            </button>

            <img
              key={capitalImages[imgIndex]}
              src={capitalImages[imgIndex]}
              alt="capital"
              className={styles["cd-image"]}
            />

            <button
              className={styles["cd-img-nav"]}
              onClick={() => setImgIndex((i) => (i + 1) % capitalImages.length)}
              aria-label="next"
            >
              <IoChevronForward />
            </button>
          </div>
        ) : (
          <div className={styles["cd-image-empty"]}>No capital image</div>
        )}
      </div>
    </div>
  );
}
