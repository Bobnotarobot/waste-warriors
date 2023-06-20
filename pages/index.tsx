'use client'
import { useEffect, useState, useRef, MutableRefObject } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';
import { useLoadScript, GoogleMap, MarkerF, InfoWindow } from '@react-google-maps/api';
import { useMemo } from 'react';
import Geolocation from '@react-native-community/geolocation';
const DEVELOPMENT_GOOGLE_MAPS_KEY = "AIzaSyD_uZuWbXXwxHrP4jetAlgWzrrc-dgQ_6Q"
const PRODUCTION_GOOGLE_MAPS_KEY = "AIzaSyBXcHbmJFrRxrot8_NXQzNMBUITngrsWEo"
import type { NextApiRequest, NextApiResponse, NextPage } from 'next';
import { signIn, signOut, useSession } from "next-auth/react";
import moment from 'moment';
import { useRouter } from 'next/router';
// import { useRouter } from 'next/navigation';
import Header from './header';
import type { GetStaticProps } from 'next';
import { User } from '@prisma/client';

export async function getServerSideProps() {
  // const rawEvents = await prisma.event.findMany();
  // const events = rawEvents?.filter((event: any) => {
  //   const eventDate = new Date(event.date).getTime();
  //   const todayDate = new Date().getTime();
  //   if (eventDate >= todayDate) {
  //     return true;
  //   }
  //   prisma.event.delete({ where: { id: event.id } });
  //   return false;
  // });
  const res = await fetch(process.env.URL + '/api/getEvents');
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const events = await res.json();
  const users = await prisma.user.findMany();
  const props = { events, users }

  return {
    props: { props },
  }
}

interface event {
  id: number;
  location: string;
  date: string;
  lat: number;
  lng: number;
  duration: string;
  creationDate: string;
  description: string;
  interested: number;
  social: boolean;
  socialDescription: string;
}

interface marker {
  id: number;
  location: string;
  date: string;
  // time: string;
  lat: number;
  lng: number;
  duration: string;
  interested: number;
  social: boolean;
  colour: string;
  title: string;
}

const greenMarker = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
const yellowMarker = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
const redMarker = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

var markers: marker[] = [];

export function generateMarkers(events: event[]) {

  events.map((event: event) => {
    const eventDate = new Date(event.date).getTime();
    const todayDate = new Date().getTime();

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.ceil((eventDate - todayDate) / oneDay);

    var col;
    var ttl;

    if (diffDays == 1) {
      col = redMarker;
      ttl = "<1 day";
    } else if (diffDays <= 3 && diffDays > 1) {
      col = yellowMarker;
      ttl = "<3 days";
    } else {
      col = greenMarker;
      ttl = ">3 days";
    }

    markers.push({
      id: event.id,
      location: event.location,
      date: event.date,
      lat: event.lat,
      lng: event.lng,
      duration: event.duration,
      interested: event.interested,
      social: event.social,
      colour: col,
      title: ttl
    });
  });
}

