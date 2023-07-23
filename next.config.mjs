import nextMDX from "@next/mdx";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    esmExternals: true,
    mdxRs: true,
  },
};
const withMDX = nextMDX();

export default withMDX(nextConfig);
