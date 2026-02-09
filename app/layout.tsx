import "./globals.css";
import Header from "./components/Header";
import Providers from "./providers";
import { CartProvider } from "../context/CartContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CartProvider>
            <Header />
            <main className="max-w-7xl mx-auto p-6">{children}</main>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
