import "katex/dist/katex.min.css";
import "../styles/main.scss";
import type { AppProps } from "next/app";
import { Merriweather, Roboto, Ubuntu_Mono } from "next/font/google";
import { NextPageWithLayout } from "../lib/constants";

// Self-hosted at build time by next/font (no requests to Google at runtime).
const merriweather = Merriweather({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});
const roboto = Roboto({
  weight: ["900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});
const ubuntuMono = Ubuntu_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <>
      <style jsx global>{`
        :root {
          --font-serif: ${merriweather.style.fontFamily}, serif;
          --font-sans: ${roboto.style.fontFamily}, sans-serif;
          --font-monospace: ${ubuntuMono.style.fontFamily}, monospace;
        }
      `}</style>
      {getLayout(<Component {...pageProps} />, pageProps)}
    </>
  );
}

export default MyApp;
