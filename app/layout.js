import "./globals.css";

export const metadata = {
  title: "Bingo Night",
  description: "Multiplayer 5-line bingo — one card per player.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
