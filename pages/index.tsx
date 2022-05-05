import Link from "next/link";
import BaseLayout from "../components/layouts/base";
import { SiteHeader } from "../components/site-header";
import { NextPageWithLayout } from "../lib/constants";

const Home: NextPageWithLayout = () => {
  return (
    <section className="content">
      <ul className="nostyle">
        <li>
          <h3>
            <Link href="https://stefano.brilli.me/webminidisc">
              <a className="projects-link">The Web MiniDisc Application</a>
            </Link>
          </h3>
          Bringing back to life the MiniDisc with WebUSB and WASM.
        </li>
        <li>
          <h3>
            <Link href="https://stefano.brilli.me/google-forms-html-exporter/">
              <a className="projects-link">Google Forms HTML Exporter</a>
            </Link>
          </h3>
          Create and Style HTML Forms starting from any Google Form.
        </li>
      </ul>
    </section>
  );
};

Home.getLayout = (page) => {
  return (
    <BaseLayout
      title="Stefano Brilli Home Page"
      description="Contacts, Work, Blog of Stefano Brilli"
      header={
        <SiteHeader
          cover="/images/cover3.jpg"
          coverTitle="Stefano Brilli"
          coverDark={true}
          coverSubtitle="Software Engineer and Maker."
          coverTall={true}
        />
      }
    >
      {page}
    </BaseLayout>
  );
};
export default Home;
