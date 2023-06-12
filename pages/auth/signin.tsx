import { NextPage } from "next";
import { signIn } from "next-auth/react";
import { FormEventHandler, useState } from "react";

interface Props { }

const SignIn: NextPage = (props): JSX.Element => {

  const [userInfo, setUserInfo] = useState({ username: '', password: '' })

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const res = await signIn('credentials', {
      username: userInfo.username,
      password: userInfo.password,
      redirect: false,
    });

    console.log(res);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="string" placeholder="username"
          value={userInfo.username}
          onChange={({ target }) =>
            setUserInfo({ ...userInfo, username: target.value })} />
        <input type="password" placeholder="********"
          value={userInfo.password}
          onChange={({ target }) =>
            setUserInfo({ ...userInfo, password: target.value })} />
        <input type="submit" placeholder="Login" />
      </form>
    </div>
  )
}

export default SignIn;