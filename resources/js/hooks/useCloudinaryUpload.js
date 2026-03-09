/**
 * useCloudinaryUpload
 *
 * Uploads a file directly from the browser to Cloudinary using an
 * unsigned upload preset. No server-side code, no signature needed.
 *
 * Usage:
 *   const { upload, uploading, error } = useCloudinaryUpload();
 *   const url = await upload(file, 'bethel_app/payments');
 *
 * Set in .env:
 *   VITE_CLOUDINARY_CLOUD_NAME=dryoiccyd
 *   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
 */

import { useState, useCallback } from 'react';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function useCloudinaryUpload() {
    const [uploading, setUploading] = useState(false);
    const [error,     setError]     = useState(null);

    const upload = useCallback(async (file, folder = 'bethel_app') => {
        if (!file) throw new Error('No file provided.');

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            throw new Error(
                'Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET in .env'
            );
        }

        setUploading(true);
        setError(null);

        try {
            const fd = new FormData();
            fd.append('file',          file);
            fd.append('upload_preset', UPLOAD_PRESET);
            fd.append('folder',        folder);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
                { method: 'POST', body: fd }
            );

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error?.message ?? `Upload failed (HTTP ${res.status})`);
            }

            const data = await res.json();
            return data.secure_url;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    }, []);

    return { upload, uploading, error };
}