import {createBrowserRouter, Navigate} from "react-router-dom";
import Hello from "./pages/hello/Hello.tsx";
import {Albums} from "./pages/albums/Albums.tsx";
import {Header} from "./components/header/Header.tsx";
import {Photos} from "./pages/photos/Photos.tsx";

export const unauthedRoutes = createBrowserRouter([
    {
        path: "/",
        element: <Hello/>,
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
])

export const getAuthedRoutes = (logout: () => void) => createBrowserRouter([
    {
        path: "/",
        element: <Header logout={logout} />, // Здесь ОБЯЗАТЕЛЬНО должен быть <Outlet />
        children: [
            {
                // Это сделает /albums страницей по умолчанию при заходе на "/"
                index: true,
                element: <Navigate to="/albums" replace />,
            },
            {
                path: "albums",
                element: <Albums />,
            },
            {
                path: "albums/:albumId",
                element: <Photos />,
            },
            // {
            //     // Обработка всех остальных путей внутри Header
            //     path: "*",
            //     element: <Navigate to="/albums" replace />,
            // },
        ],
    },
]);

