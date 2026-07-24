import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MovieManager from "../pages/admin/MovieManager";
import "@testing-library/jest-dom";

jest.mock("../services/movieService", () => ({
  getMovies: jest.fn(),
  deleteMovie: jest.fn(),
}));

import * as movieService from "../services/movieService";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
const mockMovies = [
  {
    _id: "1",
    title: "Movie 1",
    description: "Desc 1",
    duration: 120,
    genre: "Action",
    rating: 8,
    status: "now",
    posterUrl: "poster1.jpg",
    bannerUrl: "banner1.jpg",
    trailerUrl: "trailer1.mp4",
  },
  {
    _id: "2",
    title: "Movie 2",
    description: "Desc 2",
    duration: 90,
    genre: "Comedy",
    rating: 7,
    status: "soon",
    posterUrl: "",
    bannerUrl: "",
    trailerUrl: "",
  },
];

const originalConfirm = window.confirm;
beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = jest.fn(() => true); 
  movieService.getMovies.mockResolvedValue(mockMovies);
  movieService.deleteMovie.mockResolvedValue({});
});
afterAll(() => {
  window.confirm = originalConfirm;
});

describe("MovieManager Component", () => {
  test("renders loading and then movie table", async () => {
    render(
      <MemoryRouter>
        <MovieManager />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading movies/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Movie 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Movie 2/i)).toBeInTheDocument();
    });
  });

  test("Add New Movie button navigates correctly", async () => {
    render(
      <MemoryRouter>
        <MovieManager />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Add New Movie/i));

    fireEvent.click(screen.getByText(/Add New Movie/i));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/movies/add");
  });

  test("Edit button navigates correctly", async () => {
    render(
      <MemoryRouter>
        <MovieManager />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Movie 1/i));

    const editButton = document.querySelector(".moviemanager-edit");
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/movies/edit/1");
  });

  test("Delete button calls deleteMovie and removes movie from list", async () => {
    render(
      <MemoryRouter>
        <MovieManager />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Movie 1/i));

    const deleteButton = document.querySelector(".moviemanager-delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(movieService.deleteMovie).toHaveBeenCalledWith("1");
      expect(screen.queryByText(/Movie 1/i)).not.toBeInTheDocument();
    });
  });
});