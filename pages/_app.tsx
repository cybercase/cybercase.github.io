import "../styles/main.scss";
import type { AppProps } from "next/app";
import { NextPageWithLayout } from "../lib/constants";

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  return getLayout(<Component {...pageProps} />, pageProps);
}

export default MyApp;
