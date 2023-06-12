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
        <h1>{clan.name}</h1>
        <p>{clan.description}</p>
        {clan.logo ? <Image src={clan.logo} alt={clan.name} width={500} height={500} /> : null}
        <Link href='/clans'>back</Link>
      </body>
    </div>

  );
}