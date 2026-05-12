import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "@/app/AppShell";

export const router = createBrowserRouter(
  [
    { path: "/", element: <AppShell /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
