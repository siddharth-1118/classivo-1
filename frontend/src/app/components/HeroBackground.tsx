import React from "react";

export default function HeroBackground() {
    return (
        <div className="relative w-full h-screen bg-[#020204] overflow-hidden flex items-center justify-center">

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">

                <div
                    className="absolute top-[-50%] left-[-10%] w-[70%] h-[200%] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.08)_0%,rgba(0,0,0,0)_70%)] blur-[80px]"
                />

                <div
                    className="absolute top-[-50%] right-[-10%] w-[70%] h-[200%] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.08)_0%,rgba(0,0,0,0)_70%)] blur-[80px]"
                />

                <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10 text-center">
                <h1 className="text-6xl font-bold tracking-tight text-white sm:text-7xl">
                    Radically better <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
                        observability stack
                    </span>
                </h1>
            </div>
        </div>
    );
}