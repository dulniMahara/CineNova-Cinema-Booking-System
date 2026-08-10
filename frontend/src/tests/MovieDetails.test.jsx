import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../services/movieService", () => ({
  getMovieById: jest.fn(),
}));
import { getMovieById } from "../services/movieService";

jest.mock("../services/showtimeService", () => ({
  getShowtimesByMovie: jest.fn(),
}));
import { getShowtimesByMovie } from "../services/showtimeService";

import MovieDetails from "../pages/customers/MovieDetails";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "1" }),
}));

const mockMovie = {
  _id: "1",
  title: "Test Movie",
  genre: "Action",
  duration: 120,
  rating: 8.5,
  description: "Test movie description",
  posterUrl: "poster.jpg",
  trailerUrl: "https://www.youtube.com/embed/test",
};

describe("MovieDetails Component", () => {
  let mockShowtimes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowtimes = [
      {
        _id: "60c72b2f9b1d8b001c8e4f1a",
        movie: "1",
        hall: { _id: "h1", name: "Hall 1" },
        date: new Date().toISOString(),
        startTime: "11:59 PM",
        price: 1500
      }
    ];
    getMovieById.mockResolvedValue(mockMovie);
    getShowtimesByMovie.mockResolvedValue({ success: true, data: mockShowtimes });
  });

  test("renders loading and then movie details", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading movie/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
      expect(screen.getByText((content) =>
        content.includes("Action") &&
        content.includes("120") &&
        content.includes("8.5")
      )).toBeInTheDocument();
      expect(screen.getByText("Test movie description")).toBeInTheDocument();
      expect(screen.getByAltText("Test Movie")).toBeInTheDocument();
    });
  });

  test("Selecting showtime navigates to booking page", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/11:59 PM/i));

    fireEvent.click(screen.getByText(/11:59 PM/i));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/booking/60c72b2f9b1d8b001c8e4f1a",
      expect.anything()
    );
  });

  test("Watch Trailer button navigates to trailer page", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Watch Trailer/i));

    fireEvent.click(screen.getByText(/Watch Trailer/i));
    expect(mockNavigate).toHaveBeenCalledWith("/trailer/1", expect.anything());
  });
});