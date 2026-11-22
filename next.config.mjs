/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: false, // avoid double-mounting the WebGL scene in dev
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Permissions-Policy', value: 'camera=(), microphone=()' }],
      },
    ];
  },
};
export default nextConfig;
