import { Movie } from '@/lib/tmdb';
import { Star, Calendar } from 'lucide-react';

interface MatchesViewProps {
    matchedMovieIds: string[];
    allMovies: Movie[];
    onRestart?: () => void;
}

export default function MatchesView({ matchedMovieIds, allMovies, onRestart }: MatchesViewProps) {
    // Filter the full movie list to find the matched movie objects
    const matches = allMovies.filter(movie => matchedMovieIds.includes(movie.id));

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <h2 className="text-3xl font-bold text-white mb-4">No Matches Yet</h2>
                <p className="text-gray-400">Keep swiping! You'll find something eventually.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-500">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-8 drop-shadow-sm">
                It's a Match!
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mb-8">
                {matches.map(movie => (
                    <div key={movie.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 hover:scale-105 transition-transform duration-300">
                        <div className="relative aspect-[2/3]">
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center space-x-1">
                                <Star className="text-yellow-400 w-3 h-3" fill="currentColor" />
                                <span className="text-white text-xs font-bold">{movie.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-bold text-white leading-tight mb-2 truncate">{movie.title}</h3>
                            <div className="flex items-center text-gray-400 text-xs mb-3">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{movie.year}</span>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-3 mb-4">{movie.description}</p>
                            <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm text-white font-medium transition-colors"
                            >
                                Watch Trailer
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {onRestart && (
                <button
                    onClick={onRestart}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg transition-all"
                >
                    Play Again
                </button>
            )}
        </div>
    );
}
