import router, { useRouter } from 'next/router';
import styles from './page.module.css';
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { status, data } = useSession();
  const router = useRouter();

  var yourEventsLink = "/myinterestedevents";
  var organiseEventLink = "/organise";
  if (data?.user === undefined) {
    yourEventsLink = "/auth/signin";
    organiseEventLink = "/auth/signin";
  }

  return (
    <header className={styles.header}>
      <div className={styles.leftHeader}>
        <form action="/">
          <input type="submit" value="Home" className={styles.homeButton} />
        </form>
        <button className={styles.accountButton} onClick={() => {
          signIn();
        }}>Sign in</button>
        <button className={styles.accountButton} onClick={() => {
          signOut();
        }}>Sign out</button>
        <form action="/createAccount">
          <input type="submit" value="Create account" className={styles.accountButton} />
        </form>
        {data?.user !== undefined ? <div className={styles.signedIn}> Signed in: {data?.user.name}</div> : <div className={styles.signedIn}> Not signed in</div>}
      </div>
      <div className={styles.rightHeader}>
        <form action="/clanLeaderboard">
          <input type="submit" value="Clan Leaderboard" className={styles.organiseEventButton} />
        </form>
        <form action="/clans">
          <input type="submit" value="Join a Clan!" className={styles.organiseEventButton} />
        </form>
        <form action={yourEventsLink}>
          <input type="submit" value="Your events!" className={styles.organiseEventButton} />
        </form>
        <form action={organiseEventLink}>
          <input type="submit" value="Organise an event! →" className={styles.organiseEventButton} />
        </form>
      </div>
    </header>
  )
}