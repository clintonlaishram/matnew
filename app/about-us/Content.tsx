"use client";
import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import styles from './about.module.css';
import Image from "next/image";
import Link from 'next/link';

const companyJourney = [
  {
    year: 2022,
    text: "Mateng was established in late 2022 with a vision to simplify local delivery services in Imphal, Manipur.",
  },
  {
    year: 2023,
    text: "We launched our platform to integrate communication, task management, and shopping for a seamless customer experience.",
  },
  {
    year: 2024,
    text: "Expanded our services to include partnerships with local businesses, ensuring faster and more efficient deliveries.",
  },
];

export function MatengContent() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % companyJourney.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerDescription}>
          <h1>What do We do?</h1>
        </div>
        <div className={styles.bannerDescription}>
          <p>
            Mateng is your go-to platform for discovering the unknown and
            meeting your product/service needs. Our reliable and free discovery
            platform aims to quickly grow businesses from scratch. With our
            integrated Mateng Delivery Service, we provide SMEs with seamless
            shipping solutions. Experience a swift and efficient way to know
            everything and get what you need, all in one place.
          </p>
        </div>
      </div>

      {/* Image Component with width and height */}
      <Image 
        src="/discover.jpg" 
        alt="mateng at work" 
        className={styles.heroImage} 
        width={800}  // Set the width (adjust as needed)
        height={600} // Set the height (adjust as needed)
      />

      <div className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>Our Journey</h2>
        <div className={styles.timeline}>
          {companyJourney.map((journey, index) => (
            <div
              key={index}
              className={`${styles.timelineItem} ${index === activeIndex ? styles.active : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              <h3>{journey.year}</h3>
              <p>{journey.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.socialSection}>
        <p>Learn more about our impactful work at Mateng.</p>
        <div className={styles.socialIcons}>
          <a href="https://www.facebook.com/matenggroup" target="_blank" rel="noopener noreferrer">
            <FaFacebook className={styles.icon} />
          </a>
          <a href="https://www.instagram.com/mateng.discovery/" target="_blank" rel="noopener noreferrer">
            <FaInstagram className={styles.icon} />
          </a>
          <a href="https://www.linkedin.com/company/99410943/admin/dashboard/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className={styles.icon} />
          </a>
          <a href="https://www.youtube.com/@matengdiscovery" target="_blank" rel="noopener noreferrer">
            <FaYoutube className={styles.icon} />
          </a>
        </div><br />
        <div>
        <Link href="/terms" className={styles.links}>Check Terms and Conditions here</Link>
      </div>
      </div>
    </div>
  );
}
