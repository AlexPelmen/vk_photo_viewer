import classes from "./Hello.module.css"
import Eslint from "../../utils/eslint.ts";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

type Props = {
    login: (token: string, groupId: number) => void
}

// todo: вынести в localstorage
const appId = `54415387`

const params = {
    client_id: appId,
    display: 'page',
    redirect_uri: 'https://dev.vk.com',
    response_type: 'token',
    revoke: "1",
    scope: 'photo',
};

const authLink = `https://oauth.vk.com${new URLSearchParams(params)}`;

const Hello = ({ login }: Props) => {
    const [token, setToken] = useState<string>("")
    const [groupId, setGroupId] = useState<number>(0)
    const navigate = useNavigate();

    const onSubmit = () => {
        if (token.length && groupId) {
            login(token, groupId)
        } else {
            console.error("wrong data")
        }
    }

    return <div className={classes.wrapper + " paper"}>
        <h1>Привет</h1>

        <h3><b>Это сервис для просмотра фотографий через ВК.</b></h3>

        <details>
            <summary className={classes.spoilerButton}>Что тут происходит?</summary>
            <p>Мы давно с друзьями храним фото в приватной группе вк. Если ты тоже так делаешь, можешь использовать эту
                страницу, чтобы быстро просматривать фото, которые хранятся в твоей приватной группе. Данные хранятся только
                на твоем устройстве, можешь не переживать.</p>

            <p>К сожалению в последнее время интерфейс вк грузится долго и требует большого количества пользовательских
                действий. Мне проще написать свой интерфейс, чем пользоваться тем, что предлагает вк.</p>
        </details>

        <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "10rem 3rem" }}>
            <button className="primary-button" onClick={() => navigate(authLink)}>Войти</button>
        </div>

        <details>
            <summary className={classes.spoilerButton}>Авторизоваться ручками</summary>
            <label className="form-line">
                <div>Токен:</div>
                <input
                    onInput={(e) => setToken(Eslint.toAny(e.target).value)}
                    placeholder="vk.token.you.get.earlier..."
                />
            </label>

            <label className="form-line">
                <div>Идентификатор сообщества:</div>
                <input
                    type="number"
                    onInput={(e) => setGroupId(Number(Eslint.toAny(e.target).value))}
                    placeholder="123"
                />
            </label>

            <br/>
            <hr />

            <div className={classes.saveBtnArea}>
                <div>Сохранить в локальное хранилище и начать работу</div>
                <br/>
                <button className="primary-button" onClick={onSubmit}>Сохранить</button>
            </div>
        </details>
    </div>
}

export default Hello;