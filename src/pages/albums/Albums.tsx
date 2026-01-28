import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";

import VkService, { type VkAlbum } from "../../services/Vk";
import localStorage from "../../services/LocalStorage";
import classes from "./album.module.css";

const LIMIT = 21;

// Инстанс сервиса лучше выносить за пределы компонента или мемоизировать
const vk = new VkService(
    localStorage.getToken(),
    localStorage.getGroupId()
);

export const Albums = () => {
    const navigate = useNavigate();
    const loaderRef = useRef<HTMLDivElement>(null);

    vk.setToken(localStorage.getToken());
    vk.setOwnerId(localStorage.getGroupId());

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["vk-albums"],
        queryFn: ({ pageParam = 0 }) => vk.getAlbums(LIMIT, pageParam as number),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length < LIMIT ? undefined : allPages.length * LIMIT;
        },
        // Данные будут храниться в кеше 5 минут, не требуя перезапроса при возврате на страницу
        staleTime: 1000 * 60 * 5,
    });

    // Infinite Scroll через Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
            },
            { rootMargin: "200px" }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (status === "pending") return <div className={classes.loading}>Загрузка...</div>;
    if (status === "error") return <div className={classes.error}>Ошибка: {error.message}</div>;

    const onAlbumClick = (albumId: number) => navigate(`${albumId}`);

    return (
        <>
            <div className={classes.albumGrid}>
                {data.pages.map((group, i) => (
                    <div key={i} style={{ display: 'contents' }}>
                        {group.map((album: VkAlbum) => (
                            <div
                                key={album.id}
                                className={classes.albumImageWrapper}
                                onClick={() => onAlbumClick(album.id)}
                            >
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
                ))}
            </div>

            {/* Спиннер при подгрузке новых страниц */}
            {isFetchingNextPage && <div className={classes.loading}>Загрузка новых альбомов...</div>}

            {/* Невидимый элемент-триггер для infinite scroll */}
            {hasNextPage && <div ref={loaderRef} style={{ height: '10px' }} />}
        </>
    );
};
