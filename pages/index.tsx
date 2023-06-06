'use client'
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function getServerSideProps() {
  const events = await prisma.event.findMany();
  return {
    props: { events }
  }
}

export async function refreshEvents(filters: any) {
  const maxDist = filters.target.MaxDist.value;
  const minInterested = filters.target.MinInterested.value;
  const dateMin = filters.target.DateMin.value;
  const dateMax = filters.target.DateMax.value;
  const hasSocial = filters.target.hasSocial.value;
  const filteredEvents = await prisma.event.findMany({
    where: {
      interested: {
        gt: minInterested,
      },
      date: {
        gt: dateMin,
        lt: dateMax,
      },
      social: hasSocial,
    }
  });
  // return something maybe??
}

interface event {
  id: number;
  location: string;
  date: string;
  duration: string;
  creationDate: number;
  description: string;
  interested: number;
  social: boolean;
  socialDescription: string;
}

export default function Home({ events }: any) {

  return (
    <div>
      <Head>
        <title>Litter picking</title>
      </Head>

      <div className={styles.body}>
        <header className={styles.header}>
          <div className={styles.organiseEvent}>
            <form action="/organise">
              <input type="submit" value="Organise an event!" className={styles.organiseEventButton} />
            </form>
          </div>
          <div className={styles.filters}>
            <h3>Filters: </h3>
            <form onSubmit={refreshEvents} className={styles.filterForm}>
              <div className={styles.filterForm}>
                <label form='MaxDist'>Maximum distance: </label>
                <input name='MaxDist' id='MaxDist' type='number' defaultValue='100' min='0'></input>
              </div>
              <div className={styles.filterForm}>
                <label form='MinInterested'>Minimum people interested: </label>
                <input name='MinInterested' id='MinInterested' type='number' defaultValue='0' min='0'></input>
              </div>
              <div className={styles.filterForm}>
                <label form='DateMin'>Date from: </label>
                <input name='DateMin' id='DateMin' type='datetime-local'></input>
              </div>
              <div className={styles.filterForm}>
                <label form='DateMax'>To: </label>
                <input name='DateMax' id='DateMax' type='datetime-local'></input>
              </div>
              <div className={styles.filterForm}>
                <label form='HasSocial'>Has social: </label>
                <input name='HasSocial' id='HasSocial' type='checkbox'></input>
              </div>
              <button type="submit">Refresh</button>
            </form>
          </div>
        </header>

        <main>
          <div className={styles.listView}>
            <h3>Upcoming events:</h3>

            <div className={styles.eventList}>
              {events?.map((event: event) =>
                <div key={event.id}>
                  <div className={styles.event}>
                    <h4>{event.location}</h4>
                    <h4>{event.date}</h4>
                    <h4>Duration: {event.duration} h</h4>
                    <p>About: {event.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.mapView}>
            <h3> The map</h3>
          </div>
        </main>
      </div>
    </div>
  )
}