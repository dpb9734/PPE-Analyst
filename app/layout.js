export const metadata = {
  title: "PPE Dashboard",
  description: "PPE Sensitivity Analysis Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
