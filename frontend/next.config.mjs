import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    useWasmBinary: true,
  },
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
};

export default nextConfig;
