const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      landing: './frontend/src/landing.tsx',
      slug: './frontend/src/slug.tsx',
    },
    output: {
      path: path.resolve(__dirname, 'app', 'templates', 'static'),
      filename: isProduction ? 'js/[name].[contenthash].bundle.js' : 'js/[name].bundle.js',
      publicPath: '/static/',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'frontend/src'),
      },
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].[contenthash].css' : 'css/[name].css',
      }),
      new HtmlWebpackPlugin({
        filename: '../landing.html',
        template: './frontend/public/template.html',
        title: 'Welcome!',
        chunks: ['landing'],
        inject: 'body',
      }),
      new HtmlWebpackPlugin({
        filename: '../slug.html',
        template: './frontend/public/template.html',
        title: 'Slug Page',
        chunks: ['slug'],
        inject: 'body',
      }),
    ],
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};