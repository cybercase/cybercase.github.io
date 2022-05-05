import React from "react";
import clsx from "classnames";

interface CoverProps {
  tall: boolean;
  dark: boolean;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

export const Cover: React.FC<CoverProps> = React.memo(function Cover({
  tall,
  dark,
  title,
  subtitle,
  imageUrl,
}) {
  return (
    <div
      className={clsx("cover", { "cover--tall": tall, "cover--dark": dark })}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {title ? (
        <div className="cover-box">
          <h1 className="cover-box-title">{title}</h1>
          {subtitle && <span className="cover-box-subtitle">{subtitle}</span>}
        </div>
      ) : null}
    </div>
  );
});
