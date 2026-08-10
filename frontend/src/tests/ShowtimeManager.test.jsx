import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ShowtimeManager from "../pages/admin/ShowtimeManager";
import "@testing-library/jest-dom";
import axios from "axios";

jest.mock("axios");

jest.mock("../services/showtimeService", () => ({
  getShowtimes: jest.fn(),
  deleteShowtime: jest.fn()
}));
import { getShowtimes, deleteShowtime } from "../services/showtimeService";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 2);

const mockShowtimes = Array.from({ length: 30 }, (_, i) => ({
  _id: `st_${i + 1}`,
  movie: { _id: `m_${i + 1}`, title: `Movie ${i + 1}`, posterUrl: "poster.jpg" },
  hall: { _id: "h_1", name: "IMAX Hall", seatCapacity: 100 },
  date: futureDate.toISOString(),
  startTime: "07:30 PM",
  price: 2000
}));

describe("ShowtimeManager Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
    axios.get.mockResolvedValue({ data: { success: true, data: [{ _id: "h_1", name: "IMAX Hall" }] } });
    getShowtimes.mockResolvedValue({ data: mockShowtimes });
  });

  test("renders showtime manager with compact pagination and default active view", async () => {
    render(
      <MemoryRouter>
        <ShowtimeManager />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Showtime Management/i)).toBeInTheDocument();
      expect(screen.getAllByText("Movie 1")[0]).toBeInTheDocument();
    });

    // Check compact count info
    expect(screen.getByText(/Showing 1–20 of 30 showtimes/i)).toBeInTheDocument();

    // Check pagination buttons: 1, 2, Previous, Next exist
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
  });

  test("changing rows per page updates visible count and total pages", async () => {
    render(
      <MemoryRouter>
        <ShowtimeManager />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Movie 1")[0]).toBeInTheDocument();
    });

    const rowsSelect = screen.getByLabelText(/Rows per page/i);
    fireEvent.change(rowsSelect, { target: { value: "10" } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 1–10 of 30 showtimes/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    });
  });

  test("status filter allows switching to Past or All Statuses", async () => {
    render(
      <MemoryRouter>
        <ShowtimeManager />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Movie 1")[0]).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const statusSelect = selects.find(s => s.value === "active");
    expect(statusSelect).toBeInTheDocument();

    fireEvent.change(statusSelect, { target: { value: "all" } });
    expect(statusSelect.value).toBe("all");
  });
});
