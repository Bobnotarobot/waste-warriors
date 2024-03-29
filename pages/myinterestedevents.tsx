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
import { Event, User } from '@prisma/client';
import Header from './header';

export async function getServerSideProps() {
  const users = await prisma.user.findMany({
    include: { events: true }
  });
  return {
    props: { users }
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
  orgKey: string;
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

export default function Home({ users }: any) {
  const router = useRouter();

  const libraries = useMemo(() => ['places'], []);
  const { status, data } = useSession();

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
  const [dateMin, setDateMin] = React.useState("0");
  const [dateMax, setDateMax] = React.useState("5000-01-01T00:00");
  const [social, setSocial] = React.useState(false);

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return Math.round(d * 10) / 10;
  }
  
  function deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }

  function notFilteredEvent(event: event) {
    return event.orgKey === data?.user.name;
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

  if (status === "loading") {
    return <p>Loading...</p>
  }

  const user = users.find((user: User) => user.username === data?.user.name)
  const events = user.events;

  generateMarkers(events);

  return (
    <div className={styles.body}>
      <Head>
        <title>My events</title>
      </Head>

      <body className={styles.body}>
        <Header />

        <main className={styles.mainIndex}>
          <div className={styles.listView}>
            <h3>Your events:</h3>

            <div className={styles.eventList}>
              {events?.map((event: event) =>
                <div key={event.id}>
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
              </div>
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