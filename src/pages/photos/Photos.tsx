import { useEffect, useRef } from "react";
import {useNavigate, useParams} from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";

import VkService, { type VkPhoto } from "../../services/Vk";
import localStorage from "../../services/LocalStorage";
import classes from "./photos.module.css";
import {BackButton} from "../../components/back-button/BackButton.tsx";

const LIMIT = 21;

const vk = new VkService(
    localStorage.getToken(),
    localStorage.getGroupId()
);

export const Photos = () => {
    const { albumId } = useParams<{ albumId: string }>();
    const loaderRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const numericAlbumId = Number(albumId);

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
        queryKey: ["vk-photos", numericAlbumId],
        queryFn: ({ pageParam = 0 }) =>
            vk.getPhotos(numericAlbumId, LIMIT, pageParam as number),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length < LIMIT ? undefined : allPages.length * LIMIT;
        },
        staleTime: 1000 * 60 * 10,
    });

    // Универсальный слушатель скролла
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { rootMargin: "400px" } // Для фото можно взять отступ побольше, чтобы юзер не видел лоадеров
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (status === "pending") return <div className={classes.loading}>Загрузка фото...</div>;
    if (status === "error") return <div className={classes.error}>Ошибка: {error.message}</div>;


    return (
        <>
            <BackButton onClick={() => navigate("/albums")}/>
            <div className={classes.albumGrid}>
                {data.pages.map((group, i) => (
                    <div key={i} style={{ display: 'contents' }}>
                        {group.map((photo: VkPhoto) => (
                            <div
                                key={photo.id}
                                className={classes.albumImageWrapper}
                                onClick={() => navigate(`/albums/${albumId}/${photo.id}`)}
                            >
                                <img
                                    src={vk.getPhotoThumb(photo)}
                                    alt={photo.id.toString()}
                                    className={classes.albumImage}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Индикация подгрузки новых рядов */}
            {(isFetchingNextPage) && <div className={classes.loading}>Догружаем...</div>}

            {/* Точка активации запроса */}
            {hasNextPage && <div ref={loaderRef} style={{ height: '20px' }} />}
        </>
    );
};
