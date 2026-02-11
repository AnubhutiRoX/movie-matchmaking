import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import MovieCard from './MovieCard';
import { Movie, getPopularMovies, getMovieTrailer } from '@/lib/tmdb';
import { Heart, X, RotateCcw, Loader2 } from 'lucide-react';

interface SwipeContainerProps {
    initialMovies?: Movie[];
    roomId?: string; // Optional because it might be used in single player
    userId?: string;
}

export default function SwipeContainer({ initialMovies = [], roomId, userId }: SwipeContainerProps) {
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [loading, setLoading] = useState(initialMovies.length === 0);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchMovies = async () => {
            if (initialMovies.length > 0) return;
            try {
                const data = await getPopularMovies();
                setMovies(data);
            } catch (error) {
                console.error("Failed to fetch movies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    // Basic localStorage persistence for watchlist
    const addToWatchlist = (movie: Movie) => {
        try {
            const saved = localStorage.getItem('watchlist');
            const watchlist = saved ? JSON.parse(saved) : [];
            if (!watchlist.find((m: Movie) => m.id === movie.id)) {
                watchlist.push(movie);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
            }
        } catch (error) {
            console.error("Failed to save to watchlist", error);
        }
    };

    const handleSwipe = async (direction: 'left' | 'right', movie: Movie) => {
        if (direction === 'right') {
            addToWatchlist(movie);
        }

        // Optimistic UI update
        setMovies((prev) => prev.slice(0, -1));

        // Insert swipe into DB if multiplayer
        if (roomId && userId) {
            try {
                const { error } = await supabase.from('swipes').insert({
                    room_id: roomId,
                    user_id: userId,
                    movie_id: movie.id,
                    liked: direction === 'right'
                });
                if (error) {
                    console.error('Error recording swipe:', error);
                }
            } catch (err) {
                console.error('Failed to submit swipe:', err);
            }
        }
    };

    const handleCardClick = async (movie: Movie) => {
        const trailerUrl = await getMovieTrailer(movie.id);
        if (trailerUrl) {
            window.open(trailerUrl, '_blank');
        } else {
            alert('No trailer available for this movie.');
        }
    };

    const handleRestart = async () => {
        setLoading(true);
        const data = await getPopularMovies();
        setMovies(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-red-500" size={48} />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto px-4">
            <div className="relative w-full aspect-[2/3] flex items-center justify-center mb-8">
                <AnimatePresence>
                    {movies.map((movie, index) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            isFront={index === movies.length - 1}
                            onSwipe={(dir) => handleSwipe(dir, movie)}
                            onClick={() => handleCardClick(movie)}
                        />
                    ))}
                </AnimatePresence>

                {movies.length === 0 && (
                    <div className="text-center text-white z-0 flex flex-col items-center">
                        <h2 className="text-2xl font-bold mb-4">You've seen them all!</h2>
                        <button
                            onClick={handleRestart}
                            className="px-6 py-3 bg-red-600 rounded-full font-semibold hover:bg-red-700 transition flex items-center space-x-2"
                        >
                            <RotateCcw size={20} />
                            <span>Start Over</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            {movies.length > 0 && (
                <div className="flex justify-center items-center space-x-8 z-10 w-full">
                    <button
                        onClick={() => handleSwipe('left', movies[movies.length - 1])}
                        className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-red-500 hover:bg-gray-700 hover:scale-110 transition shadow-lg border border-gray-700"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => handleSwipe('right', movies[movies.length - 1])}
                        className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-green-500 hover:bg-gray-700 hover:scale-110 transition shadow-lg border border-gray-700"
                    >
                        <Heart size={32} fill="currentColor" />
                    </button>
                </div>
            )}
        </div>
    );
}
