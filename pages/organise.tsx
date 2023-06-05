import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Organise() {

  async function saveEvent(event: any) {
    const location = event.target.Location.value;
    const date = event.target.Date.value;
    const response = await fetch('/api/event', { method: 'POST', body: JSON.stringify({ location: location, date: date }), });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Organise event</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Organise event</h1>

        <form className="flex flex-col" onSubmit={saveEvent}>
          <div className={styles.card}>
            <label form='Location'>Location: </label>
            <input name='Location' id='Location'></input>
          </div>
          <div className={styles.card}>
            <label form='Date'>Date and time: </label>
            <input name='Date' id='Date'></input>
          </div>
          <button type="submit">
            Submit
          </button>
        </form>

        <div className={styles.card}>
          <Link href="/">back</Link>
        </div>

      </main>
    </div>

  );
}