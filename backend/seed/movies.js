const tmdb = require("../utils/tmdb");
const Movie = require("../models/movie");

const getMovieMedia = async (movieName) => {
  try {
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
        trailerUrl: ""
      };
    }

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    const bannerUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : "";

    let trailerUrl = "";

    try {
      const vidResponse = await tmdb.get(`/movie/${movie.id}/videos`);
      const videos = vidResponse.data.results || [];

      // Find official trailer or teaser on YouTube
      const trailer =
        videos.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
        videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
        videos.find(v => v.site === "YouTube" && v.type === "Teaser") ||
        videos.find(v => v.site === "YouTube");

      if (trailer && trailer.key) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    } catch (vidErr) {
      console.log("Could not fetch TMDB videos for:", movieName);
    }

    return {
      posterUrl,
      bannerUrl,
      trailerUrl
    };
  } catch (err) {
    console.error("TMDB fetch error for:", movieName, err.message);
    return {
      posterUrl: "",
      bannerUrl: "",
      trailerUrl: ""
    };
  }
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
      rating: 8.0,
      tmdbSearch: "Michael",
      status: "now"
    },
    {
      title: "The Devil Wears Prada 2",
      description:
        "The iconic fashion world returns as old rivalries and new challenges reshape the industry.",
      duration: 120,
      genre: ["Comedy", "Drama"],
      rating: 7.5,
      tmdbSearch: "The Devil Wears Prada",
      status: "now"
    },
    {
      title: "The Odyssey",
      description:
        "An epic adaptation bringing Homer's legendary journey across the seas to life.",
      duration: 180,
      genre: ["Adventure", "Fantasy", "Drama"],
      rating: 8.5,
      tmdbSearch: "The Odyssey",
      status: "now"
    },
    {
      title: "Moana",
      description:
        "A young navigator sets sail across the ocean on a journey of courage and discovery.",
      duration: 107,
      genre: ["Animation", "Adventure", "Family"],
      rating: 7.6,
      tmdbSearch: "Moana",
      status: "now"
    },
    {
      title: "Spider-Man: Brand New Day",
      description:
        "Peter Parker returns for a new chapter as he faces new threats and responsibilities.",
      duration: 130,
      genre: ["Action", "Adventure", "Fantasy"],
      rating: 8.2,
      tmdbSearch: "Spider-Man: Brand New Day",
      status: "soon"
    },
    {
      title: "Avengers: Doomsday",
      description:
        "The Avengers unite against a powerful new threat that could change the future of the universe.",
      duration: 150,
      genre: ["Action", "Adventure", "Sci-Fi"],
      rating: 8.8,
      tmdbSearch: "Avengers: Doomsday",
      status: "soon"
    },
    {
      title: "Insidious",
      description:
        "A family encounters terrifying supernatural events connected to a dark hidden world.",
      duration: 110,
      genre: ["Horror", "Thriller"],
      rating: 6.8,
      tmdbSearch: "Insidious",
      status: "soon"
    }
  ];

  for (let movie of movies) {
    const media = await getMovieMedia(movie.tmdbSearch || movie.title);

    movie.posterUrl = media.posterUrl || "";
    movie.bannerUrl = media.bannerUrl || "";
    movie.trailerUrl = media.trailerUrl || "";

    delete movie.tmdbSearch;
  }

  const createdMovies = await Movie.insertMany(movies);
  console.log("✅ Movies seeded with TMDB posters, banners, and YouTube trailer URLs!");

  return createdMovies;
};

module.exports = seedMovies;