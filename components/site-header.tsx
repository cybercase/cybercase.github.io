import clsx from "classnames";
import Link from "next/link";
import { Cover } from "./cover";

export interface SiteHeaderProps {
  cover?: string;
  coverTall?: boolean;
  coverDark?: boolean;
  coverCaption?: string;
  coverTitle?: string;
  coverSubtitle?: string;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  cover,
  coverCaption,
  coverSubtitle,
  coverTitle,
  coverDark,
  coverTall,
}) => {
  return (
    <header
      className={clsx("site-header", {
        "site-header--cover": !!cover,
      })}
    >
      <nav className="site-header-nav">
        <a href="/feed.rss" rel="alternate" type="application/rss+xml">
          <i className="fa fa-rss"></i>
        </a>
        <span></span>
        <Link href={"/"}>
          <a>Home</a>
        </Link>
        <Link href="/blog">
          <a>Blog</a>
        </Link>
      </nav>

      {cover ? (
        <Cover
          dark={coverDark ?? false}
          title={coverTitle}
          tall={coverTall ?? false}
          subtitle={coverSubtitle}
          imageUrl={cover}
        />
      ) : null}
    </header>
  );
};
