import styles from '../page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import moment from 'moment'
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';
import { redirect } from 'next/navigation';
import { Clan, User } from '@prisma/client';
import { Router, useRouter } from 'next/router';
import { signIn, signOut, useSession } from "next-auth/react";
import Header from '../header';

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
  const users = await prisma.user.findMany({
    include: { clan: true }
  });
  const props = { event, users }
  return {
    props: { props }
  }
}

export default function View({ props }: any) {
  const event = props.event;
  const users = props.users;
  const { status, data } = useSession();

  var loggedIn = false;
  var clan: Clan | null;
  var user: User | null;
  if (data?.user !== undefined && data?.user.name !== undefined) {
    console.log("username: ", data?.user.name);
    loggedIn = true;
    user = users.find((user: User) => user.username === data?.user.name);
    clan = users.find((user: User) => user.username === data?.user.name).clan;
    if (clan === undefined) clan = null;
    // if (data?.user.clans !== undefined)
    //   clans = data?.user.clans;
    // else {
    //   clans = [];
    // }
  }
  else {
    loggedIn = false;
    clan = null;
    user = null;
  }
  const usersByUsername: String[] = event.users.map((user: User) => user.username);

  const router = useRouter();

  const initialInterested = loggedIn ? usersByUsername.includes(data?.user.name) : false;
  const [interested, setInterested] = React.useState(event.interested);
  const [interestGiven, setInterestGiven] = React.useState(initialInterested);
  const [buttonthing, setButtonthing] = React.useState(initialInterested ? "Interested ✔" : "Interested");
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
      router.push('/auth/signin');
      return null;
    }

    setButtonthing("Interested...");
    const response = await fetch('/api/interested', { method: 'POST', body: JSON.stringify({ interestGiven: interestGiven, id: event.id, user: data?.user.name }), });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const res = await response.json();

    setInterested(interestGiven ? event.interested + (initialInterested ? -1 : 0) : event.interested + (initialInterested ? 0 : 1));
    setButtonthing(interestGiven ? "Interested" : "Interested ✔");
    setInterestGiven(!interestGiven);


    return res;
  }

  function prettyDate(date: Date) {
    return moment(date).format('dddd MMMM Do, h:mm a');
  }

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return Math.round(d * 10) / 10;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
  }

  if (status === "loading") {
    return <p>Loading...</p>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Event {event.id}</title>
      </Head>

      <body className={styles.body}>
        <Header />

        <main>
          <div className={styles.margin}>
            <button type="button" onClick={() => router.back()} className={styles.backButton}>
              ←
            </button>
            {((new Date()).valueOf() - Date.parse(event.creationDate).valueOf() < 1000 * 3600 * 24) ? <div className={styles.tagNewEvent}>New Event</div> : null}
            {event.social ? <div className={styles.tagSocialEvent}>Social Afterwards</div> : null}
          </div>

          <div className={styles.bodywithmargin}>
            <h1>{event.location}</h1>
            <h2>{prettyDate(new Date(Date.parse(event.date)))} (~{event.duration} hours)</h2>
            {loggedIn && event.orgKey === data?.user.name ? <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <h4>Organised by {event.orgKey}</h4>
              <Link href={`/events/edit/${encodeURIComponent(event.id)}`}><button className={styles.accountButton}>Edit Event</button></Link>
            </div> : <h4>Organised by {event.orgKey}</h4>}
            {user?.storedAdress ? <h4>{getDistanceFromLatLonInKm(user.lat!, user.lng!, event.lat, event.lng)}km away</h4> : null}
            <p>{event.description}</p>
            {event.social ? <div><p>Social event afterwards:</p> <p>{event.socialDescription}</p></div> : null}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <p>{interested} interested</p>
              {loggedIn && (clan !== null) ? <div className={styles.clanCard}>{event.users.filter((user: User) => user.clanKey === clan!.name).length} from {clan.name}</div> : null}
            </div>
            <button className={styles.joinButton} onClick={interestedButton}>{status === "authenticated" ? buttonthing : "Log in to join"}</button>
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