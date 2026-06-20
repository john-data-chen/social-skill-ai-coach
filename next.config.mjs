/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true
  }
}

export default nextConfig
