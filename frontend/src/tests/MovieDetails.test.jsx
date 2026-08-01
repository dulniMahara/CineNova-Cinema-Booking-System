import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../services/movieService", () => ({
  getMovieById: jest.fn(),
}));
import { getMovieById } from "../services/movieService";

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

import MovieDetails from "../pages/customers/MovieDetails";

describe("MovieDetails Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMovieById.mockResolvedValue(mockMovie);
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

    await waitFor(() => screen.getByText(/10:30 AM/i));

    fireEvent.click(screen.getByText(/10:30 AM/i));
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("/booking/"),
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