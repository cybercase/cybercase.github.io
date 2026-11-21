/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  // Don't let `next dev` add its own block to AGENTS.md when an AI agent
  // starts it: the agent instructions in AGENTS.md are maintained by hand.
  agentRules: false,
};

module.exports = nextConfig;
