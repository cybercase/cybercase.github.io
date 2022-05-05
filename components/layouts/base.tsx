import Head from "next/head";
import { MyFooter } from "../site-footer";
import { SiteHeader, SiteHeaderProps } from "../site-header";

export interface BaseLayoutProps {
  children?: React.ReactNode;
  title: string;
  description: string;
  header?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = function BaseLayout(props) {
  return (
    <>
      <Head>
        <title key="title">{props.title}</title>
        <meta
          name="description"
          content={props.description}
          key="description"
        ></meta>
      </Head>
      <main className="container">
        {props.header}
        {props.children}
        <MyFooter />
      </main>
    </>
  );
};

export default BaseLayout;
