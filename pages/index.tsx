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

export default function Home({ events }) {
  const data = [{ location: "Your house", time: "In 3 minutes" }, { location: "The Moon", time: "2078" }, { location: "Third example", time: "idk Tuesday" }]
  return (
    <div className={styles.container}>
      <Head>
        <title>List view</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>Click <Link href="/test/test">here</Link> to organise an event!</p>

        <h3>Upcoming events:</h3>

        <div className={styles.grid}>
          {events.map(event =>
            <div className={styles.eventcard}>
              <h4>{event.location}</h4>
              <p>{event.date}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}