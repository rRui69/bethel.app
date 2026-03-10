<?php

namespace App\Services;
use App\Agora\RtcTokenBuilder2;

class AgoraTokenService
{
    private string $appId;
    private string $appCertificate;

    public function __construct()
    {
        $this->appId          = config('services.agora.app_id');
        $this->appCertificate = config('services.agora.certificate');
    }

    /**
     * Publisher token — for the admin broadcaster (host).
     * Grants: join + publish audio + video + data stream.
     */
    public function generatePublisherToken(
        string $channelName,
        int $uid = 0,
        int $expireSeconds = 7200
    ): string {
        return RtcTokenBuilder2::buildTokenWithUid(
            $this->appId,
            $this->appCertificate,
            $channelName,
            $uid,
            RtcTokenBuilder2::ROLE_PUBLISHER,
            $expireSeconds,
            $expireSeconds
        );
    }

    /**
     * Subscriber token — for public viewers.
     * Grants: join only — cannot publish any stream.
     */
    public function generateSubscriberToken(
        string $channelName,
        int $uid = 0,
        int $expireSeconds = 7200
    ): string {
        return RtcTokenBuilder2::buildTokenWithUid(
            $this->appId,
            $this->appCertificate,
            $channelName,
            $uid,
            RtcTokenBuilder2::ROLE_SUBSCRIBER,
            $expireSeconds,
            $expireSeconds
        );
    }
}