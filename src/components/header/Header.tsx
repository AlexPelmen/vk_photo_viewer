import { Outlet, useNavigate } from "react-router-dom";
import classes from "./header.module.css";

type Props = {
    logout: () => void;
}

export const Header = ({ logout }: Props) => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1); // Переход на одну страницу назад в истории
    };

    return (
        <>
            <div className={classes.header}>
                <button name="back" onClick={goBack}>Назад</button>
                <button name="logout" onClick={logout}>logout</button>
            </div>
            <div className={classes.outlet}>
                <Outlet />
            </div>
        </>
    );
};
