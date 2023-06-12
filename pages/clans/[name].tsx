import styles from '../page.module.css'
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import Image from 'next/image'

export async function getServerSideProps(context: { query: { name: any; }; }) {
  const { name } = context.query;
  const clan = await prisma.clan.findUnique({
    where: {
      name: name
    },
  })
  return {
    props: { clan }
  }
}

export default function View({ clan }: any) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{clan.id}</title>
      </Head>

      <body>
        <div className={styles.margin}>
          <Link href="/clans">back</Link>
        </div>

        <div className={styles.bodywithmargin}>
          {clan.logo ? <Image src={clan.logo} alt={clan.name} width={300} height={300} style={{float: 'right'}}/> : null}
          <h1>{clan.name}</h1>        
          {clan.location ? <h3>Based in {clan.location}</h3> : null}
          <p>{clan.description}</p>

          <p>{clan.members} members</p>
          {/* <button onClick={interestedButton}>Interested{buttonthing}</button> */}
        </div>
      </body>
    </div>

  );
}