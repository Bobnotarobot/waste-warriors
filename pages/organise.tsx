import styles from './page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';

export default function Organise() {
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
    googleMapsApiKey: "AIzaSyD_uZuWbXXwxHrP4jetAlgWzrrc-dgQ_6Q" ,
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
    const creationDate = jsdate.getFullYear() + '-' + (jsdate.getMonth() + 1) + '-' + jsdate.getDate() + 'T' + jsdate.getHours() + ':' + jsdate.getMinutes();
    const body = {location: location, lat:mlat, lng:mlng, date: date, duration: duration, creationDate: creationDate, description: description, social: social, socialDescription: socialDescription};
    const response = await fetch('/api/event', { method: 'POST', body: JSON.stringify(body), });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();//add return to index page
  }

  function initMap(): void {
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, { zoom: 14, center: mapCenter });
    marker = new google.maps.Marker({position: mapCenter, map: map, title: "drag this pointer to choose location", draggable:true });
    const input = document.getElementById("Address") as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.addListener("bounds_changed", () => {searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);});
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

  return (
    <div className={styles.container}>
      <Head>
        <title>Organise event</title>
        <link rel="icon" href="/favicon.ico" />
        <script>
          let dateInput = document.getElementById("Date");
          dateInput.min = new Date().toISOString().slice(0,new Date().toISOString().lastIndexOf(":"));
        </script>
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
            <input name='Description' id='Description' style={{width: "400px"}}></input>
          </div>
          <div className={styles.card}>
            <label form='Social'>Social: </label> {/*add checkbox*/}
            <input type="Checkbox" name='Social' id='Social'></input>
          </div>
          <div className={styles.card}>
            <label form='Social Description'>Social Description: </label>
            <input name='SocialDescription' id='SocialDescription'></input>
          </div>
          <button type="submit">
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