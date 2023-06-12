'use client'
import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';

export async function getServerSideProps() {
  const clans = (await prisma.clan.findMany()).sort((c1, c2) => {
    if (c1.points < c2.points) {
      return 1;
    }

    if (c1.points > c2.points) {
      return -1;
    }

    return 0;
  });
  //const events = [{id:1, lat:51.5126, lng:-0.1448, date:"2023-06-23", interested:1, social:false}, {id:2, lat: 51.5226, lng: -0.1348, date:"2023-06-09", interested:5, social:true}, {id:3, lat:51.5236, lng:-0.1448, date:"2023-06-08", interested:2, social:true}, {id:4, lat: 51.5136, lng: -0.1448, date:"2023-06-06", interested:0, social:false}]
  return {
    props: { clans }
  }
}

interface clan {
  name: string;
  points: number;
  location: string;
  lat: number;
  lng: number;
  logo: string;
  description: string;
}

export default function Home({ clans }: any) {
  return (
    <div>
      <Head>
        <title>Litter picking</title>
      </Head>

      <div className={styles.body}>
        <main>
          <Link href='/'>back</Link>
          <form action="/create_clan">
              <input type="submit" value="Make your own!" className={styles.organiseEventButton} />
          </form>
          <div className={styles.listView}>
            <h3>Clans:</h3>

            <div className={styles.eventList}>
              {clans?.map((clan: clan) =>
                  <div key={clan.name}>
                    <Link className={styles.linkNoUnderline} href={`/clans/${clan.name}`}>
                      <div className={styles.event}>
                        <div style={{display: 'flex'}}>
                          <h3 style={{flex: 'auto'}}>{clan.name}</h3>
                          {clan.logo ? <Image src={clan.logo} alt={clan.name} width={100} height={100} style={{flex: 'initial'}}/> : null}
                        </div>
                        <p>{clan.description}</p>
                      </div>
                    </Link>
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}