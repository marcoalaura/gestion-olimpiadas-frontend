const git = require('child_process');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const date = (new Date()).toLocaleString();
let gitVersion = '';
try {
  gitVersion = (git.execSync('git describe --always').toString().replace(/[\s\r\n]+$/, ''));
} catch {
  gitVersion = '0000000';
}

const URL_PROXY = process.env.VUE_APP_BASE_SERVER;
module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'src/index.html',
      fileName: 'index.html',
      title: 'Sistema de competencia educativas del Estado Plurinacional de Bolivia',
      description: 'El sistema permite la organización y gestión de competencias educativas en línea con el fin de promover el desarrollo de capacidades científicas y tecnológicas e identificar talentos en estudiantes bolivianos',
      url: process.env.VUE_APP_FRONTEND,
      img: `${process.env.VUE_APP_FRONTEND}/img/og_img.png`,
      meta: {
        rversion: `C${gitVersion}B`,
        cdate: `${date}`
      }
    }
  },
  devServer: {
    host: 'localhost',
    proxy: {
      '^/ciudadania-callback': {
        target: URL_PROXY,
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    resolve: {
      extensions: ['*', '.js', '.vue', '.json']
    },
    performance: {
      hints: false
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
      new ImageminPlugin({
        pngquant: {
          quality: '90-95'
        }
      })
    ],
    devtool: process.env.NODE_ENV === 'production' ? false : 'eval-cheap-module-source-map',
    devServer: {
      watchOptions: {
        ignored: [/node_modules/, /tests/, /\.png|\.jpg|\.svg|\.ico|\.ttf$/],
      },
    },
  },
  filenameHashing: process.env.NODE_ENV === 'production',
  transpileDependencies: ['vuetify'],
  // assetsDir: 'assets',
  publicPath: process.env.VUE_APP_PUBLIC_PATH, // Si tiene un subdominio colocar /tu_subdominio/
  lintOnSave: true,
  productionSourceMap: false
};
