import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <form className="new-item-form">
        <div className="form-row">
          <label htmlFor="item">Hi I cchanged the text</label>
        </div>
        <button className="btn">Button</button>
      </form>
    </>
  )
}
