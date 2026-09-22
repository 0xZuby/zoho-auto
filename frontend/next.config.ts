import type { NextConfig } from 'next';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the Turbopack workspace root to this directory. Without this,
  // Next.js's root-inference walks up looking for lockfiles and finds the
  // repo-root package-lock.json (from the root-level `concurrently` dev
  // dependency used to run both servers together), which is not this
  // app's actual dependency tree. backend/ and frontend/ are intentionally
  // separate projects with their own lockfiles.
  turbopack: {
    root: import.meta.dirname,
  },
  // The frontend never calls the Express API cross-origin from the browser.
  // Every request goes to same-origin /api/*, which Next.js rewrites to the
  // Express server. This removes CORS/credentialed-cookie complexity for the
  // session cookie used by the auditor/admin portal.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
