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

    // Add Marksmanship to party via the combobox
    const addWeaponSelect = screen.getByRole("combobox");
    fireEvent.change(addWeaponSelect, { target: { value: "Marksmanship" } });

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
    const branchContainer = screen.getByText(/=== BRANCH OPTIONS ===/i).closest("section");
    const wsButtons = branchContainer.querySelectorAll("button");

    const seenSkills = new Map();
    wsButtons.forEach((btn) => {
      const strongText = btn.querySelector("strong")?.textContent;
      if (strongText) {
        // Each unique WS for a weapon type must appear at most once in branch options
        const weaponBadge = btn.querySelector("div")?.textContent?.trim() || "";
        const key = `${weaponBadge}:${strongText}`;
        expect(seenSkills.has(key)).toBe(false);
        seenSkills.set(key, true);
      }
    });
  });
});
