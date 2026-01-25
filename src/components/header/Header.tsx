import { Outlet } from "react-router-dom";
import classes from "./header.module.css";

type Props = {
    logout: () => void;
}

export const Header = ({logout}: Props) => {
    return (
        <>
            <div className={classes.header}>
                <button name="logout" onClick={logout}>logout</button>
            </div>
            <Outlet />
        </>
    );
};
