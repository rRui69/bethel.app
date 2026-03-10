<?php

namespace App\Agora;

/**
 * AccessToken2.php — Agora AccessToken2 (v007) builder
 *
 * Vendored from Agora's official PHP token source:
 * github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/php/src
 *
 * Drop into: app/Agora/AccessToken2.php
 */

// ── Service: RTC ───────────────────────────────────────────────
class ServiceRtc
{
    const SERVICE_TYPE = 1;

    // Privilege codes
    const PRIVILEGE_JOIN_CHANNEL          = 1;
    const PRIVILEGE_PUBLISH_AUDIO_STREAM  = 2;
    const PRIVILEGE_PUBLISH_VIDEO_STREAM  = 3;
    const PRIVILEGE_PUBLISH_DATA_STREAM   = 4;

    public string $channelName;
    public string $uid;
    public array  $privileges = [];

    public function __construct(string $channelName = '', string $uid = '')
    {
        $this->channelName = $channelName;
        $this->uid         = $uid;
    }

    public function addPrivilege(int $privilege, int $expire): void
    {
        $this->privileges[$privilege] = $expire;
    }

    public function serviceType(): int
    {
        return self::SERVICE_TYPE;
    }

    public function pack(): string
    {
        return Packer::packUint16($this->serviceType())
            . Packer::packString($this->channelName)
            . Packer::packString($this->uid)
            . Packer::packMapUint32($this->privileges);
    }
}

// ── AccessToken2 ───────────────────────────────────────────────
class AccessToken2
{
    const VERSION = '007';

    public string $appId;
    public string $appCertificate;
    public int    $expire;
    public int    $issueTs;
    public int    $salt;
    public array  $services = [];

    public function __construct(string $appId, string $appCertificate, int $expire)
    {
        $this->appId          = $appId;
        $this->appCertificate = $appCertificate;
        $this->expire         = $expire;
        $this->issueTs        = time();
        $this->salt           = rand(1, 99999999);
    }

    public function addService(ServiceRtc $service): void
    {
        $this->services[$service->serviceType()] = $service;
    }

    public function build(): string
    {
        $signing = $this->getSign();

        // Pack all services
        $servicesBytes = Packer::packUint16(count($this->services));
        foreach ($this->services as $service) {
            $servicesBytes .= $service->pack();
        }

        // Message body
        $msgBytes = Packer::packUint32($this->expire)
            . Packer::packUint32($this->issueTs)
            . Packer::packUint32($this->salt)
            . $servicesBytes;

        // HMAC-SHA256 signature over the message body
        $sig = hash_hmac('sha256', $msgBytes, $signing, true);

        // Final content = packed signature + message body
        $content = Packer::packString($sig) . $msgBytes;

        // Compress and base64-encode
        $compressed = gzcompress($content);

        return static::VERSION . $this->appId . base64_encode($compressed);
    }

    // ── Signing key: HMAC(HMAC(certificate, issueTs), salt) ───
    private function getSign(): string
    {
        $hts   = Packer::packUint32($this->issueTs);
        $hsalt = Packer::packUint32($this->salt);

        $sign = hash_hmac('sha256', $hts,   $this->appCertificate, true);
        $sign = hash_hmac('sha256', $hsalt, $sign,                  true);

        return $sign;
    }
}