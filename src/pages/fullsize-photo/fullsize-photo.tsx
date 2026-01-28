import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import VkService from "../../services/Vk";
import localStorage from "../../services/LocalStorage";
import classes from "./fullsize-photo.module.css";

const LIMIT = 21;
const vk = new VkService(localStorage.getToken(), localStorage.getGroupId());

export const FullsizePhoto = () => {
    const { photoId: photoIdStr, albumId: albumIdStr } = useParams();
    const photoId = Number(photoIdStr);
    const albumId = Number(albumIdStr);
    const navigate = useNavigate();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["vk-photos", albumId],
        queryFn: ({ pageParam = 0 }) => vk.getPhotos(albumId, LIMIT, pageParam as number),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length < LIMIT ? undefined : allPages.length * LIMIT,
        staleTime: 1000 * 60 * 10,
    });

    const allPhotos = data?.pages.flat() ?? [];
    const currentIndex = allPhotos.findIndex(p => p.id === photoId);

    // Подгрузка при приближении к концу списка
    useEffect(() => {
        if (currentIndex !== -1 && currentIndex >= allPhotos.length - 5 && hasNextPage) {
            fetchNextPage();
        }
    }, [currentIndex, allPhotos.length, hasNextPage, fetchNextPage]);

    if (status === "pending") return <div className={classes.loading}>Загрузка...</div>;
    if (status === "error") return <div className={classes.error}>Ошибка: {error.message}</div>;

    // Преобразуем фото VK в формат слайдов
    const slides = allPhotos.map(photo => ({
        src: vk.getLargestPhotoUrl(photo),
        // Дополнительно можно прокинуть srcset из photo.sizes для адаптивности
    }));

    return (
        <Lightbox
            open={true}
            index={currentIndex}
            close={() => navigate(`/albums/${albumId}`)} // Возврат в альбом
            slides={slides}
            // Синхронизируем состояние Lightbox с URL
            on={{
                view: ({ index }) => {
                    const nextPhoto = allPhotos[index];
                    if (nextPhoto && nextPhoto.id !== photoId) {
                        navigate(`/albums/${albumId}/${nextPhoto.id}`, { replace: true });
                    }
                }
            }}
            // Оставляем только нужные анимации
            animation={{ fade: 300, swipe: 500 }}
            // Настройки контроллера
            controller={{ closeOnBackdropClick: true }}
        />
    );
};
