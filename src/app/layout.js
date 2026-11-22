import "./globals.css"

export const metadata = {
  title: 'AI Chat App',
  description: 'A modular AI chat web application',
  verification:{
    google:'HiXTD2AqMpoNrNhzxeYs2jSPxKMrFPw7KtWigYgBpLY'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>
        {children}
      </body>
    </html>
  );
}