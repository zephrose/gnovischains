import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

describe("Skillchain Priority and Branch Display", () => {
  test("renders App without crashing", () => {
    render(<App />);
    expect(screen.getByText(/Gnovi's Chains/i)).toBeInTheDocument();
  });

  test("Leaden Salute followed by Black Halo only displays Black Halo under Fragmentation, not Compression", () => {
    render(<App />);

    // Switch to Marksmanship (in default party slots)
    const marksmanshipBtn = screen.getByRole("button", { name: "MARKSMANSHIP" });
    fireEvent.click(marksmanshipBtn);

    // Click Leaden Salute
    const leadenSaluteBtn = screen.getByRole("button", {
      name: /Leaden Salute/i,
    });
    fireEvent.click(leadenSaluteBtn);

    // Switch active weapon to Club (Club is already in default party)
    const clubBtn = screen.getByRole("button", { name: "CLUB" });
    fireEvent.click(clubBtn);

    // Black Halo should appear exactly once in branch options
    const blackHaloBtns = screen.getAllByRole("button", {
      name: /Black Halo/i,
    });
    expect(blackHaloBtns).toHaveLength(1);

    // Verify its section is Fragmentation, not Compression
    const sectionContainer = blackHaloBtns[0].closest(
      "div[style*='margin-bottom']",
    );
    expect(sectionContainer).toHaveTextContent("FRAGMENTATION");
    expect(sectionContainer).not.toHaveTextContent("COMPRESSION");
  });

  test("Evisceration with Great Sword displays Ground Strike only under Fragmentation, not Darkness", () => {
    render(<App />);

    // Switch active weapon to Dagger
    const daggerBtn = screen.getByRole("button", { name: "DAGGER" });
    fireEvent.click(daggerBtn);

    const eviscerationBtn = screen.getByRole("button", {
      name: /Evisceration/i,
    });
    fireEvent.click(eviscerationBtn);

    // Add Great Sword to party
    const addWeaponSelect = screen.getByRole("combobox");
    fireEvent.change(addWeaponSelect, { target: { value: "Great Sword" } });

    const groundStrikeBtns = screen.getAllByRole("button", {
      name: /Ground Strike/i,
    });
    expect(groundStrikeBtns).toHaveLength(1);

    const sectionContainer = groundStrikeBtns[0].closest(
      "div[style*='margin-bottom']",
    );
    expect(sectionContainer).toHaveTextContent("FRAGMENTATION");
    expect(sectionContainer).not.toHaveTextContent("DARKNESS");
  });

  test("Evisceration with Sword displays Savage Blade only under Fragmentation, not Distortion", () => {
    render(<App />);

    // Switch active weapon to Dagger
    const daggerBtn = screen.getByRole("button", { name: "DAGGER" });
    fireEvent.click(daggerBtn);

    const eviscerationBtn = screen.getByRole("button", {
      name: /Evisceration/i,
    });
    fireEvent.click(eviscerationBtn);

    // Switch to Sword (already in party)
    const swordBtn = screen.getByRole("button", { name: "SWORD" });
    fireEvent.click(swordBtn);

    const savageBladeBtns = screen.getAllByRole("button", {
      name: /Savage Blade/i,
    });
    expect(savageBladeBtns).toHaveLength(1);

    const sectionContainer = savageBladeBtns[0].closest(
      "div[style*='margin-bottom']",
    );
    expect(sectionContainer).toHaveTextContent("FRAGMENTATION");
    expect(sectionContainer).not.toHaveTextContent("DISTORTION");
  });

  test("In party mode, no weaponskill is duplicated across different skillchain property groups", () => {
    render(<App />);

    // Switch to Party Weapons mode
    const partyToggleBtn = screen.getByRole("button", {
      name: /SINGLE_WEAPON/i,
    });
    fireEvent.click(partyToggleBtn);

    // Start with Savage Blade (Sword)
    const swordBtn = screen.getByRole("button", { name: "SWORD" });
    fireEvent.click(swordBtn);

    const savageBladeBtn = screen.getByRole("button", {
      name: /Savage Blade/i,
    });
    fireEvent.click(savageBladeBtn);

    // Get all branch buttons rendered in branch options (excluding top controls)
    const branchContainer = screen
      .getByText(/=== BRANCH OPTIONS ===/i)
      .closest("section");
    const wsButtons = branchContainer.querySelectorAll("button");

    const seenSkills = new Map();
    wsButtons.forEach((btn) => {
      const strongText = btn.querySelector("strong")?.textContent;
      if (strongText) {
        const weaponBadge = btn.querySelector("div")?.textContent?.trim() || "";
        const key = `${weaponBadge}:${strongText}`;
        expect(seenSkills.has(key)).toBe(false);
        seenSkills.set(key, true);
      }
    });
  });
});

describe("Skillchain Element Filter Feature", () => {
  test("renders all 8 element toggles active by default", () => {
    render(<App />);

    expect(screen.getByText(/== SKILLCHAIN ELEMENT FILTER ==/i)).toBeInTheDocument();
    expect(screen.getByText(/\[8\/8 ACTIVE\]/i)).toBeInTheDocument();

    const elementFilters = [
      { key: "Fire", title: "Toggle FIRE filter" },
      { key: "Ice", title: "Toggle ICE filter" },
      { key: "Wind", title: "Toggle WIND filter" },
      { key: "Earth", title: "Toggle EARTH (STONE) filter" },
      { key: "Lightning", title: "Toggle LIGHTNING filter" },
      { key: "Water", title: "Toggle WATER filter" },
      { key: "Light", title: "Toggle LIGHT filter" },
      { key: "Dark", title: "Toggle DARK filter" },
    ];

    elementFilters.forEach(({ title }) => {
      const btn = screen.getByTitle(title);
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("toggling off an element immediately removes corresponding branch options", () => {
    render(<App />);

    // Switch to Marksmanship and select Leaden Salute
    const marksmanshipBtn = screen.getByRole("button", { name: "MARKSMANSHIP" });
    fireEvent.click(marksmanshipBtn);

    const leadenSaluteBtn = screen.getByRole("button", {
      name: /Leaden Salute/i,
    });
    fireEvent.click(leadenSaluteBtn);

    // Switch to Club: Black Halo is available under Fragmentation (Wind + Lightning)
    const clubBtn = screen.getByRole("button", { name: "CLUB" });
    fireEvent.click(clubBtn);

    expect(screen.getByRole("button", { name: /Black Halo/i })).toBeInTheDocument();

    // Toggle off Wind and Lightning
    const windBtn = screen.getByTitle("Toggle WIND filter");
    const lightningBtn = screen.getByTitle("Toggle LIGHTNING filter");
    fireEvent.click(windBtn);
    fireEvent.click(lightningBtn);

    // Black Halo (Fragmentation) should now be hidden
    expect(screen.queryByRole("button", { name: /Black Halo/i })).not.toBeInTheDocument();

    // Toggle Lightning back on
    fireEvent.click(lightningBtn);

    // Black Halo (Fragmentation) should reappear
    expect(screen.getByRole("button", { name: /Black Halo/i })).toBeInTheDocument();
  });

  test("[ NONE ] disables all elements and displays filter empty state, [ ALL ] restores all", () => {
    render(<App />);

    // Start a chain with Hand-to-Hand: Raging Fist
    const ragingFistBtn = screen.getByRole("button", {
      name: /Raging Fist/i,
    });
    fireEvent.click(ragingFistBtn);

    // Click [ NONE ]
    const noneBtn = screen.getByRole("button", { name: /\[ NONE \]/i });
    fireEvent.click(noneBtn);

    expect(screen.getByText(/\[0\/8 ACTIVE\]/i)).toBeInTheDocument();
    expect(
      screen.getByText(/\[ NO_BRANCHES_MATCH_ELEMENT_FILTER \]/i),
    ).toBeInTheDocument();

    // Click [ ALL ]
    const allBtn = screen.getByRole("button", { name: /\[ ALL \]/i });
    fireEvent.click(allBtn);

    expect(screen.getByText(/\[8\/8 ACTIVE\]/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/\[ NO_BRANCHES_MATCH_ELEMENT_FILTER \]/i),
    ).not.toBeInTheDocument();
  });

  test("All button indicates all have been selected and reverts/disappears when element is deselected", () => {
    render(<App />);

    // Initially all 8 are selected: button indicates all selected
    expect(
      screen.getByRole("button", { name: /\[ ALL SELECTED ✓ \]/i }),
    ).toBeInTheDocument();

    // Deselect one element (e.g. Fire)
    const fireBtn = screen.getByTitle("Toggle FIRE filter");
    fireEvent.click(fireBtn);

    // [ ALL SELECTED ✓ ] indicator must disappear and revert to [ ALL ]
    expect(
      screen.queryByRole("button", { name: /\[ ALL SELECTED ✓ \]/i }),
    ).not.toBeInTheDocument();
    const allBtn = screen.getByRole("button", { name: /^\[ ALL \]$/i });
    expect(allBtn).toBeInTheDocument();

    // Clicking [ ALL ] re-enables all and restores the [ ALL SELECTED ✓ ] indicator
    fireEvent.click(allBtn);
    expect(
      screen.getByRole("button", { name: /\[ ALL SELECTED ✓ \]/i }),
    ).toBeInTheDocument();
  });
});
