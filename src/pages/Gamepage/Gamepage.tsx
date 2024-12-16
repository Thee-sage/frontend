import { Game } from "./Game";
import { useState, useEffect } from 'react';
import styles from "./Gamepage.module.css";
import { StandardAdCard } from '../../components/minorcomponents/StandardAdCard/StandardAdCard';
import { FooterAdCard } from "../../components/minorcomponents/footeradcard/footerAdCard";
import { SidebarAdCard } from '../../components/minorcomponents/SidebarAdCard/SidebarAdCard';
import { RotatingMainContentAds } from '../../components/minorcomponents/RotatingMainContentAds/RotatingMainContentAds';
import { AdContainer } from '../../components/minorcomponents/AdContainer/AdContainer';
import { Ad } from '../../components/minorcomponents/types';
import PlinkoInfo from "./plinkoinfo/plinkoinfo";

const HEADER_VISIBLE_ADS = 4;
const SIDEBAR_VISIBLE_ADS = 4;
const FOOTER_VISIBLE_ADS = 3;
const ROTATION_INTERVAL = 50000;

export function GamePage() {
  const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);
  const [currentSidebarIndex, setCurrentSidebarIndex] = useState(0);
  const [currentFooterIndex, setCurrentFooterIndex] = useState(0);

  const getVisibleAds = (ads: Ad[], startIndex: number, visibleCount: number): Ad[] => {
    if (ads.length <= visibleCount) return ads;
    
    const wrappedIndex = startIndex % ads.length;
    const visibleAds: Ad[] = [];
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (wrappedIndex + i) % ads.length;
      visibleAds.push(ads[index]);
    }
    
    return visibleAds;
  };

  useEffect(() => {
    const intervals = [
      setInterval(() => {
        setCurrentHeaderIndex(prev => prev + 1);
      }, ROTATION_INTERVAL),
      
      setInterval(() => {
        setCurrentSidebarIndex(prev => prev + 1);
      }, ROTATION_INTERVAL * 1.5),
      
      setInterval(() => {
        setCurrentFooterIndex(prev => prev + 1);
      }, ROTATION_INTERVAL * 2)
    ];

    return () => intervals.forEach(interval => clearInterval(interval));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.paga}>
      <AdContainer
        renderAds={({ headerAds, sidebarAds, mainContentAds, footerAds }) => (
          <div className={styles.whole2}>
          <div className={styles.whole1}>

          <div className={styles.whole}>
          <div className={styles.headerAds}>
              {getVisibleAds(headerAds, currentHeaderIndex, HEADER_VISIBLE_ADS).map((ad) => (
                <StandardAdCard key={`${ad._id}-${currentHeaderIndex}`} ad={ad} />
              ))}
          </div>
          
          <div className={styles.contentWrapper}>
            <div className={styles.mainContent}>
              <div className={styles.gameandplinkoinfowrapper}>
                <div className={styles.titleanddivider}>
                  <h2 className={styles.formTitle}>
                    Play the Game!
                  </h2>
                  <div className={styles.dividerContainer}>
                    <div className={styles.divider} />
                  </div>
              </div>

              <div className={styles.dividerandentirewrapper}>
                <div className={styles.plinkoinfowrapper}>
                  <div className={styles.innerContainer}>
                    <PlinkoInfo />
                  </div>
                </div> 
                <div className={styles.gameWrapper}>
                  <Game />
                </div>
              </div>
              </div>
            </div>
          </div>
          
          <div className={styles.maincontentaaaaa}>
            <div className={styles.mainContentAds1}> 
              <div className={styles.mainContentAds}>
                <RotatingMainContentAds ads={mainContentAds} />
              </div>
            </div>

            <div className={styles.conta}>
              <div className={styles.contentSection}>
                <div className={styles.contentItem}>
                  <div className={styles.contentText}>
                    <p>
                      Plinko has become a casino gambling and arcade favorite that combines elements of chance with the illusion of skill. 
                      The game features a vertical board where players drop disks (or virtual disks in digital versions) that bounce off 
                      strategically placed pegs before landing in prize slots at the bottom. While the game appears simple, there are several 
                      key aspects players should understand. The physics of the pegs means that even small differences in drop position can 
                      lead to wildly different outcomes - a disk that starts just millimeters to the left or right may end up in a completely 
                      different slot. The bottom slots typically follow a pattern where the highest-value prizes are in the center, with lower 
                      values toward the edges, encouraging players to aim for the middle.
                    </p>
                    <p>
                      Most casino versions offer payouts ranging from 0x to around 1000x your bet, though the exact amounts vary by establishment. 
                      The house edge is built into the peg layout and prize distribution - while big wins are possible, the game is designed so 
                      that over time, the house maintains an advantage. Players should be aware that despite any perceived patterns or "hot spots," 
                      each drop is an independent event with no memory of previous results. Some may develop theories about optimal drop positions, 
                      but the chaotic nature of the bounces means no strategy can consistently predict where a disk will land.
                    </p>
                    <p>
                      Digital and mobile versions of Plinko have exploded in popularity, especially on gambling websites and apps. These versions 
                      use random number generators to simulate the physics of the original game, though players should verify they're playing on 
                      legitimate, licensed platforms to ensure fair odds. Whether playing physically or digitally, it's crucial to set strict 
                      betting limits and treat Plinko as entertainment rather than a reliable way to win money, as the random nature of the game 
                      means streaks of both wins and losses are common.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          
          <div className={styles.rsb}>
            <div className={styles.rightSidebar}>
              {getVisibleAds(sidebarAds, currentSidebarIndex, SIDEBAR_VISIBLE_ADS).map((ad) => (
                <SidebarAdCard key={`${ad._id}-${currentSidebarIndex}`} ad={ad} />
              ))}
            </div>
          </div>
          </div>

          <div className={styles.foota}>
            <div className={styles.footerAds}>
              {getVisibleAds(footerAds, currentFooterIndex, FOOTER_VISIBLE_ADS).map((ad) => (
                <FooterAdCard key={`${ad._id}-${currentFooterIndex}`} ad={ad} />
              ))}
            </div>
          </div>
          </div>
        )}
      >
        <div className={styles.gameWrapper}>
     
        </div>
      </AdContainer>
     
      </div>
    </div>
  );
}