"use client"

import React, { useState } from 'react';

const accordionItems = [
    {
        id: 1,
        title: 'Voice Assistant',
        imageUrl: 'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=1974&auto=format&fit=crop',
    },
    {
        id: 2,
        title: 'AI Image Gen',
        imageUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 3,
        title: 'Chatbot + Local RAG',
        imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1974&auto=format&fit=crop',
    },
    {
        id: 4,
        title: 'Agentic Flow',
        imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2090&auto=format&fit=crop',
    },
    {
        id: 5,
        title: 'Visual Logic',
        imageUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2070&auto=format&fit=crop',
    },
];

const AccordionItem = ({ item, isActive, onMouseEnter }: { item: any, isActive: boolean, onMouseEnter: () => void }) => {
    return (
        <div
            className={`
        relative h-[450px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out border border-white/10
        ${isActive ? 'w-[400px] shadow-2xl shadow-violet-500/20' : 'w-[60px] opacity-70'}
      `}
            onMouseEnter={onMouseEnter}
        >
            <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x450/2d3748/ffffff?text=Image+Error'; }}
            />

            {/* Dynamic gradient overlay based on active state */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent' : 'bg-black/80 grayscale'}`} />

            {/* Caption Text */}
            <span
                className={`
          absolute text-white text-lg font-bold whitespace-nowrap
          transition-all duration-500 ease-in-out drop-shadow-md
          ${isActive
                        ? 'bottom-6 left-1/2 -translate-x-1/2 rotate-0 text-emerald-400'
                        : 'w-auto text-left bottom-24 left-1/2 -translate-x-1/2 rotate-90 text-zinc-400 font-medium'
                    }
        `}
            >
                {item.title}
            </span>
        </div>
    );
};


export function LandingAccordionItem() {
    const [activeIndex, setActiveIndex] = useState(4);

    const handleItemHover = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="bg-zinc-950 font-sans border-y border-zinc-900 border-dashed py-12">
            <section className="container mx-auto px-4 py-12 md:py-24">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                    <div className="w-full md:w-1/2 text-center md:text-left text-white">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter">
                            Accelerate Logic on <br />
                            <span className="bg-gradient-to-r from-emerald-400 to-violet-500 bg-clip-text text-transparent">Any Device</span>
                        </h1>
                        <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto md:mx-0">
                            Build high-performance interactive apps on-device without the hassle of server deployment bottlenecks.
                        </p>
                        <div className="mt-8 flex gap-4 justify-center md:justify-start">
                            <button
                                className="inline-block bg-violet-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-violet-500 hover:scale-[1.02] transition-all duration-300"
                            >
                                Start Exploring
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 hidden md:block">
                        <div className="flex flex-row items-center justify-center gap-4 overflow-x-auto p-4">
                            {accordionItems.map((item, index) => (
                                <AccordionItem
                                    key={item.id}
                                    item={item}
                                    isActive={index === activeIndex}
                                    onMouseEnter={() => handleItemHover(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
