import styles from './page.module.css';
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {

  const { status, data } = useSession();

  return (
    <header className={styles.header}>
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
      <form action="/organise">
        <input type="submit" value="Organise your own! →" className={styles.organiseEventButton} />
      </form>
      <form action="/clans">
        <input type="submit" value="Join a Clan!" className={styles.organiseEventButton} />
      </form>
    </header>
  )
}