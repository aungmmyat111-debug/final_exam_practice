export const metadata = {
    title: 'Library Management System',
    description: 'Web App Final Exam Prep',
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }