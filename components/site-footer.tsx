import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export const MyFooter: React.FC = () => {
  const iconSize = 20;
  return (
    <footer className="footer">
      <div className="footer-contacts">
        <a
          href="https://github.com/cybercase"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <FaGithub size={iconSize} />
        </a>
        <a
          href="https://it.linkedin.com/pub/stefano-brilli/21/650/953"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin size={iconSize} />
        </a>
        <a href="mailto:stefano@brilli.me" aria-label="Email">
          <FaEnvelope size={iconSize} />
        </a>
      </div>
      <div>© Stefano Brilli. All Rights Reserved.</div>
    </footer>
  );
};
