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

describe("FFXI Skillchain Survival Game", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("swaps title icons: 🎮 in calculator, 💻 in game, and toggles views when clicked", () => {
    render(<App />);

    // In calculator: Title is Gnovi's Chains, icon is 🎮
    expect(screen.getByText("Gnovi's Chains")).toBeInTheDocument();
    const iconBtn = screen.getByTitle(/Access FFXI Skillchain Survival Game/i);
    expect(iconBtn).toHaveTextContent("🎮");

    // Click icon to enter Survival Game
    fireEvent.click(iconBtn);

    // In game: Title is FFXI Skillchain Survival, icon is 💻
    expect(screen.getByText("FFXI Skillchain Survival")).toBeInTheDocument();
    const returnBtn = screen.getByTitle(/Return to Calculator/i);
    expect(returnBtn).toHaveTextContent("💻");

    // Click icon to return to Calculator
    fireEvent.click(returnBtn);
    expect(screen.getByText("Gnovi's Chains")).toBeInTheDocument();
    expect(screen.getByTitle(/Access FFXI Skillchain Survival Game/i)).toHaveTextContent("🎮");
  });

  test("initiates survival game with Game Master briefing, pause window, and 3 options", () => {
    render(<App />);

    // Enter Survival Game
    fireEvent.click(screen.getByTitle(/Access FFXI Skillchain Survival Game/i));

    // Game Master briefing displayed
    expect(
      screen.getByText(/FFXI SKILLCHAIN SURVIVAL ARENA • GAME MASTER/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/CURRENT STREAK:/i)).toBeInTheDocument();
    expect(screen.getByText(/HIGH SCORE:/i)).toBeInTheDocument();

    // 4-second pause window displayed initially
    expect(screen.getByText(/PAUSE WINDOW \(INACTIVE\):/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SKIP PAUSE/i })).toBeInTheDocument();

    // Skip pause window to open active link window
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));
    expect(screen.getByText(/TIME REMAINING: 10(\.0)? SECONDS/i)).toBeInTheDocument();

    // 3 multiple-choice options (A, B, C)
    expect(screen.getByText(/\[ A \]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[ B \]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[ C \]/i)).toBeInTheDocument();

    // Battle chronicle log present
    expect(screen.getByText(/== BATTLE CHRONICLE LOG ==/i)).toBeInTheDocument();
  });

  test("warns player when attempting to select option during 4-second pause window", () => {
    render(<App />);
    fireEvent.click(screen.getByTitle(/Access FFXI Skillchain Survival Game/i));

    // Initially in pause window
    expect(screen.getByText(/PAUSE WINDOW \(INACTIVE\):/i)).toBeInTheDocument();

    // Click an option button during pause window
    const allButtons = screen.getAllByRole("button");
    const optionBtn = allButtons.find(
      (btn) =>
        btn.textContent.includes("[ A ]") ||
        btn.textContent.includes("[ B ]") ||
        btn.textContent.includes("[ C ]"),
    );
    fireEvent.click(optionBtn);

    // Warning banner displayed
    expect(screen.getByText(/TOO EARLY!/i)).toBeInTheDocument();
  });

  test("selecting a specific premade flow (Samurai Light to Radiance) sets Tachi: Yukikaze as opener", () => {
    render(<App />);
    fireEvent.click(screen.getByTitle(/Access FFXI Skillchain Survival Game/i));

    // Select Samurai Light to Radiance (Great Katana)
    const sequenceSelect = screen.getByRole("combobox");
    fireEvent.change(sequenceSelect, { target: { value: "light-cap-gk" } });

    // Opener is Tachi: Yukikaze
    expect(screen.getAllByText("Tachi: Yukikaze")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Great Katana/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/None \(Opener Initiated\)/i)).toBeInTheDocument();

    // Skip pause to unlock choices
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));

    // Option choices contain Tachi: Koki as the correct link
    expect(screen.getByRole("button", { name: /Tachi: Koki/i })).toBeInTheDocument();
  });

  test("completing all steps of a sequence finishes with celebration and FFXI rule conclusion", () => {
    render(<App />);
    fireEvent.click(screen.getByTitle(/Access FFXI Skillchain Survival Game/i));

    // Select Samurai Light to Radiance (Tachi: Yukikaze -> Tachi: Koki -> Tachi: Kasha -> Tachi: Fudo)
    const sequenceSelect = screen.getByRole("combobox");
    fireEvent.change(sequenceSelect, { target: { value: "light-cap-gk" } });

    // Step 1: Skip pause, click Tachi: Koki
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));
    fireEvent.click(screen.getByRole("button", { name: /Tachi: Koki/i }));

    // Turn 2: Streak 1, previous WS Tachi: Koki, SC Fragmentation
    expect(screen.getByText("CURRENT STREAK:").parentElement).toHaveTextContent("1");
    expect(screen.getByText(/TURN 2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/FRAGMENTATION/i).length).toBeGreaterThan(0);

    // Step 2: Skip pause, click Tachi: Kasha
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));
    fireEvent.click(screen.getByRole("button", { name: /Tachi: Kasha/i }));

    // Turn 3: Streak 2, final finisher step
    expect(screen.getByText("CURRENT STREAK:").parentElement).toHaveTextContent("2");
    expect(screen.getByText(/TURN 3/i)).toBeInTheDocument();
    expect(screen.getByText(/FINAL FINISHER LINK/i)).toBeInTheDocument();

    // Step 3 (Finisher): Skip pause, click Tachi: Fudo
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));
    fireEvent.click(screen.getByRole("button", { name: /Tachi: Fudo/i }));

    // Sequence Completed Screen displayed!
    expect(
      screen.getByText(/SKILLCHAIN MASTERED! SEQUENCE COMPLETED!/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NATURAL FFXI CONCLUSION REACHED: Level 4 Radiance Cap/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /NEXT SEQUENCE/i })).toBeInTheDocument();
  });

  test("incorrect choice triggers game over with ASCII crash flare and retry button", () => {
    render(<App />);
    fireEvent.click(screen.getByTitle(/Access FFXI Skillchain Survival Game/i));

    // Select Samurai Light to Radiance
    const sequenceSelect = screen.getByRole("combobox");
    fireEvent.change(sequenceSelect, { target: { value: "light-cap-gk" } });

    // Skip pause
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));

    // Find the 3 option buttons
    const allButtons = screen.getAllByRole("button");
    const optionButtons = allButtons.filter(
      (btn) =>
        btn.textContent.includes("[ A ]") ||
        btn.textContent.includes("[ B ]") ||
        btn.textContent.includes("[ C ]"),
    );
    expect(optionButtons).toHaveLength(3);

    // Pick an incorrect button (not Tachi: Koki)
    const incorrectBtn = optionButtons.find(
      (btn) => !btn.textContent.includes("Tachi: Koki"),
    );
    expect(incorrectBtn).toBeDefined();
    fireEvent.click(incorrectBtn);

    // Game Over ASCII Crash and Burn flare displayed
    expect(
      screen.getByText(/CRASH AND BURN! THE SKILLCHAIN HAS SHATTERED!/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/MISALIGNMENT \/ CHAIN BROKEN/i)).toBeInTheDocument();
    expect(screen.getByText(/Required Continuation:/i).parentElement).toHaveTextContent("Tachi: Koki");

    // Retry button restores game to PLAYING state
    const retryBtn = screen.getByRole("button", { name: /RETRY \/ PLAY AGAIN/i });
    fireEvent.click(retryBtn);

    expect(screen.queryByText(/CRASH AND BURN/i)).not.toBeInTheDocument();
    expect(screen.getByText(/PAUSE WINDOW \(INACTIVE\):/i)).toBeInTheDocument();
  });

  test("celebrates new high score when player sets a new record", () => {
    render(<App />);
    fireEvent.click(screen.getByTitle(/Access FFXI Skillchain Survival Game/i));

    // Select Samurai Light to Radiance
    const sequenceSelect = screen.getByRole("combobox");
    fireEvent.change(sequenceSelect, { target: { value: "light-cap-gk" } });

    // Turn 1: Skip pause and click Tachi: Koki
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));
    fireEvent.click(screen.getByRole("button", { name: /Tachi: Koki/i }));

    // Turn 2: Skip pause and pick an incorrect choice
    fireEvent.click(screen.getByRole("button", { name: /SKIP PAUSE/i }));
    const allButtons = screen.getAllByRole("button");
    const optionButtons = allButtons.filter(
      (btn) =>
        btn.textContent.includes("[ A ]") ||
        btn.textContent.includes("[ B ]") ||
        btn.textContent.includes("[ C ]"),
    );
    const incorrectBtn = optionButtons.find(
      (btn) => !btn.textContent.includes("Tachi: Kasha"),
    );
    fireEvent.click(incorrectBtn);

    // Celebration banner displayed for new high score
    expect(
      screen.getByText(/NEW PERSONAL RECORD HIGH SCORE/i),
    ).toBeInTheDocument();
  });

  test("keyboard keys A, B, C allow choosing options during gameplay, and Space skips pause", () => {
    render(<App />);
    fireEvent.click(screen.getByTitle(/Access FFXI Skillchain Survival Game/i));

    // Select Samurai Light to Radiance
    const sequenceSelect = screen.getByRole("combobox");
    fireEvent.change(sequenceSelect, { target: { value: "light-cap-gk" } });

    // Press Space on window to skip pause window
    fireEvent.keyDown(window, { key: " " });
    expect(screen.getByText(/TIME REMAINING:/i)).toBeInTheDocument();

    // Determine which key [A], [B], or [C] corresponds to Tachi: Koki
    const allButtons = screen.getAllByRole("button");
    const optionButtons = allButtons.filter(
      (btn) =>
        btn.textContent.includes("[ A ]") ||
        btn.textContent.includes("[ B ]") ||
        btn.textContent.includes("[ C ]"),
    );
    const correctBtn = optionButtons.find((btn) =>
      btn.textContent.includes("Tachi: Koki"),
    );
    const keyMatch = correctBtn.textContent.match(/\[ ([ABC]) \]/)[1];

    // Press the corresponding key on window
    fireEvent.keyDown(window, { key: keyMatch });

    // Should successfully advance to Turn 2
    expect(screen.getByText(/TURN 2/i)).toBeInTheDocument();
  });
});

