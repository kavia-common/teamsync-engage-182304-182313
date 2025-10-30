import React from "react";

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
  // NOTE: This path is relative to the app's public root when bundled by CRA/Vite.
  // In CRA, importing from src typically requires import; however, assets placed outside src
  // can be referenced relatively from the project root using correct bundler config.
  // Here we import via relative path from src using the bundler asset pipeline.
  // Adjust the import path below only if your project structure changes.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Allow importing of image assets
  // Using require to keep compatibility with JS/TS setups without custom declarations.
  // If using TypeScript with asset modules, add a declaration for JPG if needed.
  const imgSrc = require("../../assets/images/illustrations/illustration-primary.jpg");

  const computedMaxWidth =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth || "100%";

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={{
        display: "block",
        width: "100%",
        maxWidth: computedMaxWidth,
        height: "auto",
        borderRadius: 16, // match rounded-2xl feel from style guide
        objectFit: "cover",
        ...style,
      }}
    />
  );
};

export default TeamBondingIllustration;
