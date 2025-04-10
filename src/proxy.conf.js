const PROXY_CONFIG = {
  '/widevine': {
    target: 'https://htv-wv.mts.ru',
    pathRewrite: {
      '/widevine': '',
    },
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
  },
  '/playready': {
    target: 'https://htv-prls.mts.ru:443/PlayReady/rightsmanager.asmx',
    pathRewrite: {
      '/playready': '',
    },
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
  }
}

module.exports = PROXY_CONFIG;
