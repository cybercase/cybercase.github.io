import BaseLayout from "../components/layouts/base";
import { SiteHeader } from "../components/site-header";
import { NextPageWithLayout } from "../lib/constants";

// Privacy policy for the UpNotifications Android app; keep this URL stable.
const UpNotificationsPrivacy: NextPageWithLayout = () => {
  return (
    <section className="content">
      <h1>UpNotifications Privacy Policy</h1>
      <p>UpNotifications DOES NOT transmit or share any data of any kind.</p>
      <p>
        No INTERNET permission is asked to the user so that no communication to
        ours or third party servers is allowed.
      </p>
      <p>Please, enjoy UpNotifications without worrying for your privacy.</p>
      <p>
        <em>– 21/03/2015</em>
      </p>
    </section>
  );
};

UpNotificationsPrivacy.getLayout = (page) => {
  return (
    <BaseLayout
      title="UpNotifications for UP24 - Privacy Policy"
      description="Privacy Policy for UpNotifications App"
      header={<SiteHeader coverDark={false} />}
    >
      {page}
    </BaseLayout>
  );
};

export default UpNotificationsPrivacy;
