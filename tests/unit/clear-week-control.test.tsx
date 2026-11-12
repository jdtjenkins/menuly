import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ clear: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("../../app/meal-plan/actions", () => ({ clearWeekAction: mocks.clear }));
import { ClearWeekControl } from "../../app/meal-plan/clear-week-control";

afterEach(() => { cleanup(); vi.resetAllMocks(); });

test("Clear Week requires confirmation and can be cancelled", async () => {
  render(<ClearWeekControl />);
  fireEvent.click(screen.getByRole("button", { name: "Clear Week" }));
  expect(screen.getByText(/Remove all planned cards/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(mocks.clear).not.toHaveBeenCalled();
});

test("Clear Week reports failure and can retry", async () => {
  mocks.clear.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(<ClearWeekControl />);
  fireEvent.click(screen.getByRole("button", { name: "Clear Week" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirm Clear Week" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Could not clear"));
  fireEvent.click(screen.getByRole("button", { name: "Confirm Clear Week" }));
  await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());
});
