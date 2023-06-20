'use client'
import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';
import { signIn, signOut, useSession } from "next-auth/react";
import Header from './header';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const { status, data } = useSession();
  return (
    <div>
      <Head>
        <title>Litter picking</title>
      </Head>

      <div className={styles.body}>
        <Header />

        <main className={styles.mainClans}>
          <div className={styles.clansDescription}>
            <p>
              Clans are a great way to interact with the community. They allow you to see how many of your fellow clan members have joined any event, and allow you to compete against other clans on the clan leaderboard.<br /><br />There are many ways you can interact with clans:<ul>
                <li>Join a clan based in your local neighbourhood to help keep your area clean</li>
                <li>Join a clan with your friends</li>
                <li>Join one of our community clans to be part of frequent high-quality events and meet new people</li>
              </ul>
            </p>
            <button type="submit" onClick={() => {
              if (data?.user === undefined) {
                router.push('/auth/signin')
              }
              else {
                router.push('/create_clan')
              }
            }} className={styles.createClanButton}>Make your own!</button>
          </div>
          <div className={styles.clansListView}>
            <h3>Clans:</h3>
            {clans?.map((clan: clan) =>
              <div key={clan.name}>
                <Link className={styles.linkNoUnderline} href={`/clans/${clan.name}`}>
                  <div className={styles.event}>
                    <div style={{ display: 'flex' }}>
                      <h3 style={{ flex: 'auto' }}>{clan.name}</h3>
                      {clan.logo ? <Image src={clan.logo} alt={clan.name} width={100} height={100} style={{ flex: 'initial' }} /> : null}
                    </div>
                    {clan.location ? <div>
                      <h4 style={{ marginTop: '-55px' }}>Based in {clan.location}</h4>
                      <p className={styles.eventDescription} style={{ marginTop: '55px' }}>{clan.description}</p>
                    </div> :
                      <p className={styles.eventDescription}>{clan.description}</p>}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}