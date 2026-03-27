import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { AppWrapper } from "@/components/layout/AppWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ADP Ministério Comunhão e Plenitude",
  description: "CRM para gestão de membros, departamentos e igrejas da ADPMCP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
