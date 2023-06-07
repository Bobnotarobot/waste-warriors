'use client'
import { useEffect, useState, useRef, MutableRefObject } from 'react';
import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';
import { useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useMemo } from 'react';
import Geolocation from '@react-native-community/geolocation';
const DEVELOPMENT_GOOGLE_MAPS_KEY = "AIzaSyD_uZuWbXXwxHrP4jetAlgWzrrc-dgQ_6Q"
const PRODUCTION_GOOGLE_MAPS_KEY = "AIzaSyBXcHbmJFrRxrot8_NXQzNMBUITngrsWEo"
import type { NextApiRequest, NextApiResponse } from 'next';

export async function getServerSideProps() {
  const events = await prisma.event.findMany();
  //const events = [{id:1, location:"51.5126, -0.1448", date:"2023-06-23"}, {id:2, location:"51.5226, -0.1348", date:"2023-06-09"}, {id:1, location:"51.5236, -0.1448", date:"2023-06-08"}, {id:4, location:"51.5136, -0.1448", date:"2023-06-06"}]
  return {
    props: { events }
  }
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

interface marker {
  id: number;
  lat: number;
  lng: number;
  colour: string;
  title: string;
}

const greenMarker = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
const yellowMarker = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
const redMarker = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

var markers: marker[] = [];

export function generateMarkers(events: event[]) {

  events.map((event: event) => {
    const latLng = event.location.split(",").map(Number);

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
    } else if (diffDays > 3) {
      col = greenMarker;
      ttl = ">3 days";
    } else {
      // does not display stale markers ie. in the past wrt today
      //TODO: remove stale events from database
      return;
    }
    markers.push({ id: event.id, lat: latLng[0], lng: latLng[1], colour: col, title: ttl });
  });
}

export default function Home({ events }: any) {
  const libraries = useMemo(() => ['places'], []);

  var mapCenter = { lat: 51.5126, lng: -0.1448 };
  /*if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
    mapCenter = { lat: position.coords.latitude, lng: position.coords.longitude };
    });
  }*/

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
  const [dateMin, setDateMin] = React.useState(0);
  const [dateMax, setDateMax] = React.useState(Number.MAX_VALUE);
  const [social, setSocial] = React.useState(false);

  function refreshEvents(filters: any) {
    filters.preventDefault();
    // const maxDist = filters.target.MaxDist.value;
    setMinInterested(filters.target.MinInterested.value);
    setDateMin(filters.target.DateMin.value ? filters.target.DateMin.value.valueOf() : 0);
    setDateMax(filters.target.DateMax.value ? filters.target.DateMax.value.valueOf() : Number.MAX_VALUE);
    setSocial(filters.target.HasSocial.checked);
    return false;
  }

  function notFiltered(event: event) {
    console.log(event.date);
    console.log(dateMin);
    console.log(dateMax);
    return (event.interested >= minInterested) &&
      (Date.parse(event.date).valueOf() >= dateMin) &&
      (Date.parse(event.date).valueOf() <= dateMax) &&
      (social == event.social == true || social == false);
  }

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  generateMarkers(events);

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
                <input name='MaxDist' id='MaxDist' type='number' min='0'></input>
              </div>
              <div className={styles.filterForm}>
                <label form='MinInterested'>Minimum people interested: </label>
                <input name='MinInterested' id='MinInterested' type='number' min='0'></input>
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
                notFiltered(event) ?
                  (<div key={event.id}>
                    <div className={styles.event}>
                      <h4>{event.location}</h4>
                      <h4>{event.date}</h4>
                      <h4>Duration: {event.duration} h</h4>
                      <p>About: {event.description}</p>
                      <p>{event.interested} interested</p>
                    </div>
                  </div>) : null
              )}
            </div>
          </div>
          <div className={styles.mapView}>
            <h3> The map</h3>
            <div className={styles.map}>
              <GoogleMap
                options={mapOptions}
                zoom={14}
                center={mapCenter}
                mapTypeId={google.maps.MapTypeId.ROADMAP}
                mapContainerStyle={{ width: '833px', height: '550px' }}
                onLoad={() => console.log('Map Component Loaded...')}
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
      </div>
    </div>
  )
}

//TODO: add info window to markers
//TODO: link clicking marker to event page
//TODO: find a way to hide maps api key in .env file
//POTENTIAL TODO: add id number to marker to link to card (using filter tool)