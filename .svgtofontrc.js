const pkg = require('./package.json');

export default {
  dist: './public/fonts/' + pkg.version,
  fontName: 'icon-font',
  website: false,
  outSVGReact: false,
  css: {
    output: './public/fonts/' + pkg.version,
    fileName: 'icon-font',
    include: '\\.(css)$',
    cssPath: './',
    fontSize: '24px'
  }
};
