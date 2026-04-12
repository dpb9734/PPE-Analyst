import React from "react";

export const metadata = {
  title: "PPE Dashboard",
  description: "PPE Sensitivity Analysis Tool"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
