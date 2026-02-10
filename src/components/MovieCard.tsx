'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Movie } from '@/lib/tmdb';
import { Star, PlayCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface MovieCardProps {
    movie: Movie;
    onSwipe: (direction: 'left' | 'right') => void;
    isFront: boolean;
    onClick?: () => void;
}

export default function MovieCard({ movie, onSwipe, isFront, onClick }: MovieCardProps) {
    const [expanded, setExpanded] = useState(false);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const likeOpacity = useTransform(x, [20, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-150, -20], [1, 0]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipe('right');
        } else if (info.offset.x < -threshold) {
            onSwipe('left');
        }
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    return (
        <motion.div
            style={{
                x: isFront ? x : 0,
                rotate: isFront ? rotate : 0,
                zIndex: isFront ? 10 : 0
            }}
            drag={isFront && !expanded ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            dragSnapToOrigin
            className={`absolute w-[90vw] max-w-sm aspect-[2/3] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 ${isFront ? 'cursor-grab active:cursor-grabbing' : ''}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={isFront && onClick && !expanded ? onClick : undefined}
        >
            <div className="relative h-full w-full group">
                {/* Image takes full height initially, but we cover it with the expanded text */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover pointer-events-none"
                />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pointer-events-none" />

                {/* Play Icon Overlay */}
                {isFront && !expanded && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/play_icon_3d.png"
                            alt="Play Trailer"
                            className="w-20 h-20 drop-shadow-lg transform hover:scale-110 transition-transform"
                        />
                    </div>
                )}

                {/* Text Content Overlay */}
                <motion.div
                    className="absolute bottom-0 left-0 w-full bg-gray-900/90 backdrop-blur-md p-6 flex flex-col justify-end border-t border-gray-800"
                    initial={{ height: "25%" }}
                    animate={{ height: expanded ? "75%" : "25%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="flex flex-col h-full justify-end">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-white truncate">{movie.title}</h2>
                            <div className="flex items-center space-x-1 text-yellow-500 shrink-0 ml-2">
                                <Star size={20} fill="currentColor" />
                                <span className="font-semibold text-lg">{movie.rating}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                            <span>{movie.year}</span>
                        </div>

                        <div className="relative">
                            <p className={`text-gray-300 text-sm transition-all duration-300 ${expanded ? 'overflow-y-auto max-h-[300px] pr-2' : 'line-clamp-2'}`}>
                                {movie.description}
                            </p>
                            <button
                                onClick={toggleExpand}
                                className="flex items-center space-x-1 text-red-500 text-xs font-semibold mt-2 hover:text-red-400 transition"
                            >
                                {expanded ? (
                                    <><span>Show Less</span><ChevronDown size={14} /></>
                                ) : (
                                    <><span>Read More</span><ChevronUp size={14} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Overlay indicators */}
            {isFront && (
                <>
                    <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-8 left-8 border-4 border-green-500 rounded-lg p-2 transform -rotate-12"
                    >
                        <span className="text-green-500 font-bold text-4xl uppercase tracking-widest">LIKE</span>
                    </motion.div>

                    <motion.div
                        style={{ opacity: nopeOpacity }}
                        className="absolute top-8 right-8 border-4 border-red-500 rounded-lg p-2 transform rotate-12"
                    >
                        <span className="text-red-500 font-bold text-4xl uppercase tracking-widest">NOPE</span>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
