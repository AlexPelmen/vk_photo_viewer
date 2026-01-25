export interface VkPhotoSize {
    url: string;
    width: number;
    height: number;
    type: string;
}

export interface VkAlbum {
    id: number;
    title: string;
    size: number;
    thumb_id?: number;
    thumb_src?: string; // Появится благодаря need_covers
    sizes?: VkPhotoSize[]; // Расширенная информация об обложке
}

export interface VkPhoto {
    id: number;
    album_id: number;
    owner_id: number;
    date: number;
    text: string;
    sizes: VkPhotoSize[];
}

interface VkResponse<T> {
    response: {
        count?: number;
        items: T[];
    };
    error?: {
        error_code: number;
        error_msg: string;
    };
}

class VkService {
    private readonly token: string;
    private readonly ownerId: number;
    private readonly apiUrl = 'https://api.vk.com';
    private readonly version = '5.199';

    constructor(token: string, groupId: number) {
        this.token = token;
        this.ownerId = -Math.abs(groupId);
    }

    private async call<T>(method: string, params: Record<string, string | number | boolean>): Promise<T[]> {
        // Формируем полный URL правильно: apiUrl + / + method
        const url = `${this.apiUrl}/method/${method}?` + new URLSearchParams({
            access_token: this.token,
            v: this.version,
            ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
        });

        const res = await fetch(url);

        // Fetch не выбрасывает ошибку на 404, проверяем вручную
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
        }

        const data: VkResponse<T> = await res.json();

        if (data.error) {
            throw new Error(data.error.error_msg);
        }

        return data.response.items;
    }

    /** 📂 Получить альбомы с пагинацией и обложками */
    async getAlbums(limit: number = 21, offset: number = 0): Promise<VkAlbum[]> {
        return this.call<VkAlbum>('photos.getAlbums', {
            owner_id: this.ownerId,
            need_covers: 1,  // Чтобы получить thumb_src
            photo_sizes: 1,  // Чтобы получить массив sizes
            count: limit,
            offset: offset,
        });
    }

    /** 🖼 Получить фотки из альбома */
    async getPhotos(albumId: number, limit: number = 50, offset: number = 0): Promise<VkPhoto[]> {
        return this.call<VkPhoto>('photos.get', {
            owner_id: this.ownerId,
            album_id: albumId,
            photo_sizes: 1,
            count: limit,
            offset: offset
        });
    }

    /** 🔍 Хелпер: достать ссылку на обложку альбома */
    getAlbumThumb(album: VkAlbum): string {
        if (album.sizes && album.sizes.length > 0) {
            return [...album.sizes]
                .sort((a, b) => a.width - b.width)
                .find(s => s.width > 250)?.url ?? ""
        }
        return album.thumb_src || '';
    }

    /** 🔍 Хелпер: достать ссылку на обложку фото */
    getPhotoThumb(photo: VkPhoto): string {
        if (photo.sizes && photo.sizes.length > 0) {
            return [...photo.sizes]
                .sort((a, b) => a.width - b.width)
                .find(s => s.width > 250)?.url ?? ""
        }
        return '';
    }

    /** 🔍 Вернуть самый большой размер фотки */
    getLargestPhotoUrl(photo: VkPhoto): string {
        const sorted = [...photo.sizes].sort((a, b) => b.width - a.width);
        return sorted[0].url;
    }
}

export default VkService;