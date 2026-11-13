import './globals.css';

export const metadata = {
  title: 'Yuvlex',
  description: 'Yuvlex turns one advising sheet into individual emails — nothing is ever stored.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
