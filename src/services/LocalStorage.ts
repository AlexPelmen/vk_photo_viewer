class LocalStorage {
    static setToken(token : string) {
        localStorage.setItem('token', token);
    }

    static getToken(): string {
        return localStorage.getItem('token') || "";
    }

    static setGroupID(groupId: number) {
        localStorage.setItem('group_id', String(groupId));
    }

    static getGroupId(): number {
        return Number(localStorage.getItem('group_id')) || 0;
    }
}

export default LocalStorage;