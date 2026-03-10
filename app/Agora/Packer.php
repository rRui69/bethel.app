<?php

namespace App\Agora;

/**
 * Packer.php — Agora binary packing utilities
 *
 * Vendored from Agora's official PHP token source:
 * github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/php/src
 *
 * Drop into: app/Agora/Packer.php
 */
class Packer
{
    // Pack uint16 big-endian (2 bytes)
    public static function packUint16(int $v): string
    {
        return pack('n', $v);
    }

    // Pack uint32 big-endian (4 bytes)
    public static function packUint32(int $v): string
    {
        return pack('N', $v);
    }

    // Pack string as uint16-length-prefixed bytes
    public static function packString(string $str): string
    {
        return pack('n', strlen($str)) . $str;
    }

    // Pack map<uint16 → uint32> (used for privileges)
    public static function packMapUint32(array $map): string
    {
        $result = pack('n', count($map));
        foreach ($map as $key => $value) {
            $result .= pack('n', $key) . pack('N', $value);
        }
        return $result;
    }
}