import styles from '../page.module.css'
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import moment from 'moment'

export async function getServerSideProps(context: { query: { id: any; }; }) {
  const { id } = context.query;
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
  const [interestGiven, setInterestGiven] = React.useState(false);
  const [buttonthing, setButtonthing] = React.useState("");

  async function interestedButton() {
    setButtonthing("...");
    const response = await fetch('/api/interested', { method: 'POST', body: JSON.stringify({ interestGiven: interestGiven, id: event.id }), });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const res = await response.json();

    setInterested(interestGiven ? event.interested : event.interested + 1);
    setButtonthing(interestGiven ? "" : " ✔");
    setInterestGiven(!interestGiven);


    return res;
  }

  function prettyDate(date: Date) {
    return moment(date).format('dddd MMMM Do, h:mm a');
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Event {event.id}</title>
      </Head>

      <main>
        <div className={styles.margin}>
          <Link href="/">back</Link>
          {((new Date()).valueOf() - Date.parse(event.creationDate).valueOf() < 1000 * 3600 * 24) ? <div className={styles.tagNew}>New</div> : null}
          {event.social ? <div className={styles.tagSocial}>Social</div> : null}
        </div>

        <div className={styles.bodywithmargin}>
          <h1>{event.location}</h1>
          <h2>{prettyDate(new Date(Date.parse(event.date)))} (~{event.duration} hours)</h2>
          <p>{event.description}</p>
          {event.social ? <div><p>Social event afterwards:</p> <p>{event.socialDescription}</p></div> : null}

          <p>{interested} interested</p>
          <button onClick={interestedButton}>Interested{buttonthing}</button>
        </div>

      </main>
    </div>

  );
}