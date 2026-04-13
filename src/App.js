import React, { useState } from "react";
import { weaponskills, skillchains } from "./data";

const ELEMENT_COLORS = {
  Dark: "#000000",
  Light: "#f9ca24",
  Ice: "#a2e4f1",
  Water: "#2980b9",
  Earth: "#8b4513",
  Wind: "#2ecc71",
  Fire: "#ff4757",
  Lightning: "#a29bfe",
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
    "Hand-to-Hand",
    "Dagger",
    "Sword",
  ]);
  const [activeWeaponType, setActiveWeaponType] = useState("Hand-to-Hand");
  const [darkMode, setDarkMode] = useState(true);

  // Theme Constants
  const theme = {
    bg: darkMode ? "#121212" : "#fff",
    text: darkMode ? "#e0e0e0" : "#333",
    border: darkMode ? "#444" : "#333",
    cardBg: darkMode ? "#1e1e1e" : "#fcfcfc",
    itemBg: darkMode ? "#2c2c2c" : "#fff",
    accent: darkMode ? "#e0e0e0" : "#333",
    muted: darkMode ? "#777" : "#aaa",
  };

  const getStyleForElement = (element, isInactive = false) => {
    const config = ELEMENT_MAP[element];
    if (!config) return { backgroundColor: theme.itemBg, color: theme.text };
    const baseStyle = {
      color:
        element === "Light" ||
        element === "Transfixion" ||
        element === "Wind" ||
        element === "Ice"
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

  const addToChain = (wsName, weaponType) => {
    const lastStep = history[history.length - 1];
    const starterProps = lastStep
      ? lastStep.scResult
        ? [lastStep.scResult]
        : getWSProperties(lastStep.name, lastStep.weaponType)
      : null;
    const actualSC = getGamePriorityResult(starterProps, wsName, weaponType);
    const isLevel4 =
      history.length > 0 &&
      history[history.length - 1].scResult === actualSC &&
      (actualSC === "Light" || actualSC === "Darkness");
    setHistory([
      ...history,
      { name: wsName, weaponType, scResult: actualSC, isLevel4 },
    ]);
  };

  const getGroupedNextSteps = () => {
    const lastStep = history[history.length - 1];
    const starterProps = lastStep
      ? lastStep.scResult
        ? [lastStep.scResult]
        : getWSProperties(lastStep.name, lastStep.weaponType)
      : null;

    if (history.length === 0)
      return {
        START_NODES: Object.keys(weaponskills[activeWeaponType] || {}).map(
          (name) => ({ name, isPriority: true }),
        ),
      };

    const groups = {};
    Object.keys(weaponskills[activeWeaponType] || {}).forEach((wsName) => {
      const priorityResult = getGamePriorityResult(
        starterProps,
        wsName,
        activeWeaponType,
      );

      const closerProps = getWSProperties(wsName, activeWeaponType);
      const possibleResults = new Set();
      for (let s of starterProps) {
        for (let c of closerProps) {
          if (skillchains[s]?.[c]) possibleResults.add(skillchains[s][c]);
        }
      }

      possibleResults.forEach((res) => {
        if (!groups[res]) groups[res] = [];
        groups[res].push({ name: wsName, isPriority: res === priorityResult });
      });
    });
    return groups;
  };

  const removeFromParty = (weapon) => {
    const newParty = partySlots.filter((p) => p !== weapon);
    setPartySlots(newParty);
    if (activeWeaponType === weapon) {
      setActiveWeaponType(newParty[0] || "");
    }
  };

  const groupedNextSteps = getGroupedNextSteps();
  const isChainClosed =
    history.length > 0 && history[history.length - 1].isLevel4;

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        minHeight: "100vh",
        transition: "background-color 0.2s ease",
      }}
    >
      <div
        style={{
          padding: "2rem",
          maxWidth: "1100px",
          margin: "0 auto",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            position: "absolute",
            top: "2rem",
            right: "2rem",
            cursor: "pointer",
            background: theme.itemBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            padding: "5px 10px",
            fontSize: "0.7rem",
          }}
        >
          {darkMode ? "☀ LIGHT_MODE" : "🌙 DARK_MODE"}
        </button>

        <header
          style={{
            borderBottom: `2px solid ${theme.accent}`,
            marginBottom: "2rem",
          }}
        >
          <h1>Gnovi's Chains</h1>
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
                    activeWeaponType === weapon ? theme.accent : theme.itemBg,
                }}
              >
                <button
                  onClick={() => setActiveWeaponType(weapon)}
                  style={{
                    padding: "8px 15px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    background: "transparent",
                    color: activeWeaponType === weapon ? theme.bg : theme.text,
                  }}
                >
                  {weapon.toUpperCase()}
                </button>
                <button
                  onClick={() => removeFromParty(weapon)}
                  style={{
                    padding: "8px 5px",
                    border: "none",
                    background: "transparent",
                    color: "#ff4757",
                    cursor: "pointer",
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
                padding: "8px",
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
              marginBottom: "10px",
            }}
          >
            CLEAR ACTIVE CHAIN
          </button>
        </header>

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
              fontSize: "0.7rem",
              color: theme.muted,
              marginBottom: "10px",
            }}
          >
            == Active Chain ==
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {history.length === 0 && (
              <div style={{ color: theme.muted }}>- idle -</div>
            )}
            {history.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "200px",
                    padding: "8px",
                    border: `1px solid ${darkMode ? "#444" : "#ddd"}`,
                    background: theme.itemBg,
                  }}
                >
                  <div style={{ fontSize: "0.6rem", color: theme.muted }}>
                    {step.weaponType}
                  </div>
                  <div style={{ fontWeight: "bold" }}>{step.name}</div>
                </div>
                {step.scResult && (
                  <div
                    style={{
                      padding: "0 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: darkMode ? "#444" : "#ccc" }}>▶</span>
                    <span style={getStyleForElement(step.scResult)}>
                      {step.scResult.toUpperCase()} {step.isLevel4 ? "LV4" : ""}
                    </span>
                    <span style={{ color: darkMode ? "#444" : "#ccc" }}>▶</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div
            style={{
              fontSize: "0.7rem",
              color: theme.muted,
              marginBottom: "1.5rem",
            }}
          >
            == BRANCH SKILLS ==
          </div>
          {!isChainClosed ? (
            Object.entries(groupedNextSteps).map(([element, skills]) => {
              const hasPriority = skills.some((s) => s.isPriority);
              return (
                <div key={element} style={{ marginBottom: "2rem" }}>
                  <div style={{ marginBottom: "12px" }}>
                    {element !== "START_NODES" ? (
                      <span style={getStyleForElement(element, !hasPriority)}>
                        {element.toUpperCase()}
                      </span>
                    ) : (
                      <span style={{ color: theme.muted }}>
                        STARTING WEAPON SKILLS
                      </span>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
                  >
                    {skills.map((ws, idx) => (
                      <button
                        key={`${ws.name}-${idx}`}
                        onClick={() =>
                          ws.isPriority && addToChain(ws.name, activeWeaponType)
                        }
                        style={{
                          padding: "12px",
                          background: theme.itemBg,
                          color: theme.text,
                          border: ws.isPriority
                            ? `2px solid ${theme.accent}`
                            : `1px solid ${darkMode ? "#333" : "#eee"}`,
                          cursor: ws.isPriority ? "pointer" : "not-allowed",
                          fontFamily: "monospace",
                          textAlign: "left",
                          minWidth: "150px",
                          boxShadow: ws.isPriority
                            ? `4px 4px 0px ${theme.accent}`
                            : "none",
                          opacity: ws.isPriority ? 1 : 0.4,
                          transform: ws.isPriority ? "none" : "scale(0.95)",
                          pointerEvents: ws.isPriority ? "auto" : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                          }}
                        >
                          <strong>{ws.name}</strong>
                        </div>
                        <div
                          style={{
                            fontSize: "0.6rem",
                            color: theme.muted,
                            marginTop: "4px",
                          }}
                        >
                          {getWSProperties(ws.name, activeWeaponType).join(
                            " • ",
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
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
    </div>
  );
}

export default App;
