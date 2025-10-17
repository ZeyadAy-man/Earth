export default function IdleGUI({ styles, error }) {
    return(
      <div style={styles.panel}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>World Globe</div>
        <div>Click a country on the globe to start.</div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
          Tip: rotate with mouse / scroll to zoom.
        </div>
        {error && <div style={{ color: "salmon", marginTop: 8 }}>{error}</div>}
      </div>
    );
}