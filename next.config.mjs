/** @type {import('next').NextConfig} */
const isGithubPages = process.env.DEPLOY_TARGET === 'github';

const nextConfig = {
  ...(isGithubPages && {
    output: 'export',
    basePath: '/pacific-travel-crm',
    images: { unoptimized: true },
  }),
};

export default nextConfig;
