/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[hash].[ext]',
          outputPath: 'static/sounds/',
          publicPath: '/_next/static/sounds/',
        },
      },
    });
    return config;
  },
};

export default nextConfig;
