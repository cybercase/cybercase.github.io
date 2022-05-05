import { FaTwitter, FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export const MyFooter: React.FC = () => {
  const iconSize = 20;
  return (
    <footer className="footer">
      <div className="footer-contacts">
        <a
          href="https://twitter.com/thecybercase"
          target="_blank"
          rel="noreferrer"
        >
          <FaTwitter size={iconSize} />
        </a>
        <a href="https://github.com/cybercase" target="_blank" rel="noreferrer">
          <FaGithub size={iconSize} />
        </a>
        <a
          href="https://it.linkedin.com/pub/stefano-brilli/21/650/953"
          target="_blank"
          rel="noreferrer"
        >
          <FaLinkedin size={iconSize} />
        </a>
        <a href="mailto:stefano@brilli.me">
          <FaEnvelope size={iconSize} />
        </a>
      </div>
      <div>© Stefano Brilli. All Rights Reserved.</div>
    </footer>
  );
};
