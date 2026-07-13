import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';
import { Toaster } from 'sonner';
import ReactQueryProvider from '../utils/providers/ReactQueryProvider';
import StoreHydrator from '@/components/auth/StoreHydrator';
import FirebaseMessagingProvider from '@/components/firebase/FirebaseMessagingProvider';
export async function generateMetadata() {
  return {
    title: 'Aakdi',
    description: 'Aakdi',
    keywords: 'Aakdi',
    openGraph: {
      title: 'Aakdi',
      description: 'Aakdi',
      url: 'https://aqdi.sa',
      siteName: 'Aakdi',
      images: [
        {
          url: 'https://aqdi.sa/website/asset/images/logo.svg',
          width: 1200,
          height: 630,
          alt: 'Aakdi',
        },
      ],
      type: 'website',
      locale: 'ar_SA',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning={true}>
        <ReactQueryProvider>
          <StoreHydrator />
          <FirebaseMessagingProvider />
          {children}
          <Toaster
            position="top-center"
            dir="rtl"
            richColors
            closeButton
            expand
            visibleToasts={4}
            toastOptions={{
              className: "font-[Alexandria]",
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
