import styles from '../page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Organise() {
  function click() {
    // TODO
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Organise event</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Organise event</h1>
        <div className={styles.card}>
          <label form='Location'>Location: </label>
          <input name='Location' id='Location'></input>
        </div>
        <div className={styles.card}>
          <label form='Time'>Time: </label>
          <input name='Time' id='Time'></input>
        </div>

        <div className={styles.card}>
          <button onClick={click}>Submit</button>
        </div>

        <div className={styles.card}>
          <Link href="/">back</Link>
        </div>

      </main>
    </div>

  );
}