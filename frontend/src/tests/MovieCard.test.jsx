import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import "@testing-library/jest-dom";

const movie = {
  _id: "1",
  title: "Test Movie",
  posterUrl: "test.jpg",
  genre: "Action",
  duration: 120,
};

test("renders movie title, genre, and duration", () => {
  render(
    <MemoryRouter>
      <MovieCard movie={movie} />
    </MemoryRouter>
  );

  expect(screen.getByText(/Test Movie/i)).toBeInTheDocument();
  expect(screen.getByText(/Action \| 120 mins/i)).toBeInTheDocument();

  const img = screen.getByAltText(/Test Movie/i);
  expect(img).toHaveAttribute("src", "test.jpg");

  expect(screen.getByText(/View Details/i)).toBeInTheDocument();
  expect(screen.getByText(/Book Now/i)).toBeInTheDocument();
});
