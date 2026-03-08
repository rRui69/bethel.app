<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Cloudinary direct HTTP upload service.
 * No Laravel Cloudinary package required — uses REST API directly.
 * Falls back to local disk when CLOUDINARY_URL is not set.
 */
class CloudinaryUploader
{
    public static function upload(
        \Illuminate\Http\UploadedFile $file,
        string $folder,
        string $localDisk = 'public',
        string $localFolder = 'uploads'
    ): string {
        $cloudinaryUrl = env('CLOUDINARY_URL');
        $parsed        = $cloudinaryUrl ? parse_url($cloudinaryUrl) : null;
        $useCloudinary = $parsed
            && !empty($parsed['user'])
            && !empty($parsed['pass'])
            && !empty($parsed['host']);

        if ($useCloudinary) {
            $apiKey    = $parsed['user'];
            $apiSecret = $parsed['pass'];
            $cloudName = $parsed['host'];
            $timestamp = time();
            $signature = sha1("folder={$folder}&timestamp={$timestamp}{$apiSecret}");

            $response = Http::attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )->post("https://api.cloudinary.com/v1_1/{$cloudName}/auto/upload", [
                'api_key'   => $apiKey,
                'timestamp' => $timestamp,
                'folder'    => $folder,
                'signature' => $signature,
            ]);

            if (!$response->successful()) {
                Log::error('CloudinaryUploader failed', [
                    'status'   => $response->status(),
                    'response' => $response->body(),
                ]);
                throw new \RuntimeException('File upload failed. Please try again.');
            }

            return $response->json('secure_url');
        }

        // Local fallback
        $path = $file->store($localFolder, $localDisk);
        return Storage::disk($localDisk)->url($path);
    }

    public static function resolveUrl(string $path, string $localDisk = 'public'): string
    {
        if (str_starts_with($path, 'http')) {
            return $path;
        }
        return Storage::disk($localDisk)->url($path);
    }
}