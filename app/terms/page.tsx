"use client";
import React from "react";
import styles from './terms.module.css';

export default function TermsPage() {
  return (
    <div className={styles.termsPage}>
      <header className={styles.header}>
        <h1>Terms of Use</h1>
      </header>
      <div className={styles.content}>
        <div className={styles.description}>
          <ol className={styles.termsList}>
            <li>
              <strong>Onboarding and Account Creation</strong>
              <ul className={styles.subList}>
                <li>Provide accurate, complete, and current information to create your account.</li>
                <li>Maintain the confidentiality of your account; notify us within 24 hours of any unauthorized use.</li>
                <li>You grant us a non-exclusive, royalty-free license to use your name, trademarks, and logos for display, marketing, and promotional purposes.</li>
                <li>We may monitor your use of the Services and compliance with these Terms.</li>
              </ul>
            </li>
            <li>
              <strong>Service Use</strong>
              <ul className={styles.subList}>
                <li>The Seller or Vendor uses Mateng for delivery and reverse pickup (RTO) of packages.</li>
              </ul>
            </li>
            <li>
              <strong>Non-Delivery and Returns</strong>
              <ul className={styles.subList}>
                <li>RTO charges are deducted for non-delivered packages.</li>
              </ul>
            </li>
            <li>
              <strong>Package Information</strong>
              <ul className={styles.subList}>
                <li>Provide complete package information; delivery charges are calculated based on this information.</li>
                <li>Weight discrepancies are adjusted within 72 hours of package upload, resulting in refunds or deductions.</li>
              </ul>
            </li>
            <li>
              <strong>Final Invoice</strong>
              <ul className={styles.subList}>
                <li>A final invoice is generated monthly, serving as the basis for all reconciliations and refunds.</li>
              </ul>
            </li>
            <li>
              <strong>Charges and Taxes</strong>
              <ul className={styles.subList}>
                <li>Deductions include Delivery/Return Charges, COD Charges, Service Tax, and Fuel Surcharge. Entry Tax and OCTROI are manually deducted.</li>
              </ul>
            </li>
            <li>
              <strong>Refunds and Cancellations</strong>
              <ul className={styles.subList}>
                <li>Lost Packages: Delivery/RTO Charges are refunded for lost packages.</li>
                <li>Service Termination: Remaining credits can be refunded upon service termination.</li>
                <li>Non-Delivery: COD Charges are refunded for non-delivery packages.</li>
              </ul>
            </li>
            <li>
              <strong>Representations and Warranties; Indemnity</strong>
              <ul className={styles.subList}>
                <li>Comply with all applicable laws while using the Services.</li>
                <li>Do not use automated systems, reverse engineer, or tamper with the Services.</li>
                <li>Indemnify and hold Mateng harmless from any claims, damages, or expenses arising from your use of the Services, violation of these Terms, or infringement of third-party rights.</li>
              </ul>
            </li>
            <li>
              <strong>Prohibited Activities</strong>
              <ul className={styles.subList}>
                <li>Do not use fraudulent means to access the Services or engage in disruptive or harmful behavior.</li>
                <li>Mateng reserves the right to take legal action for any violations of these Terms.</li>
              </ul>
            </li>
            <li>
              <strong>Disclaimer</strong>
              <ul className={styles.subList}>
                <li>Services are provided (as is) without warranties of any kind.</li>
                <li>Mateng is not responsible for incorrect delivery information or non-delivery. Relevant charges apply with no refund.</li>
              </ul>
            </li>
            <li>
              <strong>Miscellaneous</strong>
              <ul className={styles.subList}>
                <li>Mateng reserves the right to modify the Service and these Terms without notice.</li>
                <li>If any provision is deemed invalid, the remaining provisions will remain in effect.</li>
                <li>Mateng is not liable for performance failures due to force majeure events beyond its control.</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
