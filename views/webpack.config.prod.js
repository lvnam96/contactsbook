/* eslint-disable node/no-unpublished-require */
const path = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const productionMode = process.env.NODE_ENV === 'production';
const publicPath = '/';

const _isEmpty = require('lodash/isEmpty');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const analyzingMode = !_isEmpty(process.env.ANALYZE) ? JSON.parse(process.env.ANALYZE) : false;

module.exports = {
  mode: 'production',
  entry: {
    core: './core/js/index.js',
    App: './entrypoints/main/src/index.js',
    Signin: './entrypoints/signin/index.js',
    Signup: './entrypoints/signup/index.js',
  },
  output: {
    publicPath, // must be set to solve this issue: https://github.com/webpack/webpack/issues/7417
    path: path.resolve(__dirname, '../public'),
    filename: '[name].js', // use entry property names, e.g: Signin.js
  },
  externals: {
    // don't include these packages/modules in node_modules but use CDN, still have to import in each file
    react: 'React',
    'react-dom': 'ReactDOM',
    '@sentry/browser': 'Sentry',
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules|bower_components|prototype)/,
        // include: [
        //     path.resolve(__dirname, './entrypoints/signin'),
        //     path.resolve(__dirname, './entrypoints/signup')
        //     // path.resolve(__dirname, 'entrypoints/**')
        // ],
        options: {
          envName: process.env.BABEL_ENV || process.env.NODE_ENV || 'production',
          configFile: './.babelrc', // must be specified as babel-loader doesnot find it
        },
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          {
            options: {
              // by default it use publicPath in webpackOptions.output
              // publicPath: '../'
              sourceMap: true,
            },
            loader: MiniCssExtractPlugin.loader,
          },
          {
            options: {
              sourceMap: true,
            },
            loader: 'css-loader',
          },
          {
            options: {
              sourceMap: true,
            },
            loader: 'resolve-url-loader',
          },
          {
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-preset-env')(),
                require('autoprefixer')(),
                // require('cssnano')({
                //     reduceIdents: false,
                //     safe: true,
                //     discardComments: { removeAll: true }
                // })
              ],
              sourceMap: true,
            },
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              // sassOptions: {
              //   includePaths: ['absolute/path/a', 'absolute/path/b'],
              // },
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            options: {
              // by default it use publicPath in webpackOptions.output
              // publicPath: '../'
              sourceMap: true,
            },
            loader: MiniCssExtractPlugin.loader,
          },
          {
            options: {
              sourceMap: true,
            },
            loader: 'css-loader',
          },
          {
            options: {
              sourceMap: true,
            },
            loader: 'resolve-url-loader',
          },
          {
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-preset-env')(),
                require('autoprefixer')(),
                // require('cssnano')({
                //     reduceIdents: false,
                //     safe: true,
                //     discardComments: { removeAll: true }
                // })
              ],
              sourceMap: true,
            },
            loader: 'postcss-loader',
          },
        ],
      },
      {
        test: /\.pug$/,
        exclude: path.resolve(__dirname, './node_modules/'),
        options: {
          self: false,
        },
        loader: 'pug-loader',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            options: {
              limit: 8192,
            },
            loader: 'url-loader',
          },
          {
            options: {
              name: '[name].[ext]',
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75,
              },
            },
            loader: 'image-webpack-loader',
          },
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        options: {
          limit: 8192,
        },
        loader: 'url-loader',
      },
    ],
  },
  devtool: 'source-map', // use 'source-map' for production
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      adbk: path.resolve(__dirname, './entrypoints/main/src/js/controllers/adbk'),
      core: path.resolve(__dirname, './core/js/controllers/index'),
      'lodash-es': 'lodash', // https://github.com/GoogleChromeLabs/webpack-libs-optimizations#alias-lodash-es-to-lodash
    },
  },
  plugins: [
    new LodashModuleReplacementPlugin({
      collections: true,
      exotics: true,
      unicode: true,
      memoizing: true,
      flattening: true,
      paths: true,
      placeholders: true,
    }),
    new webpack.ContextReplacementPlugin(/date\-fns[\/\\]/, new RegExp(`[/\\\\\](${['en', 'vi'].join('|')})[/\\\\\]`)),
    new CleanWebpackPlugin({
      dry: false,
      cleanOnceBeforeBuildPatterns: ['../public/*.*'],
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
    new CopyPlugin([
      { from: './assets/manifest.webmanifest', to: '../public/manifest.webmanifest' },
      { from: './assets/fav/favicon.ico', to: '../public/favicon.ico' },
    ]),
    new MiniCssExtractPlugin({
      // Thus you can import your Sass modules from `node_modules`.
      // Just prepend them with `~` to tell webpack that this is not a relative import
      // chunkFilename: "[id].css",
      filename: '[name].css',
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /(\.optimize)?\.css$/g,
      // cssProcessor: default is cssnano
      cssProcessorOptions: {
        preset: [
          'default',
          {
            sourceMap: true,
            reduceIdents: false,
            safe: true,
            discardComments: { removeAll: true },
          },
        ],
        sourceMap: true,
      },
    }),
    new webpack.ProvidePlugin({
      adbk: ['adbk', 'default'],
      core: ['core', 'default'],
    }),
    // new webpack.DefinePlugin({}),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEV: JSON.parse(process.env.DEV || 'false'),
      PORT: JSON.parse(process.env.PORT || 'null'),
      HOT_RELOAD: false,
      DEBUG: false,
    }),
  ],
  performance: {
    hints: 'warning',
    // maxEntrypointSize: 170000,
    // maxAssetSize: 100000,
  },
  optimization: {
    splitChunks: {
      // chunks: 'all'
    }, // https://webpack.js.org/plugins/split-chunks-plugin/
  },
};

if (analyzingMode) {
  module.exports.plugins.unshift(new BundleAnalyzerPlugin());
}
