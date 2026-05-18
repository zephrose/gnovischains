import React, { useState, useEffect } from "react";
import { weaponskills, skillchains } from "./data";

const ELEMENT_COLORS = {
  Dark: "#000000",
  Light: "#fff6d3",
  Ice: "#a2e4f1",
  Water: "#2980b9",
  Earth: "#8b4513",
  Wind: "#2ecc71",
  Fire: "#ff4757",
  Lightning: "#fb8fff",
};

const ELEMENT_MAP = {
  Darkness: { type: "solid", color: ELEMENT_COLORS.Dark },
  Compression: { type: "solid", color: ELEMENT_COLORS.Dark },
  Light: { type: "solid", color: ELEMENT_COLORS.Light },
  Transfixion: { type: "solid", color: ELEMENT_COLORS.Light },
  Induration: { type: "solid", color: ELEMENT_COLORS.Ice },
  Reverberation: { type: "solid", color: ELEMENT_COLORS.Water },
  Scission: { type: "solid", color: ELEMENT_COLORS.Earth },
  Detonation: { type: "solid", color: ELEMENT_COLORS.Wind },
  Liquefaction: { type: "solid", color: ELEMENT_COLORS.Fire },
  Impaction: { type: "solid", color: ELEMENT_COLORS.Lightning },
  Gravitation: {
    type: "gradient",
    colors: [ELEMENT_COLORS.Dark, ELEMENT_COLORS.Earth],
  },
  Fragmentation: {
    type: "gradient",
    colors: [ELEMENT_COLORS.Lightning, ELEMENT_COLORS.Wind],
  },
  Fusion: {
    type: "gradient",
    colors: [ELEMENT_COLORS.Light, ELEMENT_COLORS.Fire],
  },
  Distortion: {
    type: "gradient",
    colors: [ELEMENT_COLORS.Ice, ELEMENT_COLORS.Water],
  },
};

