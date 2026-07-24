const tmdb = require("../utils/tmdb");
const Movie = require("../models/movie");

const getMovieImages = async (movieName) => {
  const response = await tmdb.get("/search/movie", {
    params: {
      query: movieName,
    },
  });

  const movie = response.data.results[0];

  if (!movie) {
    console.log("No TMDB result for:", movieName);
    return {
      posterUrl: "",
      bannerUrl: "",
    };
  }

  return {
    posterUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "",

    bannerUrl: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : "",
  };
};


const seedMovies = async () => {
  console.log("🔥 NEW MOVIE SEED FILE RUNNING");

  await Movie.deleteMany({});
  console.log("🗑️ Old movies cleared");

  const movies = [

    {
      title: "Jurassic World: Rebirth",
      description:
        "A new expedition enters an unexplored region where humanity encounters terrifying prehistoric creatures.",
      duration: 134,
      genre: ["Adventure", "Action", "Sci-Fi"],
      rating: 7.1,
      tmdbSearch: "Jurassic World Rebirth",
      status: "now"
    },


    {
      title: "F1",
      description:
        "A former Formula One champion returns to racing and mentors a young driver while facing the challenges of the modern racing world.",
      duration: 156,
      genre: ["Drama", "Sports"],
      rating: 8.1,
      tmdbSearch: "F1",
      status: "now"
    },


    {
      title: "Michael",
      description:
        "A biographical musical drama exploring the life, legacy and journey of global music icon Michael Jackson.",
      duration: 180,
      genre: ["Biography", "Drama", "Music"],
      rating: 0,
      tmdbSearch: "Michael",
      status: "now"
    },


    {
      title: "The Devil Wears Prada 2",
      description:
        "The iconic fashion world returns as old rivalries and new challenges reshape the industry.",
      duration: 120,
      genre: ["Comedy", "Drama"],
      rating: 0,
      tmdbSearch: "The Devil Wears Prada 2",
      status: "now"
    },


    {
      title: "The Odyssey",
      description:
        "Christopher Nolan's epic adaptation brings Homer's legendary journey to life.",
      duration: 180,
      genre: ["Adventure", "Fantasy", "Drama"],
      rating: 0,
      posterUrl:
        "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      bannerUrl:
        "https://image.tmdb.org/t/p/original/placeholder.jpg",
      trailerUrl:
        "https://www.youtube.com/results?search_query=The+Odyssey+2026+trailer",
      status: "now"
    },


    {
      title: "Moana",
      description:
        "A young navigator sets sail across the ocean on a journey of courage and discovery.",
      duration: 107,
      genre: ["Animation", "Adventure", "Family"],
      rating: 7.6,
      posterUrl:
        "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      bannerUrl:
        "https://image.tmdb.org/t/p/original/placeholder.jpg",
      trailerUrl:
        "https://www.youtube.com/results?search_query=Moana+official+trailer",
      status: "now"
    },


    {
      title: "Spider-Man: Brand New Day",
      description:
        "Peter Parker returns for a new chapter as he faces new threats and responsibilities.",
      duration: 130,
      genre: ["Action", "Adventure", "Fantasy"],
      rating: 0,
      posterUrl:
        "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      bannerUrl:
        "https://image.tmdb.org/t/p/original/placeholder.jpg",
      trailerUrl:
        "https://www.youtube.com/results?search_query=Spider-Man+Brand+New+Day+trailer",
      status: "soon"
    },


    {
      title: "Avengers: Doomsday",
      description:
        "The Avengers unite against a powerful new threat that could change the future of the universe.",
      duration: 150,
      genre: ["Action", "Adventure", "Sci-Fi"],
      rating: 0,
      posterUrl:
        "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      bannerUrl:
        "https://image.tmdb.org/t/p/original/placeholder.jpg",
      trailerUrl:
        "https://www.youtube.com/results?search_query=Avengers+Doomsday+trailer",
      status: "soon"
    },


    {
      title: "Insidious",
      description:
        "A family encounters terrifying supernatural events connected to a dark hidden world.",
      duration: 110,
      genre: ["Horror", "Thriller"],
      rating: 0,
      posterUrl:
        "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      bannerUrl:
        "https://image.tmdb.org/t/p/original/placeholder.jpg",
      trailerUrl:
        "https://www.youtube.com/results?search_query=Insidious+movie+trailer",
      status: "soon"
    }

  ];


  for (let movie of movies) {

  const images = await getMovieImages(movie.tmdbSearch || movie.title);

    movie.posterUrl = images.posterUrl;
    movie.bannerUrl = images.bannerUrl;

    delete movie.tmdbSearch;
  }


  const createdMovies = await Movie.insertMany(movies);

  console.log("✅ Movies seeded");

  return createdMovies;
};


module.exports = seedMovies;