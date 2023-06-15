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

export async function getServerSideProps(context: { query: { name: any; }; }) {
    const { name } = context.query;
    const oldclan = await prisma.clan.findUnique({
      where: {
        name: name
      }
    })
    return {
      props: { oldclan }
    }
  }

export default function EditEvent({ oldclan }: any) {
  const router = useRouter();
  const { status, data } = useSession();

  if (data?.user === undefined || data?.user.name !== oldclan.owner) {
    redirect('/')
  }

  const libraries = useMemo(() => ['places'], []);
  var mapCenter = { lat: oldclan.lat, lng: oldclan.lng };
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

  async function makeClan(clan: any) {
    const oldName = oldclan.name;
    const mlng = marker.getPosition()?.lng();
    const mlat = marker.getPosition()?.lat();
    const name = clan.target.Name.value;
    const logo = clan.target.Logo.value;
    const location = clan.target.Address.value;
    const description = clan.target.Description.value;
    const body = { oldName: oldName, name: name, logo: logo, location: location, lat: mlat, lng: mlng, description: description};
    const response = await fetch('/api/clanedit', { method: 'POST', body: JSON.stringify(body), });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();

  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Organise event</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <div style={{ display: 'flex' }}>
          <Link href="/clans" style={{ float: 'left', flex: 'initial', width: '40px', height: '50px', backgroundColor: '#5f873d', textAlign: 'center' }}>←</Link>
          <h1 style={{ float: 'right', flex: 'auto', textAlign: 'center', backgroundColor: '#4f772d', height: '50px', margin: '0' }}>Organise clan</h1>
        </div>

        <form onSubmit={makeClan} action="/clans">
          <div style={{ display: 'flex' }}>
            {/* <div className={styles.uploadcard}>
              <label form='Image'>Image: </label>
              <input type="file" name='Image' id='Image' accept="image/png, image/jpeg"></input>
            </div> */}
            <div style={{ float: 'right', flex: '1', minWidth: '50%', backgroundColor: '#90a955' }}>
              <div className={styles.card}>
                <label form='Name'>Name </label>
                <input type="text" name='Name' id='Name' required defaultValue={oldclan.name}></input>
              </div>
              <div className={styles.card}>
                <label form='Address'>Location (optional, only include if you&apos;ll only be cleaning in a certain area): </label>
                <input name='Address' id='Address' className={styles.locationInput} placeholder="Enter Location" defaultValue={oldclan.location}></input>
              </div>
              <div className={styles.card}>
                <label form='Logo'>Link to logo (optional): </label>
                <input type="text" name='Logo' id='Logo' defaultValue={oldclan.logo}></input>
              </div>
              <div className={styles.card}>
                <label form='Description'>Description: </label>
                <textarea name='Description' id='Description' rows={6} style={{ width: '100%' }} required className={styles.textarea} defaultValue={oldclan.description}></textarea>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: '6%',
                }}>
                <button type="submit" id="submit" className={styles.button} style={{height: '8vh', width: '20vw', backgroundColor: "#FFCE66", fontSize: "20px", marginTop: '20px'}}>
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
    </div>
  );
}