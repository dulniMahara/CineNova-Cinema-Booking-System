import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import AddMovie from "../pages/admin/AddMovieForm";
import { createMovie } from "../services/movieService";

jest.mock("../services/movieService", () => ({
  createMovie: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("AddMovie Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMovie.mockResolvedValue({});
  });

  test("renders form fields correctly", () => {
    render(
      <MemoryRouter>
        <AddMovie />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Genre/i)).toBeInTheDocument(); 
    expect(screen.getByLabelText(/Rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Poster URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Banner URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Trailer URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Movie/i })).toBeInTheDocument();
  });

  test("submits form and calls createMovie API", async () => {
    render(
      <MemoryRouter>
        <AddMovie />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Test Movie" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByLabelText(/Duration/i), {
      target: { value: "120" },
    });

    fireEvent.click(screen.getByLabelText("Action"));

    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: "8.5" },
    });
    fireEvent.change(screen.getByLabelText(/Poster URL/i), {
      target: { value: "poster.jpg" },
    });
    fireEvent.change(screen.getByLabelText(/Banner URL/i), {
      target: { value: "banner.jpg" },
    });
    fireEvent.change(screen.getByLabelText(/Trailer URL/i), {
      target: { value: "trailer.mp4" },
    });
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: "now" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Movie/i }));

    await waitFor(() => {
      expect(createMovie).toHaveBeenCalledTimes(1);
      expect(createMovie).toHaveBeenCalledWith({
        title: "Test Movie",
        description: "Test Description",
        duration: 120,
        genre: ["Action"], 
        rating: 8.5,
        posterUrl: "poster.jpg",
        bannerUrl: "banner.jpg",
        trailerUrl: "trailer.mp4",
        status: "now",
      });

      expect(mockNavigate).toHaveBeenCalledWith("/admin/movies");
    });
  });
});