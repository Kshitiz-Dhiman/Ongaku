import { openDB } from "idb";

export const initDB = async () => {
    return openDB('song-db', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('liked')) {
                db.createObjectStore('liked', { keyPath: 'id' });
            }
        }
    })
}

export const addAudio = async (id, audio) => {
    const db = await initDB();
    return db.put('liked', { id, audio });
}

export const getAudio = async (id) => {
    const db = await initDB();
    const entry = await db.get('liked', id);
    if (!entry) {
        throw new Error(`Audio with id ${id} not found`);
    }
    return entry;
}

export const getAllliked = async () => {
    const db = await initDB();
    return db.getAll('liked');
}

export const deleteAudio = async (id) => {
    const db = await initDB();
    return db.delete('liked', id);
}
