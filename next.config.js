const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.public.blob.vercel-storage.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
  }
  
  module.exports = nextConfig