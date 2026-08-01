import "@testing-library/jest-dom";

jest.mock("swiper/css", () => ({}), { virtual: true });
jest.mock("swiper/css/navigation", () => ({}), { virtual: true });
jest.mock("swiper/css/pagination", () => ({}), { virtual: true });
jest.mock("swiper/css/effect-fade", () => ({}), { virtual: true });
jest.mock("swiper/react", () => {
  const React = require("react");
  return {
    __esModule: true,
    Swiper: ({ children }) => React.createElement("div", { "data-testid": "swiper" }, children),
    SwiperSlide: ({ children }) => React.createElement("div", { "data-testid": "swiper-slide" }, children),
  };
});
jest.mock("swiper/modules", () => ({
  __esModule: true,
  Navigation: () => null,
  Autoplay: () => null,
  EffectFade: () => null,
  Pagination: () => null,
}));
jest.mock("react-toastify/dist/ReactToastify.css", () => ({}), { virtual: true });