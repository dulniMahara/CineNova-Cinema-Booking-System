import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../pages/customers/Home";
import { getMovies } from "../services/movieService";

jest.mock("../components/MovieCard", () => ({ movie }) => <div>{movie.title}</div>);
jest.mock("../services/movieService", () => ({ getMovies: jest.fn() }));

const mockMovies = [
  { _id: "1", title: "Action Movie", status: "now", genre: "Action", duration: 120, rating: 7 },
  { _id: "2", title: "Comedy Movie", status: "soon", genre: "Comedy", duration: 90, rating: 6 },
  { _id: "3", title: "Drama Movie", status: "now", genre: "Drama", duration: 110, rating: 8 },
];

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMovies.mockResolvedValue(mockMovies);
  });

  const renderHome = () => render(<Home />);

  test("renders Now Showing and Coming Soon sections", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText("Now Showing")).toBeInTheDocument();
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    });
  });

  test("renders movies in the correct sections", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText("Action Movie")).toBeInTheDocument();
      expect(screen.getByText("Drama Movie")).toBeInTheDocument();
      expect(screen.getByText("Comedy Movie")).toBeInTheDocument();
    });
  });
});