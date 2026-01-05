import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders restaurants page heading", () => {
  render(<App />);
  const heading = screen.getByText(/restaurants/i);
  expect(heading).toBeInTheDocument();
});
