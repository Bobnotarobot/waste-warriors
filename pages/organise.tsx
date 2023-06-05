import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Organise() {

  async function saveEvent(event: any) {
    const postcode = event.target.Postcode.value;
    const date = event.target.Date.value;
    const duration = event.target.Duration.value;
    const description = event.target.Description.value;
    const social = event.target.Social.value;
    const socialDescription = event.target.SocialDescription.value;
    const jsdate = new Date();
    const creationDate = jsdate.getFullYear() + '-' + (jsdate.getMonth() + 1) + '-' + jsdate.getDate() + 'T' + jsdate.getHours() + ':' + jsdate.getMinutes();
    const body = {location: postcode, date: date, duration: duration, creationDate: creationDate, description: description, social: social, socialDescription: socialDescription}
    const response = await fetch('/api/event', { method: 'POST', body: JSON.stringify(body), });

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
            <label form='Image'>Image: </label>
            <input type="file" name='Image' id='Image' accept="image/png, image/jpeg" required></input>
          </div>
          <div className={styles.card}>
            <label form='Postcode'>Postcode: </label>
            <input name='Postcode' id='Postcode' required></input>
          </div>
          <div className={styles.card}>
            <label form='Date'>Date and time: </label>
            <input type="datetime-local" name='Date' id='Date' required></input>
          </div>
          <div className={styles.card}>
            <label form='Duration'>Duration (hours): </label>
            <input name='Duration' id='Duration' required></input>
          </div>
          <div className={styles.card}>
            <label form='Description'>Description: </label>
            <input name='Description' id='Description' style={{width: "400px"}}></input>
          </div>
          <div className={styles.card}>
            <label form='Social'>Social: </label> {/*add checkbox*/}
            <input type="Checkbox" name='Social' id='Social'></input>
          </div>
          <div className={styles.card}>
            <label form='Social Description'>Social Description: </label>
            <input name='SocialDescription' id='SocialDescription'></input>
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