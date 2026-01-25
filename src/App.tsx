import {StrictMode, useState} from 'react'
import {RouterProvider} from "react-router-dom";
import {unauthedRoutes, getAuthedRoutes} from "./routes.tsx";
import "./index.css"
import LocalStorage from "./services/LocalStorage.ts";

function App() {

    const [authed, setAuthed] = useState(false);

    const logout = () => {
        LocalStorage.setToken("")
        LocalStorage.setGroupID(0)
        setAuthed(false)
    }

    return (
        <StrictMode>
            <RouterProvider router={authed ? unauthedRoutes : getAuthedRoutes(logout)} />
        </StrictMode>
    );
}

export default App
