import Document, { Html, Head, Main, NextScript } from 'next/document';
import styles from './page.module.css'

export default class MyDocument extends Document {
  render() {
    const pageProps = this.props?.__NEXT_DATA__?.props?.pageProps;
    return (
      <Html>
        <Head />
        <body style={{ margin: "0px", padding: "0px" }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}