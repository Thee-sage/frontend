import { Game } from "./Game";
import styles from "./Gamepage.module.css";
import { StandardAdCard } from '../components/minorcomponents/StandardAdCard/StandardAdCard';
import { SidebarAdCard } from '../components/minorcomponents/SidebarAdCard/SidebarAdCard';
import { RotatingMainContentAds } from '../components/minorcomponents/RotatingMainContentAds/RotatingMainContentAds';
import { AdContainer } from '../components/minorcomponents/AdContainer/AdContainer';

export function GamePage() {
  return (
    <div className={styles.pageContainer}>
      <AdContainer
        renderAds={({ headerAds, sidebarAds, mainContentAds, footerAds }) => (
          <>
            <div className={styles.headerAds}>
              {headerAds.map((ad) => (
                <StandardAdCard key={ad._id} ad={ad} />
              ))}
            </div>

            <div className={styles.sideContent}>
              <div className={styles.leftSidebar}>
                {sidebarAds
                  .filter((_, index) => index % 2 === 0)
                  .map((ad) => (
                    <SidebarAdCard key={ad._id} ad={ad} />
                ))}
              </div>

              <div className={styles.mainContentAds}>
                <RotatingMainContentAds ads={mainContentAds} />
              </div>

              <div className={styles.rightSidebar}>
                {sidebarAds
                  .filter((_, index) => index % 2 === 1)
                  .map((ad) => (
                    <SidebarAdCard key={ad._id} ad={ad} />
                ))}
              </div>
            </div>

            <div className={styles.footerAds}>
              {footerAds.map((ad) => (
                <StandardAdCard key={ad._id} ad={ad} />
              ))}
            </div>
          </>
        )}
      >
        <div className={styles.gameWrapper}>
          <Game />
        </div>
      </AdContainer>
    </div>
  );
}