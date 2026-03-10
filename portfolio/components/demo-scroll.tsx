"use client";

import React, { useRef } from "react";
import { FullScreenScrollFX, FullScreenFXAPI } from "@/components/ui/full-screen-scroll-fx";

const sections = [
    {
        leftLabel: "Silence",
        title: <>Absence</>,
        rightLabel: "Silence",
        background: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2874&auto=format&fit=crop",
    },
    {
        leftLabel: "Essence",
        title: <>Stillness</>,
        rightLabel: "Essence",
        background: "https://images.unsplash.com/photo-1549411030-cf29b1be04fa?q=80&w=2670&auto=format&fit=crop",
    },
    {
        leftLabel: "Rebirth",
        title: <>Growth</>,
        rightLabel: "Rebirth",
        background: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2848&auto=format&fit=crop",
    },
    {
        leftLabel: "Change",
        title: <>Opportunity</>,
        rightLabel: "Change",
        background: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2940&auto=format&fit=crop",
    },
];

export default function DemoScroll() {
    const apiRef = useRef<FullScreenFXAPI>(null);

    return (
        <div className="w-full h-full text-white bg-zinc-950">
            <FullScreenScrollFX
                apiRef={apiRef}
                sections={sections}
                header={
                    <>
                        <div className="font-light tracking-[-0.04em]">The Creative</div>
                        <div className="font-black italic text-violet-400">Process</div>
                    </>
                }
                footer={<div className="font-light">End of Journey</div>}
                showProgress
                durations={{ change: 0.7, snap: 800 }}
            />
        </div>
    );
}
