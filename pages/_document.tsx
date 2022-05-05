import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import React from "react";
import { extractStaticCss } from "../lib/utils";

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    const { css, ids } = await extractStaticCss(initialProps.html);
    const styleFragment: React.ReactElement = (
      <React.Fragment key={`emotion-style`}>
        {initialProps.styles}
        <style
          data-emotion={`css ${ids.join(" ")}`}
          dangerouslySetInnerHTML={{ __html: css }}
        />
      </React.Fragment>
    );
    return {
      ...initialProps,
      styles: [styleFragment],
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
          <link
            href="https://fonts.googleapis.com/css?family=Ubuntu+Mono&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:400,100italic,100,300,900&display=swap"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Merriweather:400,400i,700&display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.15.3/katex.min.css"
            integrity="sha512-07YhC3P4/vS5HdgGuNAAeIxb5ee//efgRNo5AGdMtqFBUPYOdQG/sDK0Nl5qNq94kdEk/Pvu8pmN4GYUeucUkw=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </Head>
        {/* <body className="typography--debug"> */}
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
