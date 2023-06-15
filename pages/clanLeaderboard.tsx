import { size } from 'cypress/types/lodash';
import prisma from '../lib/prisma';
import styles from './page.module.css';
import Link from 'next/link';
import Header from './header';


export async function getServerSideProps() {
    const clans = (await prisma.clan.findMany()).sort((a, b) => b.points - a.points);
    return {
      props: { clans }
    }
}

interface clan {
    name: string;
    logo: string;
    location: string;
    points: number;
}

const defaultImg = "https://thumbs.dreamstime.com/b/cute-happy-smiling-trash-bin-plastic-bottle-vector-flat-cartoon-character-illustration-icon-design-isolated-white-175339385.jpg"

export default function ClanLeaderboard({ clans }: any) {
    var bgCol;
    return(
        <main>
            <Header />
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#98bf64'}}>
                <div className={styles.leaderboardListView}>
                    {clans.map((clan : clan, index : number) => {
                        const image = clan.logo! || defaultImg;
                        if (index == 0) {
                            bgCol = '#ffd700'
                        } else if (index == 1) {
                            bgCol = '#c0c0c0'
                        } else if (index == 2) {
                            bgCol = '#cd7f32'
                        } else {
                            bgCol = '#ffffff'
                        }
                        return(
                           <Link className={styles.linkNoUnderline} key={index} style={{display: 'flex', alignItems: 'center',justifyContent: 'space-between', border: '2px solid #132a13', padding: '1rem', width: "90%", borderRadius: '5px', backgroundColor: bgCol }} href={`/clans/${encodeURIComponent(clan.name)}`}>
                                <span style={{fontSize: '2em'}}>{index + 1}</span>
                                <img src={image} alt="" height='200' max-height='100%' object-fit='cover' />

                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <h3 style={{alignItems: 'center', padding: '5px', fontSize:"1.5em" }}>{clan.name}</h3>    
                                    <span style={{fontSize: "1.2em"}}>{clan.location}</span>     
                                </div>
                            
                                <span style={{display: 'flex', float: 'right', alignSelf: "flex-end", fontSize:"1.2em"}}>{clan.points} points</span>
                            </Link>)
                        })}
                </div>
            </div>
        </main>
    )
}