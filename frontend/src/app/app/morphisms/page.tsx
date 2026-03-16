"use client";

import React from "react";
import Header from "../../components/header";

const MorphismsPage = () => {
    return (
        <div className="flex flex-col gap-8 pb-20">
            <Header value="UI Morphisms" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-6xl mx-auto w-full">
                {/* Glassmorphism */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-white/70">Glassmorphism</h2>
                    <div className="morphism-glass p-8 rounded-3xl h-64 flex flex-col justify-center items-center text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Glass Card</h3>
                        <p className="text-white/60">Translucent background with background blur and subtle borders.</p>
                    </div>
                </div>

                {/* Neumorphism */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-white/70">Neumorphism</h2>
                    <div className="morphism-neumorphic p-8 h-64 flex flex-col justify-center items-center text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Neumorphic Card</h3>
                        <p className="text-white/60">Soft shadows and highlights creating an extruded look.</p>
                    </div>
                </div>

                {/* Claymorphism */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-white/70">Claymorphism</h2>
                    <div className="morphism-clay p-8 h-64 flex flex-col justify-center items-center text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Clay Card</h3>
                        <p className="text-white/60">Soft, rounded 3D appearance with inner and outer shadows.</p>
                    </div>
                </div>

                {/* Aurora UI */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-white/70">Aurora UI</h2>
                    <div className="morphism-aurora p-8 rounded-3xl h-64 flex flex-col justify-center items-center text-center border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-2">Aurora Card</h3>
                        <p className="text-white/60">Vibrant, flowing color gradients in the background.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MorphismsPage;
