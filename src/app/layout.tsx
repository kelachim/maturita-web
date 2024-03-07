"use client"
import "./globals.css"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);
  const swUrl = `/service-worker.js`;

  useEffect(() => {
    setMounted(true);
  }, [])

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);
  
  return (
    <html lang="en" className="h-screen hide-scrollbar bg-[#131720]">
      <body>{children}</body>
      {mounted ? <ToastContainer /> : <></>}
    </html>
  )
}
