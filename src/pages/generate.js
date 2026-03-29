export async function getServerSideProps() {
  const fs = require('fs');
  const path = require('path');
  const pkg = require('../../package.json');
  function format() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.resolve('public/fonts/' + pkg.version + '/icon-font.css'),
        'utf8',
        (err, data) => {
          if (err) {
            console.error('Dosya okunurken bir hata oluştu:', err);
            return reject(err);
          }
          let css = data.replace(/\\/g, '\\\\');
          // Boşlukları sil
          css = css.replace(/\s/g, '');
          const startIndex = css.indexOf('.icon-font-');
          if (startIndex === -1) {
            return reject('Herhangi bir icon bulunamadı.');
          }
          css = css.slice(startIndex);
          return resolve(css);
        }
      );
    });
  }
  const css = await format();
  return {
    props: {
      css: css
    }
  };
}
export default function Page(props) {
  return props.css;
}
