import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script'
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';

export default function Organise() {
  const [social, setSocial] = React.useState(false);

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
  var marker: google.maps.Marker;

  async function saveEvent(event: any) {
    const mlng = marker.getPosition()?.lng();
    const mlat = marker.getPosition()?.lat();
    const location = event.target.Address.value;
    const date = event.target.Date.value;
    const duration = event.target.Duration.value;
    const description = event.target.Description.value;
    const social = event.target.Social.checked;
    const socialDescription = event.target.SocialDescription.value;
    const jsdate = new Date();
    var mm = jsdate.getMonth() + 1; // getMonth() is zero-based
    var dd = jsdate.getDate();
    const creationDate = jsdate.getFullYear() + '-' + (mm > 9 ? '' : '0') + mm + '-' + (dd > 9 ? '' : '0') + dd + 'T' + jsdate.getHours() + ':' + jsdate.getMinutes();
    const body = { location: location, lat: mlat, lng: mlng, date: date, duration: duration, creationDate: creationDate, description: description, social: social, socialDescription: socialDescription };
    const response = await fetch('/api/event', { method: 'POST', body: JSON.stringify(body), });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
    
  }

  function initMap(): void {
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, { zoom: 14, center: mapCenter });
    marker = new google.maps.Marker({ position: mapCenter, map: map, title: "drag this pointer to choose location", draggable: true });
    const input = document.getElementById("Address") as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.addListener("bounds_changed", () => { searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds); });
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places!.length == 0)return;
      const bounds = new google.maps.LatLngBounds();
      if (places![0].geometry?.viewport) bounds.union(places![0].geometry!.viewport);
      else bounds.extend(places![0].geometry!.location!);
      map.fitBounds(bounds);
      marker.setPosition(bounds.getCenter());
    });
  }

  function enableSocial() {
    setSocial(!social);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Organise event</title>
        <link rel="icon" href="/favicon.ico" />
        <Script>
          {'dateInput = document.getElementById("Date"); dateInput.min = new Date().toISOString().slice(0,new Date().toISOString().lastIndexOf(":"));'}'
        </Script>
      </Head>

      <main>
        <h1>Organise event</h1>

        <form className="flex flex-col" onSubmit={saveEvent}>
          <div className={styles.card}>
            <label form='Image'>Image: </label>
            <input type="file" name='Image' id='Image' accept="image/png, image/jpeg"></input>
          </div>
          <div className={styles.card}>
            <input name='Address' id='Address'></input>
          </div>
          <GoogleMap
            id="map"
            options={mapOptions}
            zoom={14}
            center={mapCenter}
            mapTypeId={google.maps.MapTypeId.ROADMAP}
            mapContainerStyle={{ width: '800px', height: '800px' }}
            onLoad={initMap}
          />
          <div className={styles.card}>
            <label form='Date'>Date and time: </label>
            <input type="datetime-local" name='Date' id='Date' required></input>
          </div>
          <div className={styles.card}>
            <label form='Duration'>Duration (hours): </label>
            <input type="number" step="0.1" name='Duration' id='Duration' required></input>
          </div>
          <div className={styles.card}>
            <label form='Description'>Description: </label>
            <textarea name='Description' id='Description' rows={6} cols={42} required className={styles.textarea}></textarea>
          </div>
          <div className={styles.card}>
            <label form='Social'>Social: </label>
            <input type="Checkbox" name='Social' id='Social'></input>
          </div>
          <div className={styles.card}>
            <label form='Social Description'>Social Description: </label>
            <textarea name='SocialDescription' id='SocialDescription' rows={6} cols={42} required className={styles.textarea} disabled={!social}></textarea>
          </div>
          <button type="submit" id="submit">
            Submit
          </button>
        </form>

        <div className={styles.card}>
          <Link href="/">back</Link>
        </div>

      </main>
    </div>


  );
}