import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Configurator from "./Configurator";

describe("Configurator set variant preview", () => {
  it("shows przod.png for Starter (front) option", async () => {
    render(<Configurator />);

    // Ensure we're on the first section (Rodzaj zestawu)
    // Click on the Starter option label to select it
    const starterLabel = await screen.findByLabelText(/Starter/i);
    await userEvent.click(starterLabel);

    // The preview image inside the card should use przod.png
    const images = screen.getAllByRole("img", { name: /wizualizacja zestawu przód/i });
    const hasPrzod = images.some((img) => (img as HTMLImageElement).getAttribute("src")?.includes("/konfigurator/zestaw/przod.png"));
    expect(hasPrzod).toBe(true);
  });

  // The label has been intentionally renamed to '3D bez rantów'
  it("renders '3D bez rantów' option (renamed Classic)", async () => {
    render(<Configurator />);
    expect(await screen.findByText(/3D bez rantów/i)).toBeTruthy();
  });

  it("applies plaster texture on color tiles when honey is selected", async () => {
    render(<Configurator />);
    // Go to step 3 (Rodzaj komórek)
    await userEvent.click(screen.getByRole('button', { name: /dalej/i }));
    await userEvent.click(screen.getByRole('button', { name: /dalej/i }));
    // Select 'Plaster miodu'
    const plasterOption = await screen.findByLabelText(/Plaster miodu/i);
    await userEvent.click(plasterOption);

    // Go to step 4 (Kolory)
    await userEvent.click(screen.getByRole('button', { name: /dalej/i }));

    // Expect at least one tile to contain plaster.png in overlay style
    const overlays = screen.getAllByTestId('texture-overlay');
    const hasPlaster = overlays.some((el) => (el as HTMLElement).getAttribute('style')?.includes('/konfigurator/komorki/plaster.png'));
    expect(hasPlaster).toBe(true);
  });

  it("applies romb texture on color tiles when diamonds is selected", async () => {
    render(<Configurator />);
    // Default is diamonds; navigate to colors
    await userEvent.click(screen.getByRole('button', { name: /dalej/i }));
    await userEvent.click(screen.getByRole('button', { name: /dalej/i }));
    await userEvent.click(screen.getByRole('button', { name: /dalej/i }));

    const overlays = screen.getAllByTestId('texture-overlay');
    const hasRomb = overlays.some((el) => (el as HTMLElement).getAttribute('style')?.includes('/konfigurator/komorki/romb.png'));
    expect(hasRomb).toBe(true);
  });
});


