/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home (Welcome) Page", () => {
  it("renders the title, description, and CTA button", () => {
    render(<Home />);
    expect(screen.getByText("Vibe-Post")).toBeInTheDocument();
    expect(screen.getByText(/Generate polished LinkedIn posts/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tell My Story/i })).toBeInTheDocument();
  });
}); 