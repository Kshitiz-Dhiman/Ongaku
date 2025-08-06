import axios from "axios";
import { openDB } from "idb";

export const initDB = async () => {
    return openDB('song-db', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('liked')) {
                db.createObjectStore('liked', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('audio-files')) {
                db.createObjectStore('audio-files', { keyPath: 'id' });
            }
        }
    });
}

export const addAudio = async (id, audio) => {
    const db = await initDB();

    try {
        const response = await axios.get(audio.download_urls[4].link, {
            responseType: 'blob',
            headers: {
                'Accept': 'audio/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000,
            validateStatus: (status) => status === 200
        });

        if (response.status !== 200) {
            throw new Error(`Failed to fetch audio from ${audio.download_url[4].link}`);
        }

        const audioBlob = response.data;

        if (!audioBlob.type.startsWith('audio/') && !audioBlob.type.includes('octet-stream')) {
            // If it's not an audio type, it might be an error page or redirect
            throw new Error(`Invalid audio format received: ${audioBlob.type}. Expected audio/* but got ${audioBlob.type}`);
        }

        if (audioBlob.size < 1000) {
            throw new Error(`Audio file too small: ${audioBlob.size} bytes. This might be an error response.`);
        }

        if (audioBlob.type === 'text/html' || audioBlob.type === 'text/plain') {
            const text = await audioBlob.text();
            if (text.toLowerCase().includes('<html') || text.toLowerCase().includes('<!doctype')) {
                throw new Error('Received HTML page instead of audio file. The download URL might be invalid or require authentication.');
            }
        }

        audio.images.large = audio.images.large.replace("150x150", "500x500");
        const audioMetadata = {
            id,
            title: audio.title,
            artists: audio.artists.primary,
            album: audio.album,
            duration: audio.duration,
            image: audio.images,
            added_at: new Date().toISOString(),
            download_urls: audio.download_urls,
            blob_type: audioBlob.type,
            blob_size: audioBlob.size
        };
        const audioFile = {
            id,
            blob: audioBlob,
            type: audioBlob.type,
            size: audioBlob.size
        };

        const tx = db.transaction(['liked', 'audio-files'], 'readwrite');
        console.log('Storing audio metadata:', audioMetadata);

        await Promise.all([
            tx.objectStore('liked').put(audioMetadata),
            tx.objectStore('audio-files').put(audioFile),
            tx.done
        ]);

        return { success: true, id, size: audioBlob.size, type: audioBlob.type };
    } catch (error) {
        console.error('Error adding audio:', error);
        throw new Error(`Failed to add audio: ${error.message}`);
    }
}

export const getAudio = async (id) => {
    const db = await initDB();

    try {
        const [metadata, audioFile] = await Promise.all([
            db.get('liked', id),
            db.get('audio-files', id)
        ]);

        if (!metadata || !audioFile) {
            throw new Error(`Audio with id ${id} not found`);
        }

        return {
            ...metadata,
            audioBlob: audioFile.blob,
            audioUrl: URL.createObjectURL(audioFile.blob)
        };

    } catch (error) {
        console.error('Error getting audio:', error);
        throw error;
    }
}

export const getAllLiked = async () => {
    const db = await initDB();

    try {
        const metadata = await db.getAll('liked');
        return metadata.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));

    } catch (error) {
        console.error('Error getting all liked songs:', error);
        throw new Error('Failed to retrieve liked songs');
    }
}

export const deleteAudio = async (id) => {
    const db = await initDB();

    try {
        const tx = db.transaction(['liked', 'audio-files'], 'readwrite');

        await Promise.all([
            tx.objectStore('liked').delete(id),
            tx.objectStore('audio-files').delete(id),
            tx.done
        ]);

        return { success: true, id };

    } catch (error) {
        console.error('Error deleting audio:', error);
        throw new Error(`Failed to delete audio: ${error.message}`);
    }
}

export const getAudioWithBlob = async (id) => {
    const db = await initDB();

    try {
        const [metadata, audioFile] = await Promise.all([
            db.get('liked', id),
            db.get('audio-files', id)
        ]);

        if (!metadata || !audioFile) {
            throw new Error(`Audio with id ${id} not found`);
        }
        return {
            ...metadata,
            blob: audioFile.blob,
            url: URL.createObjectURL(audioFile.blob)
        };

    } catch (error) {
        console.error('Error getting audio with blob:', error);
        throw error;
    }
}

export const isAudioCached = async (id) => {
    const db = await initDB();

    try {
        const metadata = await db.get('liked', id);
        return !!metadata;

    } catch (error) {
        console.error('Error checking if audio is cached:', error);
        return false;
    }
}

export const getStorageUsage = async () => {
    const db = await initDB();

    try {
        const audioFiles = await db.getAll('audio-files');
        const totalSize = audioFiles.reduce((sum, file) => sum + (file.size || 0), 0);

        return {
            totalFiles: audioFiles.length,
            totalSize: totalSize,
            formattedSize: formatBytes(totalSize)
        };

    } catch (error) {
        console.error('Error getting storage usage:', error);
        return { totalFiles: 0, totalSize: 0, formattedSize: '0 B' };
    }
}

export const clearAllData = async () => {
    const db = await initDB();

    try {
        const tx = db.transaction(['liked', 'audio-files'], 'readwrite');

        await Promise.all([
            tx.objectStore('liked').clear(),
            tx.objectStore('audio-files').clear(),
            tx.done
        ]);

        return { success: true };

    } catch (error) {
        console.error('Error clearing all data:', error);
        throw new Error('Failed to clear data');
    }
}

export const exportPlaylist = async () => {
    const db = await initDB();

    try {
        const liked = await db.getAll('liked');
        const exportData = {
            exported_at: new Date().toISOString(),
            version: '1.0',
            songs: liked.map(song => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album,
                duration: song.duration,
                added_at: song.added_at,
                original_url: song.original_url
            }))
        };

        return JSON.stringify(exportData, null, 2);

    } catch (error) {
        console.error('Error exporting playlist:', error);
        throw new Error('Failed to export playlist');
    }
}

export const searchOfflineMusic = async (query) => {
    const db = await initDB();

    try {
        const allSongs = await db.getAll('liked');
        const searchTerm = query.toLowerCase();

        return allSongs.filter(song =>
            song.title?.toLowerCase().includes(searchTerm) ||
            song.artist?.toLowerCase().includes(searchTerm) ||
            song.album?.toLowerCase().includes(searchTerm)
        );

    } catch (error) {
        console.error('Error searching offline music:', error);
        throw new Error('Failed to search offline music');
    }
}

export const updateAudioMetadata = async (id, updates) => {
    const db = await initDB();

    try {
        const existing = await db.get('liked', id);
        if (!existing) {
            throw new Error(`Audio with id ${id} not found`);
        }

        const updated = { ...existing, ...updates };
        await db.put('liked', updated);

        return updated;

    } catch (error) {
        console.error('Error updating audio metadata:', error);
        throw error;
    }
}

// Utility function to format bytes
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Cleanup function to revoke object URLs (call when component unmounts)
export const cleanupObjectURL = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}
