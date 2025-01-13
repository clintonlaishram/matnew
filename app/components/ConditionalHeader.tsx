"use client"; // Mark this as a client component

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Define paths where the Header should not be included
  const excludeHeaderPaths = ["/admin", "/admin/CreateOrder","/admin/billings","/admin/OrderData","/admin/TeamCommissions","/admin/vendor_data","/admin/VendorBills","/admin/TeamCommissions/[email]","/admin/VendorBills/[email]",];

  // Conditionally render Header
  if (excludeHeaderPaths.includes(pathname)) {
    return null;
  }

  return <Header />;
}
