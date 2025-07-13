/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home Page", () => {
  describe("Basic rendering", () => {
    it("renders the welcome page with title, description, and CTA button", () => {
      render(<Home />);
      expect(screen.getByText("Vibe-Post")).toBeInTheDocument();
      expect(screen.getByText(/Generate polished LinkedIn posts/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Tell My Story/i })).toBeInTheDocument();
    });

    it("shows proper description for unauthenticated users", () => {
      render(<Home />);
      expect(screen.getByText(/Connect your GitHub account and let AI craft professional posts/i)).toBeInTheDocument();
    });

    it("button is clickable and not disabled by default", () => {
      render(<Home />);
      const button = screen.getByRole("button", { name: /Tell My Story/i });
      expect(button).not.toBeDisabled();
    });
  });
}); 