export default function Home({ props }: any) {
  const router = useRouter()

  const refreshData = () => {
    if (router.pathname === "/") {
      router.replace(router.asPath);
    }
  }

  const timer = setTimeout(() => {
    if (typeof window === "undefined") return null;
    if (router.pathname === "/") {
      refreshData();
    }
  }, 5000);

  const libraries = useMemo(() => ['places'], []);
  const { status, data } = useSession();

  var organisedByYouLink = '/myevents';
  if (data?.user === undefined) {
    organisedByYouLink = "/auth/signin";
  }

  var loggedIn: Boolean;
  const events = props.events;
  const users = props.users;
  var user: User | null;
  if (data?.user !== undefined && data?.user.name !== undefined) {
    console.log("username: ", data?.user.name);
    loggedIn = true;
    user = users.find((user: User) => user.username === data?.user.name);
  }
  else {
    loggedIn = false;
    user = null;
  }

  var mapCenter = { lat: 51.5126, lng: -0.1448 };

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
    googleMapsApiKey: DEVELOPMENT_GOOGLE_MAPS_KEY as string,
    libraries: libraries as any,
  });

  const [maxDist, setMaxDist] = React.useState(Number.MAX_VALUE);
  const [minInterested, setMinInterested] = React.useState(0);
  const [dateMin, setDateMin] = React.useState("0");
  const [dateMax, setDateMax] = React.useState("5000-01-01T00:00");
  const [social, setSocial] = React.useState(false);

  function refreshEvents(filters: any) {
    filters.preventDefault();
    setMaxDist(filters.target.MaxDist.value);
    setMinInterested(filters.target.MinInterested.value);
    setDateMin(filters.target.DateMin.value ? filters.target.DateMin.value.valueOf() : "0");
    setDateMax(filters.target.DateMax.value ? filters.target.DateMax.value.valueOf() : "5000-01-01T00:00");
    setSocial(filters.target.HasSocial.checked);
    return false;
  }

  function notFilteredEvent(event: event) {
    return (event.interested >= minInterested) &&
      (Date.parse(event.date).valueOf() >= Date.parse(dateMin).valueOf()) &&
      (Date.parse(event.date).valueOf() <= Date.parse(dateMax).valueOf()) &&
      (social == event.social == true || social == false) &&
      (loggedIn ? (user?.storedAdress ? getDistanceFromLatLonInKm(user!.lat!, user!.lng!, event.lat, event.lng) < maxDist : true) : true);
  }

  function notFilteredMarker(marker: marker) {
    return notFilteredEvent(getEventFromMarker(marker));
  }

  function getEventFromMarker(marker: marker) {
    return events.find((event: event) => event.id == marker.id);
  }

  function prettyDate(date: Date) {
    return moment(date).format('dddd MMMM Do, h:mm a');
  }

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  generateMarkers(events);

  var mostRecentlyOpenedInfoWindow: google.maps.InfoWindow;

  function initMap() {
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, { zoom: 14, center: mapCenter });
    map.setOptions(mapOptions);
    markers.map((marker: marker) => {
      if (notFilteredMarker(getEventFromMarker(marker))) {
        const newMarker = new google.maps.Marker({
          map: map,
          position: { lat: marker.lat, lng: marker.lng },
          icon: {
            url: marker.colour,
            labelOrigin: new google.maps.Point(10, -7)
          },
          title: marker.title,
          label: {
            text: marker.title,
            fontSize: "13px",
            fontWeight: "bold",
            color: 'black'
          }
        });
        const infowindow = new google.maps.InfoWindow();
        newMarker.addListener("click", () => {
          if (mostRecentlyOpenedInfoWindow) {
            mostRecentlyOpenedInfoWindow.close();
          }
          const markerEvent = getEventFromMarker(marker);
          infowindow.setContent(
            '<h3>' + markerEvent.location + '</h3>' +
            '<p>' + prettyDate(new Date(Date.parse(markerEvent.date))) +
            '<br>' + 'Duration:  ' + markerEvent.duration + ' hours</br>' +
            '<br>' + markerEvent.interested + ' Interested</br>' +
            (markerEvent.social ? '#Social' : '') + '</p>' +
            '<form action="/events/' + marker.id + '">' +
            '<input type="submit" value="View more event details ->" className={styles.viewEventButton} />' +
            '</form>');
          infowindow.open(map, newMarker);
          mostRecentlyOpenedInfoWindow = infowindow;
        });
      }
    });
  }

  return (
    <div className={styles.body}>
      <Head>
        <title>Waste Warriors</title>
      </Head>

      <body className={styles.body}>
        <Header />

        <main className={styles.mainIndex}>
          <div className={styles.filtersWrapper}>
            <form onSubmit={refreshEvents} className={styles.filters}>
              <h3>Filters: </h3>
              <div className={styles.filterForm}>
                <label form='MaxDist'>Maximum distance: </label>
                <input name='MaxDist' id='MaxDist' type='number' min='0' step={0.1} className={styles.filterInput}></input>
              </div>
              <div className={styles.filterForm}>
                <label form='MinInterested'>Minimum people interested: </label>
                <input name='MinInterested' id='MinInterested' type='number' min='0' className={styles.filterInput}></input>
              </div>
              <div className={styles.filterForm}>
                <label form='DateMin'>Date from: </label>
                <input name='DateMin' id='DateMin' type='datetime-local' className={styles.filterInput}></input>
              </div>
              <div className={styles.filterForm}>
                <label form='DateMax'>To: </label>
                <input name='DateMax' id='DateMax' type='datetime-local' className={styles.filterInput}></input>
              </div>
              <div className={styles.filterForm}>
                <label form='HasSocial'>Has social: </label>
                <input name='HasSocial' id='HasSocial' type='checkbox' className={styles.filterInput}></input>
              </div>
              <button type="submit">Refresh</button>
            </form>
          </div>
          <div className={styles.listView}>
            {data?.user === undefined ? <h3>Upcoming events:</h3> : <div style={{ display: 'flex', alignItems: 'center', gap: '5%' }}>
              <h3>Upcoming events:</h3>

              <form action={organisedByYouLink}>
                <input type="submit" value="Organised by you →" className={styles.accountButton} style={{ height: '20%' }} />
              </form>
            </div>}

            <div className={styles.eventList}>
              {events?.map((event: event) =>
                notFilteredEvent(event) ?
                  (<div key={event.id}>
                    <Link className={styles.linkNoUnderline} href={`/events/${encodeURIComponent(event.id)}`}>
                      <div className={styles.event}>
                        <div style={{ display: 'flex', maxHeight: '5%' }}>
                          <h2 style={{ float: 'left', flex: 'auto', marginTop: '-4px', maxWidth: '90%' }}>{event.location}</h2>
                          <div className={styles.tags}>
                            {((new Date()).valueOf() - Date.parse(event.creationDate).valueOf() < 1000 * 3600 * 24) ? <div className={styles.tagNew}>New Event</div> : null}
                            {event.social ? <div className={styles.tagSocial}>Social Afterwards</div> : null}
                          </div>
                        </div>
                        <h4 style={{ marginTop: '-15px' }}>{prettyDate(new Date(Date.parse(event.date)))}, Duration: {event.duration} h</h4>

                        <p className={styles.eventDescription} style={{ marginTop: '-15px' }}>{event.description}</p>
                        <p style={{ float: 'right', marginTop: '-15px' }}><strong>{event.interested}</strong> interested</p>
                        {user?.storedAdress ? <p style={{ float: 'left', marginTop: '-15px' }}><strong>{getDistanceFromLatLonInKm(user.lat!, user.lng!, event.lat, event.lng)}km</strong> away</p> : null}
                      </div>
                    </Link>
                  </div>) : null
              )}
            </div>
          </div>
          <div className={styles.mapView}>
            <div className={styles.map} style={{ width: '100%', height: '100%' }}>
              <GoogleMap
                id="map"
                options={mapOptions}
                zoom={14}
                center={mapCenter}
                mapTypeId={google.maps.MapTypeId.ROADMAP}
                mapContainerStyle={{ margin: "auto", width: "100%", height: "100%" }}
                onLoad={initMap}
              >
                {markers.map((marker) => (
                  <MarkerF
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    icon={{
                      url: marker.colour,
                    }}
                    title={marker.title}
                  />
                ))};
              </GoogleMap>
            </div>
          </div>
        </main>
      </body>
    </div >
  )
}

//TODO: find a way to hide maps api key in .env file
//POTENTIAL TODO: add id number to marker to link to card (using filter tool)