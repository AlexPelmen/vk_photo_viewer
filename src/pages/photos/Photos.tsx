import {useEffect, useRef, useState} from "react";
import VkService, {type VkPhoto} from "../../services/Vk";
import localStorage from "../../services/LocalStorage";
import classes from "./photos.module.css";
import {useParams} from "react-router-dom";

const LIMIT = 21;

const vk = new VkService(
    localStorage.getToken(),
    localStorage.getGroupId()
);

export const Photos = () => {
    const [photos, setPhotos] = useState<VkPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const offsetRef = useRef(0);
    const loaderRef = useRef<HTMLInputElement>(null);
    const lockRequestRef = useRef(false);

    const albumId = Number(useParams().albumId);

    const lockRequest = (value: boolean) => {
        lockRequestRef.current = value;
        setLoading(value);
    }

    const loadPhotos = useRef(() => {
        if (lockRequestRef.current) return

        lockRequest(true)

        vk.getPhotos(albumId, LIMIT, offsetRef.current).then(newPhotos => {
            setPhotos(prev => [...prev, ...newPhotos]);
            offsetRef.current += LIMIT;
            if (newPhotos.length < LIMIT) {
                setHasMore(false);
            }
        })
            .catch(e => setError(String(e)))
            .finally(() => lockRequest(false));
    });

    useEffect(() => {
        loadPhotos.current()
    }, []);

    // Infinite scroll
    useEffect(() => {
        if (!loaderRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadPhotos.current()
            },
            {rootMargin: "200px"}
        );
        observer.observe(loaderRef.current);

        return () => observer.disconnect();
    }, [loading, hasMore, loadPhotos]);

    if (error) {
        return  <div className={classes.error}>Error: {error}</div>
    }

    return (
        <>
            <div className={classes.albumGrid}>
                {photos.map(photo => (
                    <div key={photo.id} className={classes.albumImageWrapper}>
                        <img
                            src={vk.getPhotoThumb(photo)}
                            alt={photo.id.toString()}
                            className={classes.albumImage}
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>

            {loading && <div className={classes.loading}>Loading…</div>}
            {hasMore && <div ref={loaderRef} className={classes.loader}/>}
        </>
    );
};
