'use client'
import { useEffect, useState, useRef, MutableRefObject } from 'react';
import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../lib/prisma';
import { useLoadScript, GoogleMap, MarkerF, InfoWindow } from '@react-google-maps/api';
import { useMemo } from 'react';
import Geolocation from '@react-native-community/geolocation';
const DEVELOPMENT_GOOGLE_MAPS_KEY = "AIzaSyD_uZuWbXXwxHrP4jetAlgWzrrc-dgQ_6Q"
const PRODUCTION_GOOGLE_MAPS_KEY = "AIzaSyBXcHbmJFrRxrot8_NXQzNMBUITngrsWEo"
import type { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment'

export async function getServerSideProps() {
  const rawEvents = await prisma.event.findMany();
  const events = rawEvents?.filter((event: any) => {
    const eventDate = new Date(event.date).getTime();
    const todayDate = new Date().getTime();
    if (eventDate >= todayDate) {
      return true;
    }
    prisma.event.delete({ where: { id: event.id } });
    return false;
  });
  //const events = [{id:1, lat:51.5126, lng:-0.1448, date:"2023-06-23", interested:1, social:false}, {id:2, lat: 51.5226, lng: -0.1348, date:"2023-06-09", interested:5, social:true}, {id:3, lat:51.5236, lng:-0.1448, date:"2023-06-08", interested:2, social:true}, {id:4, lat: 51.5136, lng: -0.1448, date:"2023-06-06", interested:0, social:false}]
  return {
    props: { events }
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
      // time: new Date(event.date).toLocaleTimeString(),
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
  const [dateMin, setDateMin] = React.useState("0");
  const [dateMax, setDateMax] = React.useState("5000-01-01T00:00");
  const [social, setSocial] = React.useState(false);

  function refreshEvents(filters: any) {
    filters.preventDefault();
    // const maxDist = filters.target.MaxDist.value;
    setMinInterested(filters.target.MinInterested.value);
    setDateMin(filters.target.DateMin.value ? filters.target.DateMin.value.valueOf() : "0");
    setDateMax(filters.target.DateMax.value ? filters.target.DateMax.value.valueOf() : "5000-01-01T00:00");
    setSocial(filters.target.HasSocial.checked);
    return false;
  }

  function notFilteredEvent(event: event) {
    console.log("date max: ", Date.parse(event.date).valueOf() <= Date.parse(dateMax).valueOf());
    return (event.interested >= minInterested) &&
      (Date.parse(event.date).valueOf() >= Date.parse(dateMin).valueOf()) &&
      (Date.parse(event.date).valueOf() <= Date.parse(dateMax).valueOf()) &&
      (social == event.social == true || social == false);
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
                notFilteredEvent(event) ?
                  (<div key={event.id}>
                    <Link className={styles.linkNoUnderline} href={`/events/${encodeURIComponent(event.id)}`}>
                      <div className={styles.event}>
                        <div className={styles.tags}>
                          {((new Date()).valueOf() - Date.parse(event.creationDate).valueOf() < 1000 * 3600 * 24) ? <div className={styles.tagNew}>New</div> : null}
                          {event.social ? <div className={styles.tagSocial}>Social</div> : null}
                        </div>
                        <h4>{event.location}</h4>
                        <h4>{prettyDate(new Date(Date.parse(event.date)))}, Duration: {event.duration} h</h4>
                        {/* <h4>Duration: {event.duration} h</h4> */}
                        <p>About: {event.description}</p>
                        {event.social ? <div><p>Social event afterwards: {event.socialDescription}</p></div> : null}
                        <p>{event.interested} interested</p>
                      </div>
                    </Link>
                  </div>) : null
              )}
            </div>
          </div>
          <div className={styles.mapView}>
            <div className={styles.map} style={{ width: '57vw', height: '80vh' }}>
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
      </div>
    </div>
  )
}

//TODO: find a way to hide maps api key in .env file
//POTENTIAL TODO: add id number to marker to link to card (using filter tool)