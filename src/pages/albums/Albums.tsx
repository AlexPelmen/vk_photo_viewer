import {useEffect, useRef, useState} from "react";
import VkService, {type VkAlbum} from "../../services/Vk";
import localStorage from "../../services/LocalStorage";
import classes from "./album.module.css";

const LIMIT = 21;

const vk = new VkService(
    localStorage.getToken(),
    localStorage.getGroupId()
);

export const Albums = () => {
    const [albums, setAlbums] = useState<VkAlbum[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);
    const loaderRef = useRef<HTMLInputElement>(null);
    const lockRequestRef = useRef(false);

    const lockRequest = (value: boolean) => {
        lockRequestRef.current = value;
        setLoading(value);
    }

    // кладем метод loadAlbums внутрь useRef, так как он не будет изменяться в течение
    // времени жизни компонента
    const loadAlbums = useRef(() => {
        if (lockRequestRef.current) return

        lockRequest(true)

        vk.getAlbums(LIMIT, offsetRef.current).then(newAlbums => {
            setAlbums(prev => [...prev, ...newAlbums]);
            offsetRef.current += LIMIT;
            if (newAlbums.length < LIMIT) {
                setHasMore(false);
            }
        })
            .catch(e => setError(String(e)))
            .finally(() => lockRequest(false));
    });

    useEffect(() => {
        loadAlbums.current()
    }, []);

    // Infinite scroll
    useEffect(() => {
        if (!loaderRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadAlbums.current()
            },
            {rootMargin: "200px"}
        );
        observer.observe(loaderRef.current);

        return () => observer.disconnect();
    }, [loading, hasMore, loadAlbums]);

    if (error) {
        return <div className={classes.error}>Error: {error}</div>;
    }

    return (
        <>
            <div className={classes.albumGrid}>
                {albums.map(album => (
                    <div key={album.id} className={classes.albumImageWrapper}>
                        <img
                            src={vk.getAlbumThumb(album)}
                            alt={album.title}
                            className={classes.albumImage}
                            loading="lazy"
                        />
                        <div className={classes.albumTitle}>
                            {album.title}
                        </div>
                    </div>
                ))}
            </div>

            {loading && <div className={classes.loading}>Loading…</div>}
            {hasMore && <div ref={loaderRef} className={classes.loader}/>}
        </>
    );
};
