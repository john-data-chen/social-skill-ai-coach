/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // ponytail: ship the social-skills-coach skill markdown into the serverless
  // bundle so the runtime knowledge loader (node:fs) resolves it on Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./skills/social-skills-coach/**/*"]
  },
  experimental: {
    turbopackFileSystemCacheForBuild: true
  }
}

export default nextConfig
