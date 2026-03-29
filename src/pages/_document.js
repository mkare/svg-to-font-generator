import { Html, Head, Main, NextScript } from 'next/document';
const pkg = require('../../package.json');

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="stylesheet" href={`/fonts/${pkg.version}/icon-font.css`} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
