export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  description: string;
  rating: number;
  year: number;
}

export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    rating: 8.8,
    year: 2010,
  },
  {
    id: '2',
    title: 'Interstellar',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniL6E77AAyFcAJ20eNSiv.jpg',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    rating: 8.6,
    year: 2014,
  },
  {
    id: '3',
    title: 'The Dark Knight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    rating: 9.0,
    year: 2008,
  },
  {
    id: '4',
    title: 'Avatar',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg',
    description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
    rating: 7.9,
    year: 2009,
  },
  {
    id: '5',
    title: 'The Avengers',
    posterUrl: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    description: 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are to stop the mischievous Loki and his alien army from enslaving humanity.',
    rating: 8.0,
    year: 2012,
  },
];
