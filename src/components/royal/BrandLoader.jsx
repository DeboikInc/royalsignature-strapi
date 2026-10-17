export default function BrandLoader({ label = 'Loading...', fullScreen = false }) {
  return (
    <div className={`royal-loader${fullScreen ? ' royal-loader-fullscreen' : ''}`} role="status" aria-live="polite">
      <img className="logo" src="/royal-signature-loader-crest.png" alt="Royal Signature crest" />
      <span>{label}</span>
    </div>
  );
}
