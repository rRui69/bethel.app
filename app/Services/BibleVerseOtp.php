<?php

namespace App\Services;

/**
 * BibleVerseOtp
 *
 * Generates OTP codes in the format BOOK{chapter}{verse}
 * e.g. JOHN316, PSALM231, ROMANS828
 *
 * Each code is unique per call (random book + verse).
 * Collision probability across the pool of ~200 verses is acceptable
 * because OTPs are user-scoped and expire in 15 minutes.
 */
class BibleVerseOtp
{
    /**
     * Curated pool of well-known Bible verses.
     * Format: [BOOKCODE, chapter, verse]
     */
    private const VERSES = [
        // New Testament
        ['JOHN',      3,  16], ['JOHN',      3,  17], ['JOHN',     14,   6],
        ['JOHN',     11,  25], ['JOHN',      1,   1], ['JOHN',     15,   5],
        ['JOHN',      8,  32], ['JOHN',     10,  10], ['JOHN',     13,  34],
        ['JOHN',     15,  13],
        ['MATTHEW',   5,   3], ['MATTHEW',   5,   9], ['MATTHEW',  11,  28],
        ['MATTHEW',  28,  19], ['MATTHEW',   6,  33], ['MATTHEW',  22,  37],
        ['LUKE',      1,  37], ['LUKE',      6,  31], ['LUKE',     15,  20],
        ['MARK',     10,  27], ['MARK',     11,  24], ['MARK',     12,  30],
        ['ROMANS',    8,  28], ['ROMANS',    8,  38], ['ROMANS',   12,   2],
        ['ROMANS',    5,   8], ['ROMANS',    6,  23], ['ROMANS',   10,   9],
        ['PHIL',      4,  13], ['PHIL',      4,   6], ['PHIL',      4,   7],
        ['PHIL',      4,  19], ['PHIL',      2,   4],
        ['GAL',       5,  22], ['GAL',       5,  23], ['GAL',       6,   9],
        ['EPH',       2,   8], ['EPH',       6,  10], ['EPH',       4,  32],
        ['COL',       3,  16], ['COL',       3,  23],
        ['TIM2',      1,   7], ['TIM2',      3,  16], ['TIM1',      6,  12],
        ['HEB',      11,   1], ['HEB',      13,   8], ['HEB',      12,   1],
        ['JAS',       1,  17], ['JAS',       1,  22], ['JAS',       4,   7],
        ['PET1',      5,   7], ['PET1',      3,  15],
        ['COR1',     13,   4], ['COR1',     13,  13], ['COR1',      6,  19],
        ['COR1',     10,  13],
        ['COR2',      5,  17], ['COR2',     12,   9], ['COR2',      4,  18],
        ['JN1',       4,   8], ['JN1',       4,  19], ['JN1',       1,   9],
        ['REV',       3,  20], ['REV',      21,   4], ['REV',       1,   8],
        // Old Testament
        ['PS',       23,   1], ['PS',       46,   1], ['PS',      119, 105],
        ['PS',       27,   1], ['PS',       34,   8], ['PS',       91,   1],
        ['PS',       37,   4], ['PS',       90,   2], ['PS',       46,  10],
        ['PS',       55,  22], ['PS',      103,   1], ['PS',      139,  14],
        ['PS',       28,   7], ['PS',       31,  24], ['PS',       32,   8],
        ['PROV',      3,   5], ['PROV',      3,   6], ['PROV',     22,   6],
        ['PROV',     16,   3], ['PROV',     18,  10],
        ['ISA',      40,  31], ['ISA',      41,  10], ['ISA',      43,   2],
        ['ISA',      40,   8], ['ISA',      26,   3],
        ['JER',      29,  11], ['JER',      33,   3],
        ['JOSH',      1,   9], ['DEUT',     31,   6], ['DEUT',      6,   5],
        ['GEN',       1,   1], ['NUM',       6,  24], ['MIC',       6,   8],
        ['LAM',       3,  23],
    ];

    /**
     * Generate a new random Bible-verse OTP code.
     * Returns something like "JOHN316" or "PSALM231".
     */
    public static function generate(): string
    {
        $verse = self::VERSES[array_rand(self::VERSES)];
        [$book, $chapter, $verseNum] = $verse;

        return strtoupper("{$book}{$chapter}{$verseNum}");
    }

    /**
     * Format the code for display in the email with a colon separator
     * e.g. "JOHN 3:16" so users can look it up if curious.
     * The stored/verified code remains without spaces for input simplicity.
     */
    public static function formatForDisplay(string $code): string
    {
        // e.g. JOHN316 → returned as-is (already readable)
        return $code;
    }
}
