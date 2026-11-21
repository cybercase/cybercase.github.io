/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  // Don't let `next dev` write AGENTS.md when an AI agent starts it:
  // agent instructions live in CLAUDE.md.
  agentRules: false,
};

module.exports = nextConfig;
