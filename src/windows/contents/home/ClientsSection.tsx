import styles from './ClientsSection.module.scss';
import { ClientLogosMarquee } from './ClientLogosMarquee';
import { PixelSilhouette } from '@/effects/PixelSilhouette';
import { CLIENT_LOGOS } from '@/content/clients';

export function ClientsSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.headline}>
        We don&apos;t keep quiet.
        <br />
        We keep clients.
      </h2>
      <div className={styles.mouth}>
        <PixelSilhouette src="/images/home/figma/mouth.png" color="#00F2FF" />
      </div>
      <div className={styles.marquee}>
        <ClientLogosMarquee logos={CLIENT_LOGOS} />
      </div>
    </section>
  );
}