function App() {
  const [history, setHistory] = useState([]);
  const [partySlots, setPartySlots] = useState([
    "Sword",
    "Hand-to-Hand",
    "Club",
    "Dagger",
    "Katana",
  ]);
  const [activeWeaponType, setActiveWeaponType] = useState("Sword");
  const [darkMode, setDarkMode] = useState(true);
  const [antiChainMode, setAntiChainMode] = useState(false);
  const [multiPartyMode, setMultiPartyMode] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Responsive & Mobile State Management
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const theme = {
    bg: darkMode ? "#121212" : "#fff",
    text: darkMode ? "#e0e0e0" : "#333",
    border: darkMode ? "#444" : "#333",
    cardBg: darkMode ? "#1e1e1e" : "#fcfcfc",
    itemBg: darkMode ? "#2c2c2c" : "#fff",
    accent: darkMode ? "#e0e0e0" : "#333",
    muted: darkMode ? "#777" : "#aaa",
    danger: "#ff4757",
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderTitle = () => {
    if (antiChainMode) return "Gnovi's Anti-Chains";
    if (multiPartyMode) return "Gnovi's Party-Chains";
    return "Gnovi's Chains";
  };

  const getStyleForElement = (element, isInactive = false) => {
    const config = ELEMENT_MAP[element];
    if (!config) return { backgroundColor: theme.itemBg, color: theme.text };
    const baseStyle = {
      color: ["Light", "Transfixion", "Wind", "Ice"].includes(element)
        ? "#000"
        : "#fff",
      padding: "4px 10px",
      borderRadius: "2px",
      fontWeight: "bold",
      display: "inline-block",
      fontSize: "0.85rem",
      opacity: isInactive ? 0.3 : 1,
    };
    return config.type === "solid"
      ? { ...baseStyle, backgroundColor: config.color }
      : {
          ...baseStyle,
          background: `linear-gradient(135deg, ${config.colors[0]} 0%, ${config.colors[1]} 100%)`,
        };
  };

  const getWSProperties = (wsName, weaponCategory) =>
    weaponskills[weaponCategory]?.[wsName] || [];

  const getGamePriorityResult = (
    starterProps,
    closerName,
    closerWeaponType,
  ) => {
    const closerProps = getWSProperties(closerName, closerWeaponType);
    if (!starterProps || !closerProps) return null;
    for (let sProp of starterProps) {
      for (let cProp of closerProps) {
        if (skillchains[sProp]?.[cProp]) return skillchains[sProp][cProp];
      }
    }
    return null;
  };

  const recalculateChain = (wsList, isAnti) => {
    const newHistory = [];
    for (let i = 0; i < wsList.length; i++) {
      const currentWS = wsList[i];
      if (i === 0) {
        newHistory.push({ ...currentWS, scResult: null, isLevel4: false });
        continue;
      }
      const lastStep = newHistory[i - 1];
      const starterProps = lastStep.scResult
        ? [lastStep.scResult]
        : getWSProperties(lastStep.name, lastStep.weaponType);
      const actualSC = getGamePriorityResult(
        starterProps,
        currentWS.name,
        currentWS.weaponType,
      );

      if (isAnti) {
        if (actualSC !== null) break;
      } else {
        if (actualSC === null || lastStep.isLevel4) break;
      }

      const isLevel4 =
        !isAnti &&
        lastStep.scResult === actualSC &&
        ["Light", "Darkness"].includes(actualSC);
      newHistory.push({ ...currentWS, scResult: actualSC, isLevel4 });
    }
    return newHistory;
  };

  const toggleAntiChain = () => {
    const newMode = !antiChainMode;
    setAntiChainMode(newMode);
    setHistory(recalculateChain(history, newMode));
  };

  const addToChain = (wsName, weaponType) =>
    setHistory(
      recalculateChain(
        [...history, { name: wsName, weaponType }],
        antiChainMode,
      ),
    );

  const removeStep = (index) =>
    setHistory(
      recalculateChain(
        history.filter((_, i) => i !== index),
        antiChainMode,
      ),
    );

  const moveStep = (index, direction) => {
    const newHistoryRaw = [...history];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newHistoryRaw.length) return;
    [newHistoryRaw[index], newHistoryRaw[targetIndex]] = [
      newHistoryRaw[targetIndex],
      newHistoryRaw[index],
    ];
    setHistory(recalculateChain(newHistoryRaw, antiChainMode));
  };

  const generateBreadcrumb = (type) => {
    if (history.length === 0) return "";
    if (type === "simple") {
      const suffix = antiChainMode ? " ∅" : "";
      return history.map((s) => s.name).join(" > ") + suffix;
    }
    if (antiChainMode) return "";
    return history
      .map((s, i) =>
        i === 0
          ? s.name
          : `${s.name} (${s.scResult}${s.isLevel4 ? " Lv4" : ""})`,
      )
      .join(" > ");
  };

  const handleCopy = (type) => {
    let text = "";
    if (type === "all-safe") {
      const base = generateBreadcrumb("simple").replace(" ∅", "");
      const branches = getGroupedNextSteps()["SAFE_OPTIONS"] || [];
      text = branches.map((b) => `${base} > ${b.name} ∅`).join("\n");
    } else {
      text = generateBreadcrumb(type);
    }
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getGroupedNextSteps = () => {
    if (history.length === 0) {
      return {
        START_NODES: Object.keys(weaponskills[activeWeaponType] || {}).map(
          (name) => ({ name, weaponType: activeWeaponType, isPriority: true }),
        ),
      };
    }

    const lastStep = history[history.length - 1];
    const starterProps = lastStep
      ? lastStep.scResult
        ? [lastStep.scResult]
        : getWSProperties(lastStep.name, lastStep.weaponType)
      : null;

    const weaponsToEvaluate = multiPartyMode ? partySlots : [activeWeaponType];
    const groups = {};

    weaponsToEvaluate.forEach((wType) => {
      Object.keys(weaponskills[wType] || {}).forEach((wsName) => {
        const priorityResult = getGamePriorityResult(
          starterProps,
          wsName,
          wType,
        );

        if (antiChainMode) {
          if (priorityResult === null) {
            if (!groups["SAFE_OPTIONS"]) groups["SAFE_OPTIONS"] = [];
            groups["SAFE_OPTIONS"].push({
              name: wsName,
              weaponType: wType,
              isPriority: true,
            });
          }
        } else {
          const closerProps = getWSProperties(wsName, wType);
          const possibleResults = new Set();
          for (let s of starterProps) {
            for (let c of closerProps) {
              if (skillchains[s]?.[c]) possibleResults.add(skillchains[s][c]);
            }
          }
          possibleResults.forEach((res) => {
            if (!groups[res]) groups[res] = [];
            groups[res].push({
              name: wsName,
              weaponType: wType,
              isPriority: res === priorityResult,
            });
          });
        }
      });
    });

    const sortSkills = (a, b) => {
      if (a.weaponType !== b.weaponType) {
        return a.weaponType.localeCompare(b.weaponType);
      }
      return a.name.localeCompare(b.name);
    };

    Object.keys(groups).forEach((key) => {
      groups[key].sort(sortSkills);
    });

    return groups;
  };

  const removeFromParty = (weapon) => {
    const newParty = partySlots.filter((p) => p !== weapon);
    setPartySlots(newParty);
    if (activeWeaponType === weapon) setActiveWeaponType(newParty[0] || "");
  };

  const groupedNextSteps = getGroupedNextSteps();
  const isChainClosed =
    history.length > 0 && history[history.length - 1].isLevel4;

  const renderActionButtons = () => (
    <>
      <button
        onClick={() => setMultiPartyMode(!multiPartyMode)}
        style={{
          cursor: "pointer",
          background: multiPartyMode ? theme.accent : theme.itemBg,
          color: multiPartyMode ? theme.bg : theme.text,
          border: `1px solid ${theme.border}`,
          padding: "8px 12px",
          fontSize: "0.75rem",
          fontWeight: "bold",
          fontFamily: "monospace",
          width: isMobile ? "100%" : "auto",
        }}
      >
        {multiPartyMode ? "👥 PARTY_WEAPONS_ON" : "👤 SINGLE_WEAPON_ON"}
      </button>
      <button
        onClick={toggleAntiChain}
        style={{
          cursor: "pointer",
          background: antiChainMode ? theme.danger : theme.itemBg,
          color: antiChainMode ? "#fff" : theme.text,
          border: `1px solid ${antiChainMode ? theme.danger : theme.border}`,
          padding: "8px 12px",
          fontSize: "0.75rem",
          fontWeight: "bold",
          fontFamily: "monospace",
          width: isMobile ? "100%" : "auto",
        }}
      >
        {antiChainMode ? "Ø ANTI_MODE_ON" : "Ø ANTI_MODE_OFF"}
      </button>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          cursor: "pointer",
          background: theme.itemBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          padding: "8px 12px",
          fontSize: "0.75rem",
          fontFamily: "monospace",
          width: isMobile ? "100%" : "auto",
        }}
      >
        {darkMode ? "☀ LIGHT" : "🌙 DARK"}
      </button>
    </>
  );

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        minHeight: "100vh",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          padding: isMobile ? "1rem" : "2rem",
          maxWidth: "1100px",
          margin: "0 auto",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Navigation / Header Layout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `2px solid ${antiChainMode ? theme.danger : theme.accent}`,
            paddingBottom: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: isMobile ? "1.4rem" : "2rem", margin: 0 }}>
            {renderTitle()}
          </h1>

          {isMobile ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                cursor: "pointer",
                background: menuOpen ? theme.accent : theme.itemBg,
                color: menuOpen ? theme.bg : theme.text,
                border: `1px solid ${theme.border}`,
                padding: "6px 12px",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {menuOpen ? "[ × CLOSE ]" : "[ ☰ SETTINGS ]"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              {renderActionButtons()}
            </div>
          )}
        </div>

        {/* Mobile Settings Drawer */}
        {isMobile && menuOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: theme.cardBg,
              padding: "12px",
              border: `1px solid ${theme.border}`,
              marginBottom: "1.5rem",
            }}
          >
            {renderActionButtons()}
          </div>
        )}

        {/* Party Slot Configuration Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            marginBottom: "15px",
          }}
        >
          {partySlots.map((weapon) => (
            <div
              key={weapon}
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${theme.border}`,
                background:
                  activeWeaponType === weapon
                    ? antiChainMode
                      ? theme.danger
                      : theme.accent
                    : theme.itemBg,
              }}
            >
              <button
                onClick={() => setActiveWeaponType(weapon)}
                style={{
                  padding: isMobile ? "6px 10px" : "8px 15px",
                  fontSize: isMobile ? "0.7rem" : "0.85rem",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  background: "transparent",
                  color:
                    activeWeaponType === weapon
                      ? antiChainMode
                        ? "#fff"
                        : theme.bg
                      : theme.text,
                }}
              >
                {weapon.toUpperCase()}
              </button>
              <button
                onClick={() => removeFromParty(weapon)}
                style={{
                  padding: "0 6px",
                  border: "none",
                  background: "transparent",
                  color: theme.danger,
                  cursor: "pointer",
                  fontSize: isMobile ? "0.85rem" : "1rem",
                }}
              >
                ×
              </button>
            </div>
          ))}
          <select
            onChange={(e) => {
              if (e.target.value) {
                setPartySlots([...partySlots, e.target.value]);
                setActiveWeaponType(e.target.value);
              }
            }}
            value=""
            style={{
              padding: isMobile ? "6px" : "8px",
              fontSize: isMobile ? "0.7rem" : "0.85rem",
              fontFamily: "monospace",
              border: `1px dashed ${theme.border}`,
              background: theme.itemBg,
              color: theme.text,
            }}
          >
            <option value="" disabled>
              + ADD_WEAPON
            </option>
            {Object.keys(weaponskills).map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setHistory([])}
          style={{
            cursor: "pointer",
            border: `1px solid ${theme.border}`,
            background: theme.itemBg,
            color: theme.text,
            padding: "5px 10px",
            fontSize: "0.7rem",
            marginBottom: "2rem",
          }}
        >
          CLEAR ACTIVE CHAIN
        </button>

        {/* Core Processing Panel (Stacked on Mobile) */}
        <section
          style={{
            marginBottom: "3rem",
            background: theme.cardBg,
            padding: "15px",
            border: `1px solid ${darkMode ? "#333" : "#eee"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1, width: "100%" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: theme.muted,
                  marginBottom: "10px",
                }}
              >
                == Active Chain ==
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {history.length === 0 && (
                  <div style={{ color: theme.muted }}>- idle -</div>
                )}
                {history.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      gap: isMobile ? "6px" : "0px",
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? "100%" : "240px",
                        padding: "8px",
                        border: `1px solid ${darkMode ? "#444" : "#ddd"}`,
                        background: theme.itemBg,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.6rem", color: theme.muted }}>
                          {step.weaponType}
                        </div>
                        <div style={{ fontWeight: "bold" }}>{step.name}</div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => moveStep(i, -1)}
                          disabled={i === 0}
                          style={{
                            background: "transparent",
                            color: theme.text,
                            border: "none",
                            cursor: i === 0 ? "default" : "pointer",
                            opacity: i === 0 ? 0.2 : 1,
                          }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveStep(i, 1)}
                          disabled={i === history.length - 1}
                          style={{
                            background: "transparent",
                            color: theme.text,
                            border: "none",
                            cursor:
                              i === history.length - 1 ? "default" : "pointer",
                            opacity: i === history.length - 1 ? 0.2 : 1,
                          }}
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => removeStep(i)}
                          style={{
                            background: "transparent",
                            color: theme.danger,
                            border: "none",
                            cursor: "pointer",
                            marginLeft: "4px",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {i < history.length - 1 && (
                      <div
                        style={{
                          padding: isMobile ? "0 8px" : "0 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ color: darkMode ? "#444" : "#ccc" }}>
                          ▶
                        </span>
                        {antiChainMode ? (
                          <span
                            style={{ fontSize: "1.2rem", color: theme.muted }}
                          >
                            ∅
                          </span>
                        ) : (
                          <span
                            style={getStyleForElement(history[i + 1].scResult)}
                          >
                            {history[i + 1].scResult?.toUpperCase()}{" "}
                            {history[i + 1].isLevel4 ? "LV4" : ""}
                          </span>
                        )}
                        <span style={{ color: darkMode ? "#444" : "#ccc" }}>
                          ▶
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {history.length > 0 && (
              <div
                style={{
                  width: isMobile ? "100%" : "300px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: theme.muted }}>
                  == Export ==
                </div>
                <button
                  onClick={() => handleCopy("simple")}
                  style={{
                    textAlign: "left",
                    padding: "10px",
                    background: theme.itemBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontFamily: "monospace",
                  }}
                >
                  <div style={{ color: theme.muted, marginBottom: "4px" }}>
                    [ COPY_SIMPLE ] {copyFeedback === "simple" && "✓"}
                  </div>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {generateBreadcrumb("simple")}
                  </div>
                </button>
                {!antiChainMode && (
                  <button
                    onClick={() => handleCopy("detailed")}
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      background: theme.itemBg,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontFamily: "monospace",
                    }}
                  >
                    <div style={{ color: theme.muted, marginBottom: "4px" }}>
                      [ COPY_DETAILED ] {copyFeedback === "detailed" && "✓"}
                    </div>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {generateBreadcrumb("detailed")}
                    </div>
                  </button>
                )}
                {antiChainMode && (
                  <button
                    onClick={() => handleCopy("all-safe")}
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      background: theme.itemBg,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontFamily: "monospace",
                    }}
                  >
                    <div style={{ color: theme.muted, marginBottom: "4px" }}>
                      [ COPY_ALL_SAFE_FOLLOWUPS ]{" "}
                      {copyFeedback === "all-safe" && "✓"}
                    </div>
                    <div style={{ fontSize: "0.6rem" }}>
                      Generates multiline list of all ∅ options
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Branch Rendering (Accordions on Mobile) */}
        <section>
          <div
            style={{
              fontSize: "0.7rem",
              color: theme.muted,
              marginBottom: "1.5rem",
            }}
          >
            == {antiChainMode ? "SAFETY BRANCHES (ZERO LINK)" : "BRANCH SKILLS"}{" "}
            ==
          </div>
          {!isChainClosed ? (
            Object.entries(groupedNextSteps).map(([element, skills]) => {
              const isSectionOpen = !isMobile || !!expandedSections[element];

              return (
                <div key={element} style={{ marginBottom: "1.5rem" }}>
                  <div
                    onClick={() => isMobile && toggleSection(element)}
                    style={{
                      marginBottom: "12px",
                      cursor: isMobile ? "pointer" : "default",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isMobile ? theme.cardBg : "transparent",
                      padding: isMobile ? "10px" : "0",
                      border: isMobile ? `1px solid ${theme.border}` : "none",
                    }}
                  >
                    <div>
                      {antiChainMode ? (
                        <span
                          style={{
                            border: `1px solid ${theme.muted}`,
                            padding: "4px 10px",
                            color: theme.muted,
                          }}
                        >
                          SAFE_OPTIONS
                        </span>
                      ) : element !== "START_NODES" ? (
                        <span
                          style={getStyleForElement(
                            element,
                            !skills.some((s) => s.isPriority),
                          )}
                        >
                          {element.toUpperCase()}
                        </span>
                      ) : (
                        <span style={{ color: theme.muted }}>
                          STARTING WEAPON SKILLS ({activeWeaponType.toUpperCase()})
                        </span>
                      )}
                    </div>
                    {isMobile && (
                      <span style={{ fontSize: "0.8rem", color: theme.muted }}>
                        {isSectionOpen ? "[ - COLLAPSE ]" : `[ + EXPAND (${skills.length}) ]`}
                      </span>
                    )}
                  </div>

                  {isSectionOpen && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      {skills.map((ws, idx) => {
                        const hasPartyHeader = multiPartyMode && history.length > 0;
                        return (
                          <button
                            key={`${ws.weaponType}-${ws.name}-${idx}`}
                            onClick={() =>
                              ws.isPriority && addToChain(ws.name, ws.weaponType)
                            }
                            style={{
                              position: "relative",
                              padding: "12px",
                              paddingTop: hasPartyHeader ? "24px" : "12px",
                              background: theme.itemBg,
                              color: theme.text,
                              border: ws.isPriority
                                ? `2px solid ${antiChainMode ? theme.danger : theme.accent}`
                                : `1px solid ${theme.border}`,
                              cursor: ws.isPriority ? "pointer" : "not-allowed",
                              fontFamily: "monospace",
                              textAlign: "left",
                              width: isMobile ? "100%" : "165px",
                              boxSizing: "border-box",
                              boxShadow: ws.isPriority
                                ? `4px 4px 0px ${antiChainMode ? theme.danger : theme.accent}`
                                : "none",
                              opacity: ws.isPriority ? 1 : 0.4,
                            }}
                          >
                            {hasPartyHeader && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "6px",
                                  right: "8px",
                                  fontSize: "0.75rem",
                                  color: ws.isPriority
                                    ? antiChainMode
                                      ? theme.danger
                                      : "#b388ff"
                                    : theme.muted,
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                }}
                              >
                                [{ws.weaponType}]
                              </div>
                            )}
                            <strong>{ws.name}</strong>
                            <div
                              style={{
                                fontSize: "0.6rem",
                                color: theme.muted,
                                marginTop: "4px",
                              }}
                            >
                              {getWSProperties(ws.name, ws.weaponType).join(" • ")}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "40px",
                border: "1px solid #e74c3c",
                color: "#e74c3c",
                textAlign: "center",
                background: theme.itemBg,
              }}
            >
              [ CHAIN_TERMINATED ]
            </div>
          )}
        </section>
      </div>
      <footer
        style={{
          padding: "2rem",
          textAlign: "center",
          borderTop: `1px solid ${theme.border}`,
          background: theme.bg,
        }}
      >
        <a
          href="https://www.buymeacoffee.com/zephrose"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: theme.muted,
            fontSize: "0.7rem",
            fontFamily: "monospace",
            border: `1px solid ${theme.border}`,
            padding: "5px 15px",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = theme.text)}
          onMouseOut={(e) => (e.currentTarget.style.color = theme.muted)}
        >
          [ ☕ BUY_A_COFFEE ]
        </a>
      </footer>
    </div>
  );
}

export default App;