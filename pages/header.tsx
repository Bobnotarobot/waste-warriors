import router, { useRouter } from 'next/router';
import styles from './page.module.css';
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { status, data } = useSession();
  const router = useRouter();

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
        <button type="submit" onClick={() => {
          if (data?.user === undefined) {
            router.push('/auth/signin')
          }
          else {
            router.push('/myevents')
          }
        }} className={styles.organiseEventButton}>Your Events</button>
        <button type="submit" onClick={() => {
          if (data?.user === undefined) {
            router.push('/auth/signin')
          }
          else {
            router.push('/organise')
          }
        }} className={styles.organiseEventButton}>Organise an event! →</button>
      </div>
    </header>
  )
}