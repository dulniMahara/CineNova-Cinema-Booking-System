const request = require("supertest");
const app = require("../app");
const Movie = require("../models/movie");

jest.mock("../models/movie");

let createdMovieId = "123";

describe("Movie API (Mocked DB)", () => {
  beforeAll(() => {
    Movie.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({
        _id: createdMovieId,
        ...data,
      });
    });

    // GET all movies
    Movie.find.mockResolvedValue([
      {
        _id: "1",
        title: "Movie 1",
        genre: ["Action"],
        duration: 120,
        bannerUrl: "https://example.com/banner1.jpg",
      },
      {
        _id: "2",
        title: "Movie 2",
        genre: ["Comedy"],
        duration: 90,
        bannerUrl: "https://example.com/banner2.jpg",
      },
    ]);

    // GET by ID
    Movie.findById = jest.fn().mockImplementation((id) => {
      if (id !== createdMovieId) return Promise.resolve(null);
      return Promise.resolve({
        _id: createdMovieId,
        title: "Test Movie",
        genre: ["Action"],
        duration: 120,
        bannerUrl: "https://example.com/banner.jpg",
      });
    });

    // UPDATE
    Movie.findByIdAndUpdate.mockImplementation((id, data) => {
      if (id !== createdMovieId) return Promise.resolve(null);
      return Promise.resolve({
        _id: createdMovieId,
        ...data,
      });
    });

    // DELETE
    Movie.findByIdAndDelete.mockImplementation((id) => {
      if (id !== createdMovieId) return Promise.resolve(null);
      return Promise.resolve({ _id: createdMovieId });
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test("GET /api/movies - should return all movies", async () => {
    const res = await request(app).get("/api/movies");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(Array.isArray(res.body[0].genre)).toBe(true);
    expect(res.body[0]).toHaveProperty("bannerUrl");
  });

  test("GET /api/movies/:id - should return a single movie", async () => {
    const res = await request(app).get(`/api/movies/${createdMovieId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Movie");
    expect(res.body).toHaveProperty("bannerUrl");
  });

  test("POST /api/movies - should create a new movie", async () => {
    const newMovie = {
      title: "Test Movie",
      description: "This is a test movie",
      genre: ["Action", "Adventure"],
      duration: 120,
      rating: 8,
      status: "now",
      posterUrl: "https://example.com/poster.jpg",
      bannerUrl: "https://example.com/banner.jpg",
      trailerUrl: "https://example.com/trailer.mp4",
    };

    const res = await request(app)
      .post("/api/movies")
      .send(newMovie);

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Movie");
    expect(res.body.description).toBe("This is a test movie");
    expect(res.body.posterUrl).toBe("https://example.com/poster.jpg");
    expect(res.body.bannerUrl).toBe("https://example.com/banner.jpg");
    expect(res.body.trailerUrl).toBe("https://example.com/trailer.mp4");
    expect(Array.isArray(res.body.genre)).toBe(true);
  });

  test("PUT /api/movies/:id - should update a movie", async () => {
    const updatedData = {
      title: "Updated Movie",
      genre: ["Comedy"],
      bannerUrl: "https://example.com/new-banner.jpg",
    };

    const res = await request(app)
      .put(`/api/movies/${createdMovieId}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Movie");
    expect(res.body.bannerUrl).toBe("https://example.com/new-banner.jpg");
    expect(Array.isArray(res.body.genre)).toBe(true);
  });

  test("DELETE /api/movies/:id - should delete a movie", async () => {
    const res = await request(app).delete(`/api/movies/${createdMovieId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Movie deleted successfully");
  });
});