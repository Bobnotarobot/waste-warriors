import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { FormEventHandler, useState } from "react";
import styles from '../page.module.css';
import Link from 'next/link';

interface Props { }

const SignIn: NextPage = (props): JSX.Element => {

  const [userInfo, setUserInfo] = useState({ username: '', password: '' })

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    console.log("got here");
    const res = await signIn('credentials', {
      username: userInfo.username,
      password: userInfo.password,
      redirect: false,
    });

    console.log(res);
  };

  return (
    <div className={styles.accountFormContainer}>
      <form onSubmit={handleSubmit} className={styles.accountForm}>
        <div>
          <label form='Username'>Username: </label>
          <input type="string" placeholder="username"
            value={userInfo.username}
            onChange={({ target }) =>
              setUserInfo({ ...userInfo, username: target.value })} />
        </div>
        <div>
          <label form='Password'>Password: </label>
          <input type="password" placeholder="********"
            value={userInfo.password}
            onChange={({ target }) =>
              setUserInfo({ ...userInfo, password: target.value })} />
        </div>
        <button type="submit" id="submit">
          Sign in
        </button>
        <Link className={styles.linkNoUnderline} href="/">
          back
        </Link>
      </form>
    </div >
  )
}

export default SignIn;