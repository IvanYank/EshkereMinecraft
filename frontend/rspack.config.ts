import { defineConfig } from '@rspack/cli';
import { rspack, type SwcLoaderOptions } from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import path from "path";

const isDev = process.env.NODE_ENV === 'development';

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['last 2 versions', '> 0.2%', 'not dead', 'Firefox ESR'];

export default defineConfig({
  devServer: {
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 3000,

    proxy: [
      {
        context: ["/api"],
        target: "https://cubethrone.fun",
        changeOrigin: true,
        secure: false,

        headers: {
          Referer: "https://cubethrone.fun/",
        },
      },
    ],
  },
  entry: {
    main: './src/main.tsx',
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: "asset/resource"
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: { targets },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
      {
        test: /\.module\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName:
                  process.env.NODE_ENV === "development"
                    ? "[name]__[local]"
                    : "[hash:base64:6]",
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              additionalData: `@use "@/styles/variables" as *;`
            }
          }
        ],
      },
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: "sass-loader",
            options: {
              additionalData: `@use "@/styles/variables" as *;`
            }
          }
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      title: "CubeThrone",
      template: './index.html',
      favicon: "./public/favicon.webp"
    }),
    isDev ? new ReactRefreshRspackPlugin() : null,
  ],
  optimization: {
    minimizer: [
      // new BundleAnalyzerPlugin(),
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
    splitChunks: {
      chunks: 'all'
    }
  }
});
