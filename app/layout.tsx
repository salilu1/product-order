import "./globals.css";
import Header from "./components/Header";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="max-w-7xl mx-auto p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
