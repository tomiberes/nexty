import nextMDX from "@next/mdx";

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    mdxRs: true,
  },
};
const withMDX = nextMDX();

export default withMDX(nextConfig);
