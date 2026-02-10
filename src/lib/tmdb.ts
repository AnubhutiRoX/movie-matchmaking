export interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string;
    overview: string;
    vote_average: number;
    release_date: string;
}

export interface Movie {
    id: string;
    title: string;
    posterUrl: string;
    description: string;
    rating: number;
    year: number;
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function getPopularMovies(): Promise<Movie[]> {
    if (!TMDB_API_KEY) {
        console.warn('TMDB API Key missing, falling back to mock data');
        const { mockMovies } = await import('./mockData');
        return mockMovies;
    }

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from TMDB');
        }

        const data = await response.json();

        return data.results.map((movie: TMDBMovie) => ({
            id: movie.id.toString(),
            title: movie.title,
            posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '', // Handle missing poster
            description: movie.overview,
            rating: movie.vote_average,
            year: new Date(movie.release_date).getFullYear(),
        })).filter((m: Movie) => m.posterUrl); // Filter out movies without posters

    } catch (error) {
        console.error('Error fetching movies:', error);
        const { mockMovies } = await import('./mockData');
        return mockMovies;
    }
}

export async function getMovieTrailer(movieId: string): Promise<string | null> {
    if (!TMDB_API_KEY) return null;

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );

        if (!response.ok) return null;

        const data = await response.json();
        const trailer = data.results.find(
            (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
        );

        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch (error) {
        console.error('Error fetching trailer:', error);
        return null;
    }
}
