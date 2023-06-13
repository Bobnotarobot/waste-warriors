import styles from '../page.module.css'
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import Image from 'next/image'
import { useSession } from 'next-auth/react';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function getServerSideProps(context: { query: { name: any; }; }) {
  const { name } = context.query;
  const clan = await prisma.clan.findUnique({
    where: {
      name: name
    },
    include: {
      members: true
    }
  })
  return {
    props: { clan }
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
  members: User[];
}

export default function View({ clan }: any) {
  const { status, data } = useSession();
  var loggedIn = false;
  if (data?.user !== undefined && data?.user.name !== undefined) {
    console.log("username: ", data?.user.name);
    loggedIn = true;
  }
  else {
    loggedIn = false;
  }
  const membersByUsername: String[] = clan.members.map((user: User) => user.username);

  const [members, setMembers] = React.useState(clan.members.length);
  const [joined, setJoined] = React.useState(loggedIn ? membersByUsername.includes(data?.user.name) : false);
  const [buttonthing, setButtonthing] = React.useState(loggedIn ? (membersByUsername.includes(data?.user.name) ? "Joined" : "Join") : "Log in to join");

  async function joinClan() {
    if (!loggedIn) {
      redirect('/auth/signin');
    }
    setButtonthing(joined ? "Joined..." : "Join...");
    const response = await fetch('/api/joinclan', { method: 'POST', body: JSON.stringify({ joined: joined, user: data?.user.name, clan: clan.name }), });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const res = await response.json();

    setMembers(members + (!joined ? 1 : -1))
    setButtonthing(!joined ? "Joined" : "Join");
    setJoined(!joined)

    return res;
  }
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
          {data?.user !== undefined ? <p> User session: {data?.user.name}</p> : null}
          {clan.logo ? <Image src={clan.logo} alt={clan.name} width={300} height={300} style={{float: 'right'}}/> : null}
          <h1>{clan.name}</h1>        
          {clan.location ? <h3>Based in {clan.location}</h3> : null}
          <p>{clan.description}</p>

          <p>{members} members</p>
          <button onClick={joinClan}>{buttonthing}</button>
        </div>
      </body>
    </div>

  );
}