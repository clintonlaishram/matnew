import '../styles/globals.css';
import { ReactNode } from 'react';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { TeamAuthProvider } from './context/TeamAuthContext';
import { CartProvider } from './business/context/CartContext';
import ConditionalHeader from './components/ConditionalHeader';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-black-gradient text-white">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <TeamAuthProvider>
            <CartProvider>
              <ConditionalHeader />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </TeamAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
