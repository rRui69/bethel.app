// resources/js/components/livestream/FacebookEmbed.jsx
//
// Renders a Facebook Live or video URL as an embedded iframe.
// Supports both Facebook Page links and personal profile links
// as long as the video privacy is set to Public.
//
// Usage:
//   <FacebookEmbed url="https://www.facebook.com/..." />

import React, { useEffect, useRef } from 'react';

export default function FacebookEmbed({ url }) {
    const containerRef = useRef(null);

    useEffect(() => {
        // Re-parse XFBML after URL changes so FB SDK re-renders the embed
        if (window.FB && window.FB.XFBML) {
            window.FB.XFBML.parse(containerRef.current);
        }
    }, [url]);

    if (!url) return null;

    // Build the embed URL — works for both:
    //   https://www.facebook.com/PageName/videos/123456
    //   https://www.facebook.com/PageName/live (redirects to active live)
    //   https://www.facebook.com/username/videos/123456 (personal profile)
    const embedSrc =
        `https://www.facebook.com/plugins/video.php` +
        `?href=${encodeURIComponent(url)}` +
        `&show_text=false` +
        `&width=640` +
        `&autoplay=false`;

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 aspect ratio
                background: '#000',
                borderRadius: '10px',
                overflow: 'hidden',
            }}
        >
            <iframe
                src={embedSrc}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    border: 'none',
                }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Facebook Livestream"
            />
        </div>
    );
}