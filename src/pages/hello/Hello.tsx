import classes from "./Hello.module.css"
import {useState} from "react";
import Eslint from "../../utils/eslint.ts";
import LocalStorage from "../../services/LocalStorage.ts";
import {useNavigate} from "react-router-dom";

const Hello = () => {
    const [token, setToken] = useState<string>("")
    const [groupId, setGroupId] = useState<number>(0)
    const navigate = useNavigate();

    const onSubmit = () => {
        if (token.length && groupId) {
            LocalStorage.setToken(token)
            LocalStorage.setGroupID(groupId)
            navigate("/albums")
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

    </div>
}

export default Hello;