'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>List view</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>Click <Link href="/test/test">here</Link> to organise an event!</p>
      </main>
    </div>
  )
}