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
import Header from '../header';

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

  const router = useRouter();

  async function joinClan() {
    if (!loggedIn) {
      router.push('/auth/signin');
      return null;
    }
    setButtonthing(joined ? "Joined..." : "Join...");
    const response = await fetch('/api/joinclan', { method: 'POST', body: JSON.stringify({ joined: joined, user: data?.user.name, clan: clan.name }), });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const res = await response.json();

    setMembers(joined ? clan.members.length + (initialMember ? -1 : 0) : clan.members.length + (initialMember ? 0 : 1));
    setButtonthing(!joined ? "Joined" : "Join");
    setJoined(!joined)

    return res;
  }

  const initialMember = loggedIn ? membersByUsername.includes(data?.user.name) : false
  const [members, setMembers] = React.useState(clan.members.length);
  const [joined, setJoined] = React.useState(initialMember);
  const [buttonthing, setButtonthing] = React.useState(initialMember ? "Joined" : "Join");

  if (status === "loading") {
    return <p>Loading...</p>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{clan.id}</title>
      </Head>

      <Header />

      <div>
        <div className={styles.margin}>
          <button type="button" onClick={() => router.back()} className={styles.backButton}>
              ←
            </button>
        </div>

        <div className={styles.bodywithmargin}>
          {clan.logo ? <Image src={clan.logo} alt={clan.name} width={300} height={300} style={{float: 'right'}}/> : null}
          <h1>{clan.name}</h1>        
          {clan.location ? <h3>Based in {clan.location}</h3> : null}
          {clan.owner ? (loggedIn && clan.owner === data?.user.name ? <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <h3>Owned by {clan.owner}</h3>
              <Link href={`/clans/edit/${encodeURIComponent(clan.name)}`}><button className={styles.accountButton}>Edit Clan</button></Link>
            </div> : <h3>Owned by {clan.owner}</h3>) : <h3>Default clan</h3>}
          <p>{clan.description}</p>

          <p>{members} members</p>
          <button className={styles.joinButton} onClick={joinClan}>{status === "authenticated" ? buttonthing : "Log in to join"}</button>
        </div>
      </div>
    </div>

  );
}