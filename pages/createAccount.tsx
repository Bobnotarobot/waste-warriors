import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { FormEventHandler, useMemo, useState } from "react";
import styles from './page.module.css'
import Link from "next/link";
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

interface Props { }

export default function CreateAccount() {

  const [userInfo, setUserInfo] = useState({ username: '', password: '' })

  async function saveAccount(account: any) {
    const username = account.target.Username.value;
    const password = account.target.Password.value;
    const mlng = marker.getPosition()?.lng();
    const mlat = marker.getPosition()?.lat();

    const body = { username: username, password: password, lat: mlat, lng: mlng };
    const response = await fetch('/api/account', { method: 'POST', body: JSON.stringify(body), });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
  }

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

  return (
    <div className={styles.accountFormContainer}>
      <form onSubmit={saveAccount} className={styles.accountForm} action="/">
        <div>
          <label form='Username'>Username: </label>
          <input name='Username' id='Username' required placeholder="Username"></input>
        </div>
        <div>
          <label form='Password'>Password: </label>
          <input type="password" name='Password' id='Password' required placeholder="********"></input>
        </div>
        <div>
          <label form='Address'>Your Address (Optional, used to help you find nearby events): </label>
          <input name='Address' id='Address' placeholder="Enter Location"></input>
        </div>
        <button type="submit" id="submit">
          Create account
        </button>
        <Link className={styles.linkNoUnderline} href="/">
          back
        </Link>
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
      </form>
    </div>
  )
}