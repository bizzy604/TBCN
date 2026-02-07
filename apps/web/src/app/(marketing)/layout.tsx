import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Marketing / public pages layout
 * Wraps all pages under /(marketing) with the shared Header and Footer
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
