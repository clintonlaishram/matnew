'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import styles from './Contacts.module.css';
import { useRouter } from 'next/navigation';

type UserLinks = {
  user_id: string;
  link1: string | null;
  link2: string | null;
  link3: string | null;
};

type MessageData = {
  order_id: string;
  message: string;
  created_at: string;
  status: string;
};

export default function Contacts() {
  const [userLinks, setUserLinks] = useState<UserLinks | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [messageData, setMessageData] = useState<MessageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserLinks();
  }, []);

  const fetchUserLinks = async () => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);

    const { data, error } = await supabase
      .from('user_links')
      .select('user_id, link1, link2, link3')
      .eq('user_id', user.user_id)
      .single();

    if (error) {
      console.error('Error fetching user links:', error.message);
      return;
    }

    if (data) {
      setUserLinks(data);
    }
  };

  const handleRedirect = (link: string | null) => {
    if (link) {
      window.location.href = link;
    }
  };

  const handleSearch = async () => {
    if (!orderId) {
      setError('Order ID is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessageData(null);

    try {
      const { data, error } = await supabase
        .from('message_data')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setMessageData(data as MessageData);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonGroup}>
        <button onClick={() => router.push('/discover')} className={styles.messagesButton}>
          Discover
        </button>
        <button onClick={() => router.push('/contacts')} className={styles.messagesButton}>
          My Contacts
        </button>
        <button onClick={() => router.push('/message_data/sent_message')} className={styles.messagesButton}>
          Messages
        </button>
        <button onClick={() => router.push('/link')} className={styles.messagesCont}>
          Mateng Delivery History
        </button>
      </div>
      
      <div className={styles.searchContainer}>
        
        <h1 className={styles.header}>Search Order</h1>

        <div>
          <input
            className={styles.searchInput}
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
          />
          <button
            className={styles.searchButton}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {messageData && (
          <div className={styles.messageDetails}>
            <h2>Message Details</h2>
            <p><strong>Order ID:</strong> {messageData.order_id}</p>
            <p><strong>Message:</strong> {messageData.message}</p>
            <p><strong>Status:</strong> {messageData.status}</p>
            <p><strong>Created At:</strong> {new Date(messageData.created_at).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div>
        <h1 className={styles.header}>My Links</h1>

        {userLinks ? (
          <ul className={styles.linksList}>
            
            {userLinks.link2 && (
              <li className={styles.linkItem} key="link2">
                <button
                  className={styles.linkButton}
                  onClick={() => handleRedirect(userLinks.link2)}
                >
                  View our Instagram Page
                </button>
              </li>
            )}
            {userLinks.link3 && (
              <li className={styles.linkItem} key="link3">
                <button
                  className={styles.linkButton}
                  onClick={() => handleRedirect(userLinks.link3)}
                >
                  Go to Bank Account Upload
                </button>
              </li>
            )}
            {userLinks.link1 && (
              <li className={styles.linkItem} key="link1">
                <button
                  className={styles.linkButton}
                  onClick={() => handleRedirect(userLinks.link1)}
                >
                  View Mateng Delivery Orders
                </button>
              </li>
            )}
            <li className={styles.linkItem} key="view-orders">
              <button
                className={styles.linkButton}
                onClick={() => handleRedirect('/message_data')}
              >
                View my Orders
              </button>
            </li>
            <li className={styles.linkItem} key="search-order">
              <button
                className={styles.linkButton}
                onClick={() => handleRedirect('/search-order')}
              >
                Search Order
              </button>
            </li>
          </ul>
        ) : (
          <p className={styles.noLinksMessage}>No links found as of now. Please contact Mateng support.</p>
        )}
      </div>
    </div>
  );
}
