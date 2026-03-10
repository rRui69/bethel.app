<?php

namespace App\Agora;

/**
 * RtcTokenBuilder2.php — Agora RTC token builder
 *
 * Vendored from Agora's official PHP token source:
 * github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/php/src
 *
 * Drop into: app/Agora/RtcTokenBuilder2.php
 */
class RtcTokenBuilder2
{
    // Role constants — passed to buildTokenWithUid()
    const ROLE_PUBLISHER  = 1; // Host: can join + publish audio/video/data
    const ROLE_SUBSCRIBER = 2; // Audience: can join only

    /**
     * Build token using a numeric UID.
     * Pass uid=0 for dynamic UID assignment by Agora.
     */
    public static function buildTokenWithUid(
        string $appId,
        string $appCertificate,
        string $channelName,
        int    $uid,
        int    $role,
        int    $tokenExpire,
        int    $privilegeExpire
    ): string {
        $uidStr = ($uid === 0) ? '' : (string) $uid;

        return self::buildTokenWithUserAccount(
            $appId, $appCertificate, $channelName,
            $uidStr, $role, $tokenExpire, $privilegeExpire
        );
    }

    /**
     * Build token using a string user account.
     */
    public static function buildTokenWithUserAccount(
        string $appId,
        string $appCertificate,
        string $channelName,
        string $account,
        int    $role,
        int    $tokenExpire,
        int    $privilegeExpire
    ): string {
        $token      = new AccessToken2($appId, $appCertificate, $tokenExpire);
        $serviceRtc = new ServiceRtc($channelName, $account);

        // All roles can join the channel
        $serviceRtc->addPrivilege(ServiceRtc::PRIVILEGE_JOIN_CHANNEL, $privilegeExpire);

        // Only publishers can send streams
        if ($role === self::ROLE_PUBLISHER) {
            $serviceRtc->addPrivilege(ServiceRtc::PRIVILEGE_PUBLISH_AUDIO_STREAM, $privilegeExpire);
            $serviceRtc->addPrivilege(ServiceRtc::PRIVILEGE_PUBLISH_VIDEO_STREAM, $privilegeExpire);
            $serviceRtc->addPrivilege(ServiceRtc::PRIVILEGE_PUBLISH_DATA_STREAM,  $privilegeExpire);
        }

        $token->addService($serviceRtc);

        return $token->build();
    }
}