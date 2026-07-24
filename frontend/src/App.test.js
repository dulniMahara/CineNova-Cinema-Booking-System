import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

jest.mock("./services/movieService", () => ({
  getMovies: jest.fn(),
  getMovieById: jest.fn(),
}));

test("renders app header link", () => {
  render(<App />);
  const headerLink = screen.getByRole("link", { name: /Cinema Booking/i });
  expect(headerLink).toBeInTheDocument();
});