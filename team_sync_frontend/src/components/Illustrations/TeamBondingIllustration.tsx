import React, { useState } from "react";

/**
 * TeamBondingIllustration
 * Renders the primary team-bonding illustration image responsively.
 *
 * PUBLIC_INTERFACE
 */
export const TeamBondingIllustration: React.FC<{
  className?: string;
  alt?: string;
  maxWidth?: number | string;
  style?: React.CSSProperties;
}> = ({ className = "", alt = "Team bonding illustration", maxWidth, style }) => {
  // Use a stable, royalty-free Unsplash image URL (crossorigin-safe)
  // Photographer credit: fauxels (Pexels via Unsplash-like mirrors aren't guaranteed; using Unsplash CDN)
  // URL chosen to depict team collaboration; replace with design-approved asset if needed.
  const remoteSrc =
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop";

  const [failed, setFailed] = useState(false);

  const computedMaxWidth =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth || "100%";

  return (
    <div style={{ maxWidth: computedMaxWidth, margin: "0 auto" }}>
      {!failed ? (
        <img
          src={remoteSrc}
          alt={alt}
          className={className}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 16,
            objectFit: "cover",
            ...style,
          }}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <p className="muted" role="status" aria-live="polite" style={{ margin: 0 }}>
          Illustration failed to load. Please check your connection.
        </p>
      )}
    </div>
  );
};

export default TeamBondingIllustration;
