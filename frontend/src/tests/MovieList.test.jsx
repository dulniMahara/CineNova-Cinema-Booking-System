import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../components/MovieCard", () => ({ movie }) => <div>{movie.title}</div>);

jest.mock("../services/movieService", () => ({
  getMovies: jest.fn(),
}));
import { getMovies } from "../services/movieService";

import MovieList from "../pages/customers/MovieList";

const mockMovies = [
  { _id: "1", title: "Action Movie", status: "now", genre: "Action", duration: 120, rating: 7 },
  { _id: "2", title: "Comedy Movie", status: "soon", genre: "Comedy", duration: 90, rating: 6 },
  { _id: "3", title: "Drama Movie", status: "now", genre: "Drama", duration: 110, rating: 8 },
];

describe("MovieList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getMovies.mockImplementation((params) => {
      let filtered = [...mockMovies];
      if (params.genre) filtered = filtered.filter(m => m.genre === params.genre);
      if (params.rating) filtered = filtered.filter(m => m.rating >= Number(params.rating));
      return Promise.resolve(filtered);
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <MovieList />
      </MemoryRouter>
    );

  test("renders Now Showing and Coming Soon sections", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Now Showing")).toBeInTheDocument();
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    });
  });

  test("renders movies under correct sections", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Action Movie")).toBeInTheDocument();
      expect(screen.getByText("Drama Movie")).toBeInTheDocument();
      expect(screen.getByText("Comedy Movie")).toBeInTheDocument();
    });
  });

  test("filters movies by genre", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Action Movie"));

    const [genreSelect] = screen.getAllByRole("combobox");
    fireEvent.change(genreSelect, { target: { value: "Drama" } });

    await waitFor(() => {
      expect(screen.getByText("Drama Movie")).toBeInTheDocument();
      expect(screen.queryByText("Action Movie")).not.toBeInTheDocument();
      expect(screen.queryByText("Comedy Movie")).not.toBeInTheDocument();
    });
  });

  test("filters movies by rating", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Action Movie"));

    const [, ratingSelect] = screen.getAllByRole("combobox");
    fireEvent.change(ratingSelect, { target: { value: "8" } });

    await waitFor(() => {
      expect(screen.getByText("Drama Movie")).toBeInTheDocument();
      expect(screen.queryByText("Action Movie")).not.toBeInTheDocument();
      expect(screen.queryByText("Comedy Movie")).not.toBeInTheDocument();
    });
  });

  test("shows 'No movies found' when filters exclude all movies", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Action Movie"));

    const [genreSelect, ratingSelect] = screen.getAllByRole("combobox");

    fireEvent.change(genreSelect, { target: { value: "Fantasy" } });
    fireEvent.change(ratingSelect, { target: { value: "9" } });

    await waitFor(() => {
      const noMoviesMessages = screen.getAllByText("No movies found for selected filters.");
      expect(noMoviesMessages).toHaveLength(2); // Now Showing + Coming Soon
      expect(screen.queryByText("Action Movie")).not.toBeInTheDocument();
      expect(screen.queryByText("Drama Movie")).not.toBeInTheDocument();
      expect(screen.queryByText("Comedy Movie")).not.toBeInTheDocument();
    });
  });
});