import styles from '../page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import moment from 'moment'
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";

export async function getServerSideProps(context: { query: { id: any; }; }) {
  const { id } = context.query;
  const event = await prisma.event.findUnique({
    where: {
      id: parseInt(id)
    },
    include: {
      users: true
    }
  })
  return {
    props: { event }
  }
}

export default function View({ event }: any) {
  const { status, data } = useSession();
  var loggedIn = false;
  if (data?.user !== undefined && data?.user.name !== undefined) {
    console.log("username: ", data?.user.name);
    loggedIn = true;
  }
  else {
    loggedIn = false;
  }
  const usersByUsername: String[] = event.users.map((user: User) => user.username);

  const [interested, setInterested] = React.useState(event.interested);
  const [interestGiven, setInterestGiven] = React.useState(loggedIn ? usersByUsername.includes(data?.user.name) : false);
  const [buttonthing, setButtonthing] = React.useState(loggedIn ? (usersByUsername.includes(data?.user.name) ? " ✔" : "") : "Log in to join");
  var mapCenter = { lat: event.lat, lng: event.lng };
  const libraries = useMemo(() => ['places'], []);

  const noMarkers = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];
  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      scrollwheel: true,
      styles: noMarkers
    }),
    []
  );
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyD_uZuWbXXwxHrP4jetAlgWzrrc-dgQ_6Q",
    libraries: libraries as any,
  });
  if (!isLoaded) {
    return <p>Loading...</p>;
  }
  function initMap(): void {
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, { zoom: 14, center: mapCenter });
    const marker = new google.maps.Marker({ position: map.getCenter(), map: map, title: "location" });
  }

  async function interestedButton() {
    if (!loggedIn) {
      redirect('/auth/signin');
    }

    setButtonthing("...");
    const response = await fetch('/api/interested', { method: 'POST', body: JSON.stringify({ interestGiven: interestGiven, id: event.id, user: data?.user.name }), });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const res = await response.json();

    setInterested(interestGiven ? event.interested : event.interested + 1);
    setButtonthing(interestGiven ? "" : " ✔");
    setInterestGiven(!interestGiven);


    return res;
  }

  function prettyDate(date: Date) {
    return moment(date).format('dddd MMMM Do, h:mm a');
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Event {event.id}</title>
      </Head>

      <body className={styles.body}>
        <header className={styles.header}>
          <div className={styles.leftHeader}>
            <form action="/">
              <input type="submit" value="Home" className={styles.homeButton} />
            </form>
            <button className={styles.accountButton} onClick={() => {
              signIn();
            }}>Sign in</button>
            <button className={styles.accountButton} onClick={() => {
              signOut();
            }}>Sign out</button>
            <form action="/createAccount">
              <input type="submit" value="Create account" className={styles.accountButton} />
            </form>
            {data?.user !== undefined ? <div className={styles.signedIn}> Signed in: {data?.user.name}</div> : <div className={styles.signedIn}> Not signed in</div>}
          </div>
          <div className={styles.rightHeader}>
            <form action="/organise">
              <input type="submit" value="Organise your own! →" className={styles.organiseEventButton} />
            </form>
            <form action="/clans">
              <input type="submit" value="Join a Clan!" className={styles.organiseEventButton} />
            </form>
          </div>
        </header>

        <main>
          <div className={styles.margin}>
            <Link href="/">back</Link>
            {((new Date()).valueOf() - Date.parse(event.creationDate).valueOf() < 1000 * 3600 * 24) ? <div className={styles.tagNewEvent}>New Event</div> : null}
            {event.social ? <div className={styles.tagSocialEvent}>Social Afterwards</div> : null}
          </div>

          <div className={styles.bodywithmargin}>
            <h1>{event.location}</h1>
            <h2>{prettyDate(new Date(Date.parse(event.date)))} (~{event.duration} hours)</h2>
            <p>{event.description}</p>
            {event.social ? <div><p>Social event afterwards:</p> <p>{event.socialDescription}</p></div> : null}

            <p>{interested} interested</p>
            <button onClick={interestedButton}>Interested{buttonthing}</button>
            <GoogleMap
              id="map"
              options={mapOptions}
              zoom={14}
              center={mapCenter}
              mapTypeId={google.maps.MapTypeId.ROADMAP}
              mapContainerStyle={{ width: '50%', height: '50%' }}
              onLoad={initMap}
            />
          </div>
        </main>
      </body>
    </div>

  );
}