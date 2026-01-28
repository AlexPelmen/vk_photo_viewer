import {useState} from 'react'
import {RouterProvider} from "react-router-dom";
import {getAuthedRoutes, getUnauthedRoutes} from "./routes.tsx";
import "./index.css"
import LocalStorage from "./services/LocalStorage.ts";

function App() {
    // Инициализируем состояние сразу значением из LocalStorage
    const [authed, setAuthed] = useState(() => {
        const token = LocalStorage.getToken();
        const groupId = LocalStorage.getGroupId();
        return !!(token && groupId);
    });

    const logout = () => {
        LocalStorage.setToken("")
        LocalStorage.setGroupID(0)
        setAuthed(false)
    }

    const login = (token: string, groupId: number) => {
        LocalStorage.setToken(token)
        LocalStorage.setGroupID(groupId)
        setAuthed(true)
    }

    return (
        <RouterProvider router={authed ? getAuthedRoutes(logout) : getUnauthedRoutes(login)}/>
    );
}

export default App
