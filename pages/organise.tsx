import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';
import prisma from '../lib/prisma';
import { User } from '@prisma/client';
import { signIn, signOut, useSession } from "next-auth/react";
import Header from './header';

export default function Organise() {
  const [social, setSocial] = React.useState(false);
  const { status, data } = useSession();

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
    googleMapsApiKey: "AIzaSyD_uZuWbXXwxHrP4jetAlgWzrrc-dgQ_6Q",
    libraries: libraries as any,
  });
  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  const now = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));

  async function saveEvent(event: any) {

    const organiser = data?.user.name;
    const mlng = (marker === undefined) ? -0.1967596 : marker.getPosition()?.lng();
    const mlat = (marker === undefined) ? 51.5090388 : marker.getPosition()?.lat();
    const location = event.target.Address.value;
    const date = event.target.Date.value;
    const time = event.target.Time.value;
    const dateTime = new Date(date + 'T' + time);
    const duration = event.target.Duration.value;
    const description = event.target.Description.value;
    const social = event.target.Social.checked;
    const socialDescription = event.target.SocialDescription.value;
    const jsdate = new Date();
    var mm = jsdate.getMonth() + 1; // getMonth() is zero-based
    var dd = jsdate.getDate();
    const creationDate = jsdate.getFullYear() + '-' + (mm > 9 ? '' : '0') + mm + '-' + (dd > 9 ? '' : '0') + dd + 'T' + jsdate.getHours() + ':' + jsdate.getMinutes();
    const body = { organiser: organiser, location: location, lat: mlat, lng: mlng, date: dateTime, duration: duration, creationDate: creationDate, description: description, social: social, socialDescription: socialDescription };
    const response = await fetch('/api/event', { method: 'POST', body: JSON.stringify(body), });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();

  }

  var marker: google.maps.Marker;
  
  function initMap(): void {
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, { zoom: 14, center: mapCenter });
    map.setOptions(mapOptions);

    marker = new google.maps.Marker({ position: mapCenter, map: map, title: "drag this pointer to choose location", draggable: true });
    const input = document.getElementById("Address") as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    map.addListener("bounds_changed", () => { searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds); });
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places!.length == 0) return;
      const bounds = new google.maps.LatLngBounds();
      if (places![0].geometry?.viewport) bounds.union(places![0].geometry!.viewport);
      else bounds.extend(places![0].geometry!.location!);
      map.fitBounds(bounds);
      marker.setPosition(bounds.getCenter());
    });
  }

  if (status === "loading") {
    return <p>Loading...</p>
  }

  return (
    <div>
      <Head>
        <title>Organise event</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={styles.body}>
        <Header />

        <main className={styles.mainIndex}>
          <form onSubmit={saveEvent} action="/">
            <div style={{ display: 'flex' }}>
              <div style={{ float: 'right', flex: '1', minWidth: '50%' }}>
                <div className={styles.card}>
                  <label form='Address'>Location: </label>
                  <input name='Address' id='Address' required className={styles.locationInput} placeholder="Enter Location"></input>
                </div>
                <div className={styles.card}>
                  <label form='Date'>Date: </label>
                  <input type="date" name='Date' id='Date' min={now} required></input>
                </div>
                <div className={styles.card}>
                  <label form='Time'>Time: </label>
                  <input type="time" name='Time' id='Time' min={now} required></input>
                </div>
                <div className={styles.card}>
                  <label form='Duration'>Estimated duration (in hours): </label>
                  <input type="number" step="0.5" name='Duration' id='Duration' min={0} required></input>
                </div>
                <div className={styles.card}>
                  <label form='Description'>Description: </label>
                  <textarea name='Description' id='Description' rows={6} style={{ width: '100%' }} required className={styles.textarea}></textarea>
                </div>
                <div className={styles.card}>
                  <label form='Social'>Does the event have a social event: </label>
                  <input type="Checkbox" name='Social' id='Social'></input>
                </div>
                <div className={styles.card}>
                  <label form='SocialDescription'>Social event description (optional): </label>
                  <textarea name='SocialDescription' id='SocialDescription' rows={6} style={{ width: '100%' }} className={styles.textarea} disabled={false} ></textarea>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: '6%',
                  }}>
                  <button type="submit" id="submit" className={styles.button} style={{ height: '8vh', width: '20vw', backgroundColor: "#FFCE66", fontSize: "20px" }}>
                    Submit
                  </button>
                </div>
              </div>
              <div style={{ float: 'left', backgroundColor: '#90a955', flex: '1', minWidth: '50%', }}>
                <GoogleMap
                  id="map"
                  options={mapOptions}
                  zoom={14}
                  center={mapCenter}
                  mapTypeId={google.maps.MapTypeId.ROADMAP}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  onLoad={initMap}
                />
              </div>
            </div>
          </form>
        </main>
      </body>
    </div>
  );
}