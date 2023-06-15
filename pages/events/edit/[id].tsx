import styles from '../../page.module.css'
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';
import prisma from '../../../lib/prisma';
import { User } from '@prisma/client';
import { signIn, signOut, useSession } from "next-auth/react";
import Header from '../../header';
import { useRouter } from 'next/router';
import { redirect } from 'next/navigation';
import moment from 'moment';

export async function getServerSideProps(context: { query: { id: any; }; }) {
    const { id } = context.query;
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(id)
      }
    })
    return {
      props: { event }
    }
  }

export default function EditEvent({ event }: any) {
  const router = useRouter();
  const { status, data } = useSession();

  if (data?.user === undefined || data?.user.name !== event.orgKey) {
    redirect('/')
  }

  const [social, setSocial] = React.useState(false);

  const libraries = useMemo(() => ['places'], []);
  var mapCenter = { lat: event.lat, lng: event.lng };
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
  const now = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));

  async function saveEvent(newevent: any) {
    const id = event.id;
    const mlng = marker.getPosition()?.lng();
    const mlat = marker.getPosition()?.lat();
    const location = newevent.target.Address.value;
    const date = newevent.target.Date.value;
    const time = newevent.target.Time.value;
    const dateTime = new Date(date + 'T' + time);
    const duration = newevent.target.Duration.value;
    const description = newevent.target.Description.value;
    const social = newevent.target.Social.checked;
    const socialDescription = newevent.target.SocialDescription.value;
    const body = { id: id, location: location, lat: mlat, lng: mlng, date: dateTime, duration: duration, description: description, social: social, socialDescription: socialDescription };
    const response = await fetch('/api/eventedit', { method: 'POST', body: JSON.stringify(body), });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();

  }

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

  return (
    <div>
      <Head>
        <title>Organise event</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={styles.body}>
        <Header />

        <main className={styles.mainIndex}>
          <form onSubmit={saveEvent} action={`/events/${encodeURIComponent(event.id)}`}>
            <div style={{ display: 'flex' }}>
              <div style={{ float: 'right', flex: '1', minWidth: '50%' }}>
                <div className={styles.card}>
                  <label form='Address'>Location: </label>
                  <input name='Address' id='Address' required className={styles.locationInput} defaultValue={event.location}></input>
                </div>
                <div className={styles.card}>
                  <label form='Date'>Date: </label>
                  <input type="date" name='Date' id='Date' min={now} required defaultValue={moment(event.date).format('YYYY-MM-DD')}></input>
                </div>
                <div className={styles.card}>
                  <label form='Time'>Time: </label>
                  <input type="time" name='Time' id='Time' min={now} required defaultValue={moment(event.date).format('HH:mm')}></input>
                </div>
                <div className={styles.card}>
                  <label form='Duration'>Estimated duration (in hours): </label>
                  <input type="number" step="0.5" name='Duration' id='Duration' min={0.0} required defaultValue={event.duration}></input>
                </div>
                <div className={styles.card}>
                  <label form='Description'>Description: </label>
                  <textarea name='Description' id='Description' rows={6} style={{ width: '100%' }} required className={styles.textarea} defaultValue={event.description}></textarea>
                </div>
                <div className={styles.card}>
                  <label form='Social'>Does the event have a social event: </label>
                  <input type="Checkbox" name='Social' id='Social' checked={event.social}></input>
                </div>
                <div className={styles.card}>
                  <label form='SocialDescription'>Social event description (optional): </label>
                  <textarea name='SocialDescription' id='SocialDescription' rows={6} style={{ width: '100%' }} className={styles.textarea} defaultValue={event.socialDescription}></textarea>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: '6%',
                  }}>
                  <button type="submit" id="submit" className={styles.button} style={{ height: '8vh', width: '20vw', backgroundColor: "#FFCE66", fontSize: "20px" }}>
                    Update
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