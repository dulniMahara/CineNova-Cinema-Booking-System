import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import EditMovie from "../pages/admin/EditMovieForm";
import { getMovieById, updateMovie } from "../services/movieService";

jest.mock("../services/movieService", () => ({
  getMovieById: jest.fn(),
  updateMovie: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "1" }),
}));

const mockMovie = {
  title: "Original Movie",
  description: "Original Description",
  duration: 120,
  genre: ["Action"], 
  rating: 8,
  posterUrl: "poster.jpg",
  bannerUrl: "banner.jpg",
  trailerUrl: "trailer.mp4",
  status: "now",
};

describe("EditMovie Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMovieById.mockResolvedValue(mockMovie);
    updateMovie.mockResolvedValue({});
  });

  test("renders form fields with pre-filled movie data", async () => {
    render(
      <MemoryRouter>
        <EditMovie />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Original Movie")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Original Description")).toBeInTheDocument();
      expect(screen.getByDisplayValue("120")).toBeInTheDocument();
      expect(screen.getByDisplayValue("8")).toBeInTheDocument();
      expect(screen.getByDisplayValue("poster.jpg")).toBeInTheDocument();
      expect(screen.getByDisplayValue("banner.jpg")).toBeInTheDocument();
      expect(screen.getByDisplayValue("trailer.mp4")).toBeInTheDocument();

      expect(screen.getByLabelText("Action")).toBeChecked();

      const statusSelect = screen.getByLabelText(/Status/i);
      expect(statusSelect.value).toBe("now");
    });
  });

  test("submits form and calls updateMovie API", async () => {
    render(
      <MemoryRouter>
        <EditMovie />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByDisplayValue("Original Movie"));

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Updated Movie" },
    });
    fireEvent.change(screen.getByLabelText(/Rating/i), {
      target: { value: "9" },
    });
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: "soon" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Movie/i }));

    await waitFor(() => {
      expect(updateMovie).toHaveBeenCalledTimes(1);
      expect(updateMovie).toHaveBeenCalledWith("1", {
        title: "Updated Movie",
        description: "Original Description",
        duration: 120,
        genre: ["Action"], 
        rating: 9,
        posterUrl: "poster.jpg",
        bannerUrl: "banner.jpg",
        trailerUrl: "trailer.mp4",
        status: "soon",
      });

      expect(mockNavigate).toHaveBeenCalledWith("/admin/movies");
    });
  });
});