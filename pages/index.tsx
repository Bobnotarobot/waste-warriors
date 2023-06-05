'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';

export async function getServerSideProps() {
  const events = await prisma.event.findMany();
  return {
    props: { events }
  }
}

interface event {
  id: number;
  location: string;
  date: string;
  duration: number;
  creationDate: string;
  description: string;
  social: boolean;
  socialDescription: string;
}

export default function Home({ events }: any) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Litter picking</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>Click <Link href="/organise">here</Link> to organise an event!</p>

        <h3>Upcoming events:</h3>

        <div className={styles.grid}>
          {events?.map((event: event) =>
            <div key={event.id}>
              <div className={styles.eventcard}>
                <h4>{event.location}</h4>
                <p>{event.date}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}