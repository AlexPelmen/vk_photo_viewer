import classes from "./back-button.module.css"

type Props = {
    onClick: () => void;
}

export const BackButton = ({ onClick }: Props) => {
    return (
        <div className={classes.roundButton} onClick={onClick}>{"🡰"}</div>
    );
};
