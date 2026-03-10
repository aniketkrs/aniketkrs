"use client"

import { SplineSceneBasic } from "@/components/demo";
import { Gravity, MatterBody } from "@/components/ui/gravity";
import GlassHeroSection from "@/components/ui/glassmorphism-trust-hero";
import RainingLetters from "@/components/ui/modern-animated-hero-section";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import AnimatedShaderHero from "@/components/ui/animated-shader-hero";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";

import DemoScroll from "@/components/demo-scroll";

// This is the combined view of the physics engine
function GravityHero() {
    return (
        <div className="w-full h-full min-h-[500px] flex flex-col relative font-sans overflow-hidden bg-zinc-950 border-b border-zinc-900">
            <div className="pt-20 text-6xl sm:text-7xl md:text-8xl w-full text-center font-bold tracking-tight text-white z-10 pointer-events-none">
                Discover <span className="text-violet-500">Physics</span>
            </div>
            <p className="pt-4 text-base sm:text-xl md:text-2xl text-zinc-400 w-full text-center z-10 pointer-events-none">
                Interactive elements built with matter.js
            </p>

            <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full z-20">
                <MatterBody
                    matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                    x="30%"
                    y="10%"
                >
                    <div className="text-xl sm:text-2xl md:text-3xl bg-violet-600 text-white rounded-full hover:cursor-pointer px-8 py-4 shadow-lg shadow-violet-500/20">
                        react
                    </div>
                </MatterBody>
                <MatterBody
                    matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                    x="30%"
                    y="30%"
                >
                    <div className="text-xl sm:text-2xl md:text-3xl bg-emerald-500 text-zinc-950 font-semibold rounded-full hover:cursor-grab px-8 py-4 shadow-lg shadow-emerald-500/20">
                        typescript
                    </div>
                </MatterBody>
                <MatterBody
                    matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                    x="40%"
                    y="20%"
                    angle={10}
                >
                    <div className="text-xl sm:text-2xl md:text-3xl bg-indigo-500 text-white rounded-full hover:cursor-grab px-8 py-4 shadow-lg shadow-indigo-500/20">
                        motion
                    </div>
                </MatterBody>
                <MatterBody
                    matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                    x="75%"
                    y="10%"
                >
                    <div className="text-xl sm:text-2xl md:text-3xl bg-violet-400 text-zinc-950 font-semibold rounded-full hover:cursor-grab px-8 py-4 ">
                        tailwind
                    </div>
                </MatterBody>
                <MatterBody
                    matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                    x="80%"
                    y="20%"
                >
                    <div className="text-xl sm:text-2xl md:text-3xl bg-emerald-400 text-zinc-950 font-semibold rounded-full hover:cursor-grab px-8 py-4 ">
                        drei
                    </div>
                </MatterBody>
                <MatterBody
                    matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                    x="50%"
                    y="10%"
                >
                    <div className="text-xl sm:text-2xl md:text-3xl bg-zinc-800 text-white border border-zinc-700 rounded-full hover:cursor-grab px-8 py-4 ">
                        matter-js
                    </div>
                </MatterBody>
            </Gravity>
        </div>
    );
}

export default function CombinedLandingPage() {
    return (
        <main className="flex min-h-screen w-full flex-col bg-zinc-950 selection:bg-violet-500/30">

            {/* 1. Spline Scene (Originally from previous task) */}
            <section className="relative w-full h-screen border-b border-zinc-900">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <SplineSceneBasic />
                </div>
            </section>

            {/* 2. Glassmorphism Trust Hero */}
            <section className="relative w-full">
                <GlassHeroSection />
            </section>

            {/* 3. Physics / Gravity Demo */}
            <section className="relative w-full h-[600px]">
                <GravityHero />
            </section>

            {/* 4. Raining Letters (Matrix Style) */}
            <section className="relative w-full">
                <RainingLetters />
            </section>

            {/* 5. Animated Shader Hero (WebGL) */}
            <section className="relative w-full h-screen">
                <AnimatedShaderHero
                    trustBadge={{
                        text: "Trusted by forward-thinking teams.",
                        icons: ["✨"]
                    }}
                    headline={{
                        line1: "Launch Your",
                        line2: "Workflow Into Orbit"
                    }}
                    subtitle="Supercharge productivity with AI-powered automation and integrations built for the next generation of teams — fast, seamless, and limitless."
                    buttons={{
                        primary: {
                            text: "Get Started for Free",
                            onClick: () => console.log('Get Started clicked')
                        },
                        secondary: {
                            text: "Explore Features",
                            onClick: () => console.log('Explore Features clicked')
                        }
                    }}
                />
            </section>

            {/* 6. Raw Shader Animation Background */}
            <section className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                <ShaderAnimation />
                <span className="absolute pointer-events-none z-10 text-center text-5xl md:text-7xl leading-none font-bold tracking-tighter whitespace-pre-wrap text-white drop-shadow-lg">
                    Raw WebGL <span className="text-emerald-400">Shaders</span>
                </span>
            </section>

            {/* 7. Interactive Image Accordion */}
            <section className="relative w-full">
                <LandingAccordionItem />
            </section>

            {/* 8. Full Screen Scroll FX */}
            <section className="relative w-full">
                <DemoScroll />
            </section>

        </main>
    );
}
