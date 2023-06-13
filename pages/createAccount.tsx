import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { FormEventHandler, useState } from "react";
import styles from './page.module.css'
import Link from "next/link";

interface Props { }

export default function CreateAccount() {

  const [userInfo, setUserInfo] = useState({ username: '', password: '' })

  async function saveAccount(account: any) {
    const username = account.target.Username.value;
    const password = account.target.Password.value;
    const body = { username: username, password: password };
    const response = await fetch('/api/account', { method: 'POST', body: JSON.stringify(body), });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();

  }

  return (
    <div className={styles.accountFormContainer}>
      <form onSubmit={saveAccount} className={styles.accountForm}>
        <div>
          <label form='Username'>Username: </label>
          <input name='Username' id='Username' required placeholder="Username"></input>
        </div>
        <div>
          <label form='Password'>Password: </label>
          <input type="password" name='Password' id='Password' required placeholder="********"></input>
        </div>
        <Link className={styles.linkNoUnderline} href="/">
          <button type="submit" id="submit">
            Create account
          </button>
        </Link>
      </form>
    </div>
  )
}