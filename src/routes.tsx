import { createBrowserRouter } from "react-router-dom";
import Hello from "./pages/hello/Hello.tsx";
import {Albums} from "./pages/albums/Albums.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Hello />,
    },
    {
        path: "/albums",
        element: <Albums />,
    },
]);
