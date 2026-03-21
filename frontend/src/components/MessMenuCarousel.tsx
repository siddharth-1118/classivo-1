"use client";

import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import React, { JSX } from "react";

export interface MessMenuCarouselItem {
    day: string;
    meal: string;
    items: string[];
    id: number;
}

interface CarouselProps {
    items: MessMenuCarouselItem[];
    baseWidth?: number;
    cardHeight?: number;
    autoplay?: boolean;
    autoplayDelay?: number;
    pauseOnHover?: boolean;
    loop?: boolean;
    round?: boolean;
    initialIndex?: number;
    onIndexChange?: (index: number) => void;
}

export interface CarouselHandle {
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
}

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 6;
const SPRING_OPTIONS = { type: "spring" as const, stiffness: 300, damping: 30 };

interface CarouselItemProps {
    item: MessMenuCarouselItem;
    index: number;
    itemWidth: number;
    cardHeight: number;
    round: boolean;
    trackItemOffset: number;
    x: any;
    transition: any;
}

function CarouselItem({
    item,
    index,
    itemWidth,
    cardHeight,
    round,
    trackItemOffset,
    x,
    transition,
}: CarouselItemProps) {
    const range = [
        -(index + 1) * trackItemOffset,
        -index * trackItemOffset,
        -(index - 1) * trackItemOffset,
    ];
    const outputRange = [90, 0, -90];
    const rotateY = useTransform(x, range, outputRange, { clamp: true });

    return (
        <motion.div
            key={`${item.id}-${index}`}
            className={`relative shrink-0 flex flex-col ${round
                ? "items-center justify-center text-center bg-[#060010] border-0"
                : "items-start justify-start bg-transparent"
                } overflow-hidden cursor-grab active:cursor-grabbing`}
            style={{
                width: itemWidth,
                height: cardHeight,
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
            }}
            transition={transition}
        >

            {/* Scrollable Content Container matching the image */}
            <div className="w-full h-auto overflow-hidden rounded-[18px] border border-white/90 bg-zinc-900/20 backdrop-blur-md flex flex-col px-1 transform-style-preserve-3d">
                {/* Scrollable List */}
                <div className="px-3 py-1.5 overflow-y-auto no-scrollbar flex-1 w-full relative">
                    <div className="flex flex-col gap-0">
                        {item.items.map((food, i) => (
                            <div
                                key={i}
                                className="flex flex-col py-2 border-b border-light-border/20 dark:border-white/10 last:border-0"
                            >
                                <span className="pl-3 text-sm font-medium leading-5 text-white/90">
                                    {food}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </motion.div>
    );
}

const MessMenuCarousel = forwardRef<CarouselHandle, CarouselProps>(
    (
        {
            items,
            baseWidth = 450,
            cardHeight = 420,
            autoplay = false,
            autoplayDelay = 3000,
            pauseOnHover = false,
            loop = false,
            round = false,
            initialIndex = 0,
            onIndexChange,
        },
        ref
    ) => {
        const containerPadding = 12;
        const itemWidth = baseWidth - containerPadding * 2;
        const trackItemOffset = itemWidth + GAP;

        const itemsForRender = useMemo(() => {
            if (!loop) return items;
            if (items.length === 0) return [];
            return [items[items.length - 1], ...items, items[0]];
        }, [items, loop]);

        const defaultPosition = loop ? initialIndex + 1 : initialIndex;
        const [position, setPosition] = useState<number>(defaultPosition);

        // Fix: Initialize x to the correct position immediately
        const x = useMotionValue(-defaultPosition * trackItemOffset);

        const [isHovered, setIsHovered] = useState<boolean>(false);
        const [isJumping, setIsJumping] = useState<boolean>(false);
        const [isAnimating, setIsAnimating] = useState<boolean>(false);

        const containerRef = useRef<HTMLDivElement>(null);

        // Calculate active index for dots (stripping clone offset)
        const getOriginalIndex = (pos: number) => {
            if (!loop) return pos;
            if (pos === 0) return items.length - 1; // First clone (last item)
            if (pos === items.length + 1) return 0; // Last clone (first item)
            return pos - 1; // Normal items
        };

        // Effect to notify parent of index change
        useEffect(() => {
            if (onIndexChange) {
                const index = getOriginalIndex(position);
                onIndexChange(index);
            }
        }, [position]); // eslint-disable-line react-hooks/exhaustive-deps


        useImperativeHandle(ref, () => ({
            next: () => {
                setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1));
            },
            prev: () => {
                setPosition((prev) => Math.max(0, prev - 1));
            },
            goTo: (index) => {
                const target = loop ? index + 1 : index;
                setPosition(target);
                // x.set handled by animate prop
            }
        }));

        useEffect(() => {
            if (!autoplay || itemsForRender.length <= 1) return undefined;
            if (pauseOnHover && isHovered) return undefined;

            const timer = setInterval(() => {
                setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1));
            }, autoplayDelay);

            return () => clearInterval(timer);
        }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

        // Initialize position from initialIndex prop only once on mount
        useEffect(() => {
            const target = loop ? initialIndex + 1 : initialIndex;
            setPosition(target);
            x.set(-target * trackItemOffset);
        }, []); // Run once. If initialIndex changes later, parent should use Ref.goTo()

        useEffect(() => {
            if (!loop && position > itemsForRender.length - 1) {
                setPosition(Math.max(0, itemsForRender.length - 1));
            }
        }, [itemsForRender.length, loop, position]);

        const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

        const handleAnimationStart = () => {
            setIsAnimating(true);
        };

        const handleAnimationComplete = () => {
            if (!loop || itemsForRender.length <= 1) {
                setIsAnimating(false);
                return;
            }
            const lastCloneIndex = itemsForRender.length - 1;

            if (position === lastCloneIndex) {
                setIsJumping(true);
                const target = 1;
                setPosition(target);
                x.set(-target * trackItemOffset);
                requestAnimationFrame(() => {
                    setIsJumping(false);
                    setIsAnimating(false);
                });
                return;
            }

            if (position === 0) {
                setIsJumping(true);
                const target = items.length;
                setPosition(target);
                x.set(-target * trackItemOffset);
                requestAnimationFrame(() => {
                    setIsJumping(false);
                    setIsAnimating(false);
                });
                return;
            }

            setIsAnimating(false);
        };

        const handleDragEnd = (
            _: MouseEvent | TouchEvent | PointerEvent,
            info: PanInfo
        ): void => {
            const { offset, velocity } = info;
            const direction =
                offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
                    ? 1
                    : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
                        ? -1
                        : 0;

            if (direction === 0) return;

            setPosition((prev) => {
                const next = prev + direction;
                const max = itemsForRender.length - 1;
                return Math.max(0, Math.min(next, max));
            });
        };

        const dragProps = loop
            ? {}
            : {
                dragConstraints: {
                    left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
                    right: 0,
                },
            };

        const currentActiveIndex = getOriginalIndex(position);

        return (
            <div
                ref={containerRef}
                className={`relative overflow-hidden py-2 flex flex-col items-center ${round ? "rounded-full border border-white" : "rounded-[20px]"
                    }`}
                style={{
                    width: `${baseWidth}px`,
                    ...(round && { height: `${baseWidth}px` }),
                }}
            >
                <motion.div
                    className="flex"
                    drag={isAnimating ? false : "x"}
                    {...dragProps}
                    style={{
                        width: itemWidth,
                        gap: `${GAP}px`,
                        // perspective: 1000,
                        perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2
                            }px 50%`,
                        x,
                        transformStyle: "preserve-3d",
                    }}
                    onDragEnd={handleDragEnd}
                    animate={{ x: -(position * trackItemOffset) }}
                    transition={effectiveTransition}
                    onAnimationStart={handleAnimationStart}
                    onAnimationComplete={handleAnimationComplete}
                >
                    {itemsForRender.map((item, index) => (
                        <CarouselItem
                            key={`${item.id}-${index}`}
                            item={item}
                            index={index}
                            itemWidth={itemWidth}
                            cardHeight={cardHeight}
                            round={round}
                            trackItemOffset={trackItemOffset}
                            x={x}
                            transition={effectiveTransition}
                        />
                    ))}
                </motion.div>
            </div>
        );
    }
);

MessMenuCarousel.displayName = "MessMenuCarousel";
export default MessMenuCarousel;
