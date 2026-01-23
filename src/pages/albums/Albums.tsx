import VkService, {type VkAlbum} from "../../services/Vk.ts";
import LocalStorage from "../../services/LocalStorage.ts";
import {useEffect, useState} from "react";

export const Albums = () => {
    const [albums, setAlbums] = useState<VkAlbum[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = LocalStorage.getToken()
        const groupId = LocalStorage.getGroupId()
        const vk = new VkService(token, groupId)

        vk.getAlbums().then((albums) => {
            setAlbums(albums);
            setLoading(false)
        }).catch((e: Error) => {
            setError(String(e))
            setLoading(true)
        })
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error.length > 0) {
        return <div>Error: {error}</div>;
    }

    if (!albums.length) {
        return <div>No albums found.</div>;
    }

    return (
        <div>
            {
                albums.map((album) => {
                    return (
                        <div>{album.title}</div>
                    )
                })
            }
        </div>
    );
};