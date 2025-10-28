// '@hygraph/next' is not installed; remove unused import.

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // allow the production build to complete even if ESLint reports problems
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
