
import React from 'react';
import { Image } from 'lucide-react';

interface ImagePlaceholderProps {
    minHeight?: string;
    description: string;
    suggestion: string;
    /** When set, render image instead of placeholder */
    src?: string;
    /** When set, render video (autoplay, loop, muted) instead of placeholder */
    videoSrc?: string;
}

export default function ImagePlaceholder({ minHeight = "300px", description, suggestion, src, videoSrc }: ImagePlaceholderProps) {
    if (videoSrc) {
        return (
            <div className="w-full relative overflow-hidden rounded-2xl border border-white/10 bg-black" style={{ minHeight }}>
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label={description}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
        );
    }
    if (src) {
        return (
            <div className="w-full relative overflow-hidden rounded-2xl border border-white/10 bg-black" style={{ minHeight }}>
                <img
                    src={src}
                    alt={description}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }
    return (
        <div
            className="w-full relative overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center p-8 text-center group hover:border-[#E8C677]/30 transition-colors"
            style={{ minHeight }}
        >
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Image className="text-white/40 w-8 h-8 group-hover:text-[#E8C677] transition-colors" />
            </div>

            <h4 className="text-white/80 font-mono text-xs uppercase tracking-widest mb-2">Image Placeholder</h4>

            <p className="text-[#E8C677] font-bold text-lg mb-2">
                {suggestion}
            </p>

            <p className="text-white/50 text-sm max-w-sm">
                Context: {description}
            </p>

            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
