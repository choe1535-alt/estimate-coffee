import { createBrowserRouter, Navigate } from "react-router-dom";
import EditorPage from "@/pages/EditorPage";

export const router = createBrowserRouter(
  [
    { path: "/", element: <EditorPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
