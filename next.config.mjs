/** @type {import('next').NextConfig} */

/*
 * Public hosts that serve uploaded files (the backend's SEAWEEDFS_PUBLIC_URL /
 * CDN), comma separated, e.g. IMAGE_REMOTE_HOSTS=cdn.example.com,files.example.com
 * Hostnames only: no credentials or bucket names.
 */
const uploadHostPatterns = (process.env.IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean)
  .map((hostname) => ({
    protocol: "https",
    hostname,
  }));

const nextConfig = {
  reactCompiler: true,
  /*
   * Do not use `output: "export"`: the app relies on the auth proxy,
   * cookies(), server actions and API-driven dynamic routes, so it must
   * run as a Node server (`npm run build` then `npm start`).
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.coolerguru.com",
      },
      ...uploadHostPatterns,
    ],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
