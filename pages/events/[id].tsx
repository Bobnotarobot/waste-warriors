import styles from '../page.module.css'
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import prisma from '../../lib/prisma';

// interface Event {
//   id: number;
//   location: string;
//   date: string;
//   duration: number;
//   creationDate: string;
//   description: string;
//   interested: number;
//   social: boolean;
//   socialDescription: string;
// }

export async function getServerSideProps(context: { query: { id: any; }; }) {
    const {id} = context.query;
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    return {
      props: { event }
    }
  }

export default function View({ event }: any) {
    const [interested, setInterested] = React.useState(event.interested);
    const [interestGiven, setInterestGiven] = React.useState(0);

    async function interestedButton() {
      console.log(event.interested)
      const response = await fetch('/api/interested', { method: 'POST', body: JSON.stringify({ interestGiven: interestGiven, id: event.id }), });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const res = await response.json();

      setInterested(interestGiven == 0 ? event.interested + 1 : event.interested);
      setInterestGiven(1 - interestGiven);
  
      return res;
    }

  return (
    <div className={styles.container}>
      <Head>
        <title>Event {event.id}</title>
      </Head>

      <main>
        <Link href="/">back</Link>
        <h1>{event.location}</h1>
        <h2>{event.date} (~{event.duration} hours)</h2>
        <p>{event.description}</p>
        {event.social ? <div><p>Social event afterwards:</p> <p>{event.socialDescription}</p></div> : null}

        <div className={styles.grid}>
            {((new Date()).valueOf() - Date.parse(event.creationDate) < 1000 * 3600 * 24) ? <div className={styles.card}>New</div> : null }
            {event.social ? <div className={styles.card}>Social</div> : <p></p> }
        </div>

        <p>{interested} interested</p>
        <button onClick={interestedButton}>Interested</button>

      </main>
    </div>

  );
}