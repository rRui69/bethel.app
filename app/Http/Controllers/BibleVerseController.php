<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BibleVerseController extends Controller
{
    public function votd(): JsonResponse
    {

        $cacheKey = 'votd_' . now()->toDateString(); 

        $verse = Cache::remember($cacheKey, now()->endOfDay(), function () {
            return $this->fetchFromBibleOrg();
        });

        if (! $verse) {
            return response()->json(['error' => 'Unable to load verse'], 503);
        }

        return response()->json($verse);
    }

    /**
     * Verse of the Day from labs.bible.org.
     * API URL:    https://labs.bible.org/api/?passage=votd&type=json&formatting=plain
     * Response:  [ { bookname, chapter, verse, text, title, titles } ]
     */
    private function fetchFromBibleOrg(): ?array
    {
        try {
            $response = Http::timeout(5)->get('https://labs.bible.org/api/', [
                'passage'    => 'votd',
                'type'       => 'json',
                'formatting' => 'plain', 
            ]);

            if (! $response->successful()) {
                Log::warning('BibleVerseController: labs.bible.org returned HTTP ' . $response->status());
                return null;
            }

            // API returns an array; we only need the first (and only) item.
            $data = $response->json();

            if (empty($data) || ! isset($data[0])) {
                Log::warning('BibleVerseController: unexpected response shape', ['body' => $response->body()]);
                return null;
            }

            $raw = $data[0];

            return [
                'text'      => trim($raw['text']      ?? ''),
                'bookname'  => trim($raw['bookname']  ?? ''),
                'chapter'   => trim($raw['chapter']   ?? ''),
                'verse'     => trim($raw['verse']     ?? ''),
                // Pre-formatted reference string for convenience in the frontend
                'reference' => sprintf(
                    '%s %s:%s',
                    $raw['bookname'] ?? '',
                    $raw['chapter']  ?? '',
                    $raw['verse']    ?? ''
                ),
            ];

        } catch (\Throwable $e) {
            Log::error('BibleVerseController: fetch failed — ' . $e->getMessage());
            return null;
        }
    }
}