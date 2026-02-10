'use client';

import { useEffect, useState } from 'react';
import { Movie, getMovieTrailer } from '@/lib/tmdb';
import { Star, Trash2, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function WatchlistCard({ movie, onRemove }: { movie: Movie; onRemove: (id: string, e: React.MouseEvent) => void }) {
    const [expanded, setExpanded] = useState(false);

    const handleTrailerClick = async () => {
        if (expanded) return; // Don't trigger trailer if expanding/collapsing interaction just happened (though stopPropagation handles that)
        const trailerUrl = await getMovieTrailer(movie.id);
        if (trailerUrl) {
            window.open(trailerUrl, '_blank');
        } else {
            alert('No trailer available for this movie.');
        }
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 flex flex-col group cursor-pointer"
            onClick={handleTrailerClick}
        >
            <div className="relative aspect-video shrink-0">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 px-2 py-1 rounded text-yellow-400 text-xs font-bold z-10">
                    <Star size={12} fill="currentColor" />
                    <span>{movie.rating}</span>
                </div>
                {/* Play Overlay - only visible if not interacting with description controls, but here image is separate so it's fine */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/play_icon_3d.png"
                        alt="Play Trailer"
                        className="w-16 h-16 drop-shadow-lg transform hover:scale-110 transition-transform"
                    />
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    <h2 className="font-bold text-lg truncate flex-1 mr-2">{movie.title}</h2>
                    <span className="text-gray-400 text-xs mt-1 shrink-0">{movie.year}</span>
                </div>

                <div className="mb-4 relative">
                    <p className={`text-gray-300 text-xs transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}>
                        {movie.description}
                    </p>
                    <button
                        onClick={toggleExpand}
                        className="flex items-center space-x-1 text-red-500 text-[10px] font-semibold mt-1 hover:text-red-400 transition"
                    >
                        {expanded ? (
                            <><span>Show Less</span><ChevronDown size={12} /></>
                        ) : (
                            <><span>Read More</span><ChevronUp size={12} /></>
                        )}
                    </button>
                </div>

                <div className="mt-auto">
                    <button
                        onClick={(e) => onRemove(movie.id, e)}
                        className="flex items-center justify-center space-x-2 w-full py-2 bg-gray-800 hover:bg-red-900/30 text-gray-300 hover:text-red-500 rounded-lg transition text-sm"
                    >
                        <Trash2 size={16} />
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('watchlist');
        if (saved) {
            setWatchlist(JSON.parse(saved));
        }
        setMounted(true);
    }, []);

    const removeFromWatchlist = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = watchlist.filter((m) => m.id !== id);
        setWatchlist(updated);
        localStorage.setItem('watchlist', JSON.stringify(updated));
    };

    if (!mounted) return null;

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-white">My Watchlist</h1>

            {watchlist.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-xl mb-4">Your watchlist is empty.</p>
                    <Link href="/" className="text-red-500 hover:underline">
                        Go find some movies!
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {watchlist.map((movie) => (
                            <WatchlistCard
                                key={movie.id}
                                movie={movie}
                                onRemove={removeFromWatchlist}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
