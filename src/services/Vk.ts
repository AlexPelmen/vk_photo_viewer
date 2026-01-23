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
    thumb_src?: string;
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
    private readonly apiUrl = 'https://api.vk.com/method';
    private readonly version = '5.199';

    constructor(token: string, groupId: number) {
        this.token = token;

        // группа в VK = отрицательный owner_id
        this.ownerId = -Math.abs(groupId);
    }

    private async call<T>(method: string, params: Record<string, string | number | boolean>): Promise<T[]> {
        const url =
            `${this.apiUrl}/${method}?` +
            new URLSearchParams({
                access_token: this.token,
                v: this.version,
                ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
            });

        const res = await fetch(url);
        const data: VkResponse<T> = await res.json();

        if (data.error) {
            throw new Error(data.error.error_msg);
        }

        return data.response.items;
    }

    /** 📂 Получить альбомы группы */
    async getAlbums(): Promise<VkAlbum[]> {
        return this.call<VkAlbum>('photos.getAlbums', {
            owner_id: this.ownerId,
        });
    }

    /** 🖼 Получить фотки из альбома */
    async getPhotos(albumId: number): Promise<VkPhoto[]> {
        return this.call<VkPhoto>('photos.get', {
            owner_id: this.ownerId,
            album_id: albumId,
            photo_sizes: true,
        });
    }

    /** 🔍 Вернуть самый большой размер фотки */
    getLargestPhotoUrl(photo: VkPhoto): string {
        const sorted = [...photo.sizes].sort((a, b) => b.width - a.width);
        return sorted[0].url;
    }
}

export default VkService;