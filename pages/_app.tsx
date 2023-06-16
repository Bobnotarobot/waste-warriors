import styles from './page.module.css';
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Head from 'next/head';
import favicon from './Waste_Warriors_No_BG.ico';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;