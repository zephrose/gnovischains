import React, { useState, useEffect, useRef } from "react";
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

const SKILLCHAIN_ELEMENTS = {
  Liquefaction: ["Fire"],
  Induration: ["Ice"],
  Detonation: ["Wind"],
  Scission: ["Earth"],
  Impaction: ["Lightning"],
  Reverberation: ["Water"],
  Transfixion: ["Light"],
  Compression: ["Dark"],
  Fusion: ["Fire", "Light"],
  Distortion: ["Ice", "Water"],
  Fragmentation: ["Wind", "Lightning"],
  Gravitation: ["Earth", "Dark"],
  Light: ["Light", "Fire", "Wind", "Lightning"],
  Darkness: ["Dark", "Earth", "Water", "Ice"],
};

const ELEMENT_CONFIG = [
  { key: "Fire", label: "FIRE", icon: "🔥", color: ELEMENT_COLORS.Fire, textColor: "#fff" },
  { key: "Ice", label: "ICE", icon: "❄️", color: ELEMENT_COLORS.Ice, textColor: "#000" },
  { key: "Wind", label: "WIND", icon: "🌪️", color: ELEMENT_COLORS.Wind, textColor: "#000" },
  { key: "Earth", label: "EARTH (STONE)", icon: "🪨", color: ELEMENT_COLORS.Earth, textColor: "#fff" },
  { key: "Lightning", label: "LIGHTNING", icon: "⚡", color: ELEMENT_COLORS.Lightning, textColor: "#000" },
  { key: "Water", label: "WATER", icon: "💧", color: ELEMENT_COLORS.Water, textColor: "#fff" },
  { key: "Light", label: "LIGHT", icon: "✨", color: ELEMENT_COLORS.Light, textColor: "#000" },
  { key: "Dark", label: "DARK", icon: "🌑", color: ELEMENT_COLORS.Dark, textColor: "#fff" },
];

// --- PURE GRAPH UTILITIES ---
const getWSProperties = (wsName, weaponCategory) =>
  weaponskills[weaponCategory]?.[wsName] || [];

const getGamePriorityResult = (starterProps, closerName, closerWeaponType) => {
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

const ALL_WEAPONSKILLS = [];
for (const [wType, skills] of Object.entries(weaponskills)) {
  for (const wsName of Object.keys(skills)) {
    ALL_WEAPONSKILLS.push({ name: wsName, weaponType: wType });
  }
}

const SURVIVAL_FLOWS = [
  {
    id: "light-cap-gk",
    name: "Samurai Light to Radiance (Great Katana)",
    description: "Tachi: Yukikaze → Tachi: Koki (Fragmentation) → Tachi: Kasha (Light Lv3) → Tachi: Fudo (Radiance Lv4)",
    category: "Level 4 Radiance Cap",
    opener: { name: "Tachi: Yukikaze", weaponType: "Great Katana" },
    steps: [
      { name: "Tachi: Koki", weaponType: "Great Katana", scResult: "Fragmentation" },
      { name: "Tachi: Kasha", weaponType: "Great Katana", scResult: "Light (Lv3)" },
      { name: "Tachi: Fudo", weaponType: "Great Katana", scResult: "Light (Lv4 Radiance)", isFinisher: true },
    ],
  },
  {
    id: "darkness-cap-katana",
    name: "Ninja Darkness to Umbra (Katana)",
    description: "Blade: Hi → Blade: Metsu (Darkness Lv3) → Blade: Hi (Umbra Lv4)",
    category: "Level 4 Umbra Cap",
    opener: { name: "Blade: Hi", weaponType: "Katana" },
    steps: [
      { name: "Blade: Metsu", weaponType: "Katana", scResult: "Darkness (Lv3)" },
      { name: "Blade: Hi", weaponType: "Katana", scResult: "Darkness (Lv4 Umbra)", isFinisher: true },
    ],
  },
  {
    id: "light-cap-sword",
    name: "Paladin Holy Radiance (Sword)",
    description: "Fast Blade → Burning Blade (Liquefaction) → Flat Blade (Fusion) → Savage Blade (Light Lv3) → Knights of Round (Radiance Lv4)",
    category: "Level 4 Radiance Cap",
    opener: { name: "Fast Blade", weaponType: "Sword" },
    steps: [
      { name: "Burning Blade", weaponType: "Sword", scResult: "Liquefaction" },
      { name: "Flat Blade", weaponType: "Sword", scResult: "Fusion" },
      { name: "Savage Blade", weaponType: "Sword", scResult: "Light (Lv3)" },
      { name: "Knights of Round", weaponType: "Sword", scResult: "Light (Lv4 Radiance)", isFinisher: true },
    ],
  },
  {
    id: "light-cap-h2h",
    name: "Monk Cosmic Fist to Radiance (Hand-to-Hand)",
    description: "Combo → Backhand Blow (Detonation) → One Inch Punch (Gravitation) → Dragon Kick (Fragmentation) → Final Heaven (Light Lv3) → Victory Smite (Radiance Lv4)",
    category: "Level 4 Radiance Cap",
    opener: { name: "Combo", weaponType: "Hand-to-Hand" },
    steps: [
      { name: "Backhand Blow", weaponType: "Hand-to-Hand", scResult: "Detonation" },
      { name: "One Inch Punch", weaponType: "Hand-to-Hand", scResult: "Gravitation" },
      { name: "Dragon Kick", weaponType: "Hand-to-Hand", scResult: "Fragmentation" },
      { name: "Final Heaven", weaponType: "Hand-to-Hand", scResult: "Light (Lv3)" },
      { name: "Victory Smite", weaponType: "Hand-to-Hand", scResult: "Light (Lv4 Radiance)", isFinisher: true },
    ],
  },
  {
    id: "darkness-cap-marksmanship",
    name: "Corsair Shadow to Umbra (Marksmanship)",
    description: "Slug Shot → Trueflight (Distortion) → Wildfire (Darkness Lv3) → Coronach (Umbra Lv4)",
    category: "Level 4 Umbra Cap",
    opener: { name: "Slug Shot", weaponType: "Marksmanship" },
    steps: [
      { name: "TruefLight", weaponType: "Marksmanship", scResult: "Distortion" },
      { name: "Wildfire", weaponType: "Marksmanship", scResult: "Darkness (Lv3)" },
      { name: "Coronach", weaponType: "Marksmanship", scResult: "Darkness (Lv4 Umbra)", isFinisher: true },
    ],
  },
  {
    id: "level2-rotation-sword",
    name: "Sword Level 2 Resonance Cycle (Sword)",
    description: "Fast Blade II → Swift Blade (Gravitation) → Savage Blade (Fragmentation) → Expiacion (Distortion) → Atonement (Fusion) → Swift Blade (Gravitation)",
    category: "Level 2 Four-Property Rotation",
    opener: { name: "Fast Blade II", weaponType: "Sword" },
    steps: [
      { name: "Swift Blade", weaponType: "Sword", scResult: "Gravitation" },
      { name: "Savage Blade", weaponType: "Sword", scResult: "Fragmentation" },
      { name: "Expiacion", weaponType: "Sword", scResult: "Distortion" },
      { name: "Atonement", weaponType: "Sword", scResult: "Fusion" },
      { name: "Swift Blade", weaponType: "Sword", scResult: "Gravitation", isFinisher: true },
    ],
  },
  {
    id: "level2-rotation-h2h",
    name: "Monk Level 2 Resonance Cycle (Hand-to-Hand)",
    description: "Final Heaven → Asuran Fists (Gravitation) → Dragon Kick (Fragmentation) → Dragon Blow (Distortion) → Shijin Spiral (Fusion) → Asuran Fists (Gravitation)",
    category: "Level 2 Four-Property Rotation",
    opener: { name: "Final Heaven", weaponType: "Hand-to-Hand" },
    steps: [
      { name: "Asuran Fists", weaponType: "Hand-to-Hand", scResult: "Gravitation" },
      { name: "Dragon Kick", weaponType: "Hand-to-Hand", scResult: "Fragmentation" },
      { name: "Dragon Blow", weaponType: "Hand-to-Hand", scResult: "Distortion" },
      { name: "Shijin Spiral", weaponType: "Hand-to-Hand", scResult: "Fusion" },
      { name: "Asuran Fists", weaponType: "Hand-to-Hand", scResult: "Gravitation", isFinisher: true },
    ],
  },
  {
    id: "level1-transfixion-compression",
    name: "Dragoon Piercing Cycle (Polearm)",
    description: "Double Thrust ⇄ Penta Thrust (Transfixion ↔ Compression Lv1 Loop up to 5-step cap)",
    category: "Level 1 Oscillation",
    opener: { name: "Double Thrust", weaponType: "Polearm" },
    steps: [
      { name: "Penta Thrust", weaponType: "Polearm", scResult: "Compression" },
      { name: "Double Thrust", weaponType: "Polearm", scResult: "Transfixion" },
      { name: "Penta Thrust", weaponType: "Polearm", scResult: "Compression" },
      { name: "Double Thrust", weaponType: "Polearm", scResult: "Transfixion" },
      { name: "Penta Thrust", weaponType: "Polearm", scResult: "Compression", isFinisher: true },
    ],
  },
  {
    id: "level1-scission-detonation",
    name: "Thief Shadow Step (Dagger)",
    description: "Wasp Sting ⇄ Gust Slash (Detonation ↔ Scission Lv1 Loop up to 5-step cap)",
    category: "Level 1 Oscillation",
    opener: { name: "Wasp Sting", weaponType: "Dagger" },
    steps: [
      { name: "Gust Slash", weaponType: "Dagger", scResult: "Detonation" },
      { name: "Wasp Sting", weaponType: "Dagger", scResult: "Scission" },
      { name: "Gust Slash", weaponType: "Dagger", scResult: "Detonation" },
      { name: "Wasp Sting", weaponType: "Dagger", scResult: "Scission" },
      { name: "Gust Slash", weaponType: "Dagger", scResult: "Detonation", isFinisher: true },
    ],
  },
  {
    id: "level1-liquefaction-scission",
    name: "Sword Blade Flame & Earth (Sword)",
    description: "Burning Blade ⇄ Fast Blade (Liquefaction ↔ Scission Lv1 Loop up to 5-step cap)",
    category: "Level 1 Oscillation",
    opener: { name: "Burning Blade", weaponType: "Sword" },
    steps: [
      { name: "Fast Blade", weaponType: "Sword", scResult: "Scission" },
      { name: "Burning Blade", weaponType: "Sword", scResult: "Liquefaction" },
      { name: "Fast Blade", weaponType: "Sword", scResult: "Scission" },
      { name: "Burning Blade", weaponType: "Sword", scResult: "Liquefaction" },
      { name: "Fast Blade", weaponType: "Sword", scResult: "Scission", isFinisher: true },
    ],
  },
];

const getTimingWindow = (stepIndex) => {
  if (stepIndex === 0) {
    return {
      seconds: 10,
      label: "TIME REMAINING: 10 SECONDS",
      description: "WS 1 to WS 2: 10 seconds to close the SC.",
      subtext: "4-second pause window elapsed. Active link window is open!",
    };
  }
  if (stepIndex === 1) {
    return {
      seconds: 7,
      label: "TIME REMAINING: 7 SECONDS",
      description: "WS 2 to WS 3: 7 seconds to close the SC.",
      subtext: "Active window is shrinking!",
    };
  }
  if (stepIndex === 2) {
    return {
      seconds: 4,
      label: "TIME REMAINING: 4 SECONDS",
      description: "WS 3 to WS 4: 4 seconds to close the SC.",
      subtext: "High-speed chain execution required!",
    };
  }
  return {
    seconds: 3,
    label: "TIME REMAINING: 3 SECONDS",
    description: `WS ${stepIndex + 1} to WS ${stepIndex + 2} (WS 4+): 3 seconds to close the SC.`,
    subtext: "Maximum urgency! Chain sustain window is razor-thin!",
  };
};

const getIncorrectOptions = (correctWS, starterProps, count = 2) => {
  const pool = ALL_WEAPONSKILLS.filter(
    (w) => w.name.toLowerCase() !== correctWS.name.toLowerCase(),
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = [];

  for (const candidate of shuffled) {
    const sc = starterProps
      ? getGamePriorityResult(starterProps, candidate.name, candidate.weaponType)
      : null;
    if (sc === null) {
      picked.push(candidate);
      if (picked.length === count) break;
    }
  }

  if (picked.length < count) {
    for (const candidate of shuffled) {
      if (!picked.some((p) => p.name === candidate.name)) {
        picked.push(candidate);
        if (picked.length === count) break;
      }
    }
  }

  return picked;
};

const generateSurvivalTurn = (
  flow,
  flowStepIndex,
  streak,
  prevWS,
  prevSC,
) => {
  const step = flow.steps[flowStepIndex];
  const correctWS = { name: step.name, weaponType: step.weaponType };
  const resultingSC = step.scResult;
  const isFinisher = flowStepIndex === flow.steps.length - 1;

  const starterProps =
    flowStepIndex === 0
      ? getWSProperties(flow.opener.name, flow.opener.weaponType)
      : prevSC && prevSC !== "None (Opener Initiated)"
        ? [prevSC.replace(/ \(Lv\d[^)]*\)/, "").trim()]
        : getWSProperties(prevWS?.name, prevWS?.weaponType);

  const incorrect = getIncorrectOptions(correctWS, starterProps, 2);

  const rawOptions = [
    {
      name: correctWS.name,
      weaponType: correctWS.weaponType,
      isCorrect: true,
      scResult: resultingSC,
    },
    {
      name: incorrect[0].name,
      weaponType: incorrect[0].weaponType,
      isCorrect: false,
    },
    {
      name: incorrect[1].name,
      weaponType: incorrect[1].weaponType,
      isCorrect: false,
    },
  ];

  const shuffledOptions = [...rawOptions].sort(() => Math.random() - 0.5);
  const optionsWithKeys = shuffledOptions.map((opt, idx) => ({
    ...opt,
    keyLabel: ["A", "B", "C"][idx],
  }));

  const timing = getTimingWindow(flowStepIndex);

  return {
    turnNumber: streak + 1,
    flowStepIndex,
    isFinisher,
    previousWS: flowStepIndex === 0 ? flow.opener : prevWS,
    previousSC: flowStepIndex === 0 ? "None (Opener Initiated)" : prevSC,
    timing,
    options: optionsWithKeys,
    correctOption: correctWS,
    resultingSC,
  };
};

function App() {
  const [viewMode, setViewMode] = useState("calculator");
  const [history, setHistory] = useState([]);
  const [partySlots, setPartySlots] = useState([
    "Hand-to-Hand",
    "Sword",
    "Club",
    "Dagger",
    "Marksmanship",
  ]);
  const [activeWeaponType, setActiveWeaponType] = useState("Hand-to-Hand");
  const [darkMode, setDarkMode] = useState(true);
  const [antiChainMode, setAntiChainMode] = useState(false);
  const [multiPartyMode, setMultiPartyMode] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [activeElements, setActiveElements] = useState({
    Fire: true,
    Ice: true,
    Wind: true,
    Earth: true,
    Lightning: true,
    Water: true,
    Light: true,
    Dark: true,
  });

  const toggleElement = (elKey) => {
    setActiveElements((prev) => ({
      ...prev,
      [elKey]: !prev[elKey],
    }));
  };

  const selectAllElements = () => {
    setActiveElements({
      Fire: true,
      Ice: true,
      Wind: true,
      Earth: true,
      Lightning: true,
      Water: true,
      Light: true,
      Dark: true,
    });
  };

  const clearAllElements = () => {
    setActiveElements({
      Fire: false,
      Ice: false,
      Wind: false,
      Earth: false,
      Lightning: false,
      Water: false,
      Light: false,
      Dark: false,
    });
  };

  // Responsive Layout Toggles
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // FFXI Skillchain Survival Game Engine States
  const [survivalStatus, setSurvivalStatus] = useState("PLAYING"); // "PLAYING", "GAME_OVER", "COMPLETED"
  const [survivalFlowId, setSurvivalFlowId] = useState("random");
  const [activeSurvivalFlow, setActiveSurvivalFlow] = useState(null);
  const [survivalStreak, setSurvivalStreak] = useState(0);
  const [survivalHighScore, setSurvivalHighScore] = useState(() => {
    try {
      return (
        parseInt(localStorage.getItem("gnovis_survival_highscore") || "0", 10) || 0
      );
    } catch (e) {
      return 0;
    }
  });
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [survivalLog, setSurvivalLog] = useState([]);
  const [gameOverData, setGameOverData] = useState(null);
  const [timerPhase, setTimerPhase] = useState("PAUSE"); // "PAUSE", "ACTIVE"
  const [timeRemaining, setTimeRemaining] = useState(4.0);
  const [earlyWarning, setEarlyWarning] = useState(null);

  const phaseRef = useRef("PAUSE");
  const phaseDurationRef = useRef(4.0);
  const phaseStartRef = useRef(Date.now());

  const skipPauseWindow = React.useCallback(() => {
    if (timerPhase !== "PAUSE" || survivalStatus !== "PLAYING" || !currentTurn) return;
    phaseRef.current = "ACTIVE";
    phaseDurationRef.current = currentTurn.timing.seconds;
    phaseStartRef.current = Date.now();
    setTimerPhase("ACTIVE");
    setTimeRemaining(currentTurn.timing.seconds);
    setEarlyWarning(null);
  }, [timerPhase, survivalStatus, currentTurn]);

  const handleSurvivalTimeout = React.useCallback(() => {
    if (survivalStatus !== "PLAYING" || !currentTurn) return;
    setSurvivalStatus("GAME_OVER");
    const beatHigh =
      survivalStreak > 0 &&
      (isNewRecord || survivalStreak > survivalHighScore);
    setGameOverData({
      reason: "TIMEOUT",
      chosen: null,
      required: currentTurn.correctOption,
      streak: survivalStreak,
      beatHigh,
      resultingSC: currentTurn.resultingSC,
      previousWS: currentTurn.previousWS,
    });
    setSurvivalLog((prev) => [
      ...prev,
      {
        turn: currentTurn.turnNumber,
        type: "FAIL",
        text: `Turn ${currentTurn.turnNumber}: ⏱️ TIME EXPIRED! Active skillchain window closed before a Weapon Skill was executed! Required WS was ${currentTurn.correctOption.name}. Final Streak: ${survivalStreak}`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }, [
    survivalStatus,
    currentTurn,
    survivalStreak,
    isNewRecord,
    survivalHighScore,
  ]);

  useEffect(() => {
    const handleResize = () => {
      window.innerWidth <= 768 ? setIsMobile(true) : setIsMobile(false);
    };
    handleResize();
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
    muted: darkMode ? "#999" : "#777",
    danger: "#ff4757",
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStyleForElement = (element, isInactive = false) => {
    const config = ELEMENT_MAP[element];
    if (!config) return { backgroundColor: theme.itemBg, color: theme.text };
    const baseStyle = {
      color: ["Light", "Transfixion", "Wind", "Ice"].includes(element)
        ? "#000"
        : "#fff",
      padding: "4px 8px",
      borderRadius: "2px",
      fontWeight: "bold",
      display: "inline-block",
      fontSize: "0.9rem",
      opacity: isInactive ? 0.3 : 1,
    };
    return config.type === "solid"
      ? { ...baseStyle, backgroundColor: config.color }
      : {
        ...baseStyle,
        background: `linear-gradient(135deg, ${config.colors[0]} 0%, ${config.colors[1]} 100%)`,
      };
  };

  const initSurvivalGame = React.useCallback(
    (flowId = survivalFlowId, initialStreak = 0) => {
      let targetFlow;
      if (flowId === "random") {
        targetFlow =
          SURVIVAL_FLOWS[Math.floor(Math.random() * SURVIVAL_FLOWS.length)];
      } else {
        targetFlow =
          SURVIVAL_FLOWS.find((f) => f.id === flowId) || SURVIVAL_FLOWS[0];
      }

      setActiveSurvivalFlow(targetFlow);
      setSurvivalStreak(initialStreak);
      setIsNewRecord(false);
      setSurvivalStatus("PLAYING");
      setGameOverData(null);
      setEarlyWarning(null);

      const initialTurn = generateSurvivalTurn(
        targetFlow,
        0,
        initialStreak,
        targetFlow.opener,
        null,
      );
      setCurrentTurn(initialTurn);

      phaseRef.current = "PAUSE";
      phaseDurationRef.current = 4.0;
      phaseStartRef.current = Date.now();
      setTimerPhase("PAUSE");
      setTimeRemaining(4.0);

      const isContinuing = initialStreak > 0;
      setSurvivalLog((prev) => [
        ...(isContinuing ? prev : []),
        {
          turn: initialStreak,
          type: "SYSTEM",
          text: `[GAME MASTER] Survival arena initialized with sequence: "${targetFlow.name}" (${targetFlow.category})!`,
          time: new Date().toLocaleTimeString(),
        },
        {
          turn: initialStreak,
          type: "OPENER",
          text: `[OPENER] Opener deployed: ${targetFlow.opener.name} (${targetFlow.opener.weaponType}). 4-second pause window active!`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    },
    [survivalFlowId],
  );

  const handleSurvivalChoice = React.useCallback(
    (chosenOpt) => {
      if (survivalStatus !== "PLAYING" || !currentTurn || !activeSurvivalFlow)
        return;

      if (timerPhase === "PAUSE") {
        setEarlyWarning(
          `⚠️ TOO EARLY! Active link window opens in ${timeRemaining.toFixed(1)}s (4s pause window active)!`,
        );
        return;
      }

      if (chosenOpt.isCorrect) {
        const nextStreak = survivalStreak + 1;
        let newRecord = isNewRecord;
        if (nextStreak > survivalHighScore) {
          setSurvivalHighScore(nextStreak);
          setIsNewRecord(true);
          newRecord = true;
          try {
            localStorage.setItem(
              "gnovis_survival_highscore",
              String(nextStreak),
            );
          } catch (e) {}
        }

        setSurvivalStreak(nextStreak);

        // Check if this step was the finisher of the sequence!
        if (currentTurn.isFinisher) {
          setSurvivalStatus("COMPLETED");
          const beatHigh =
            nextStreak > 0 &&
            (newRecord || nextStreak > survivalHighScore);
          setGameOverData({
            reason: "COMPLETED",
            chosen: chosenOpt,
            required: currentTurn.correctOption,
            streak: nextStreak,
            beatHigh,
            resultingSC: currentTurn.resultingSC,
            previousWS: currentTurn.previousWS,
            flowName: activeSurvivalFlow.name,
            flowCategory: activeSurvivalFlow.category,
            stepsCompleted: activeSurvivalFlow.steps.length,
          });

          setSurvivalLog((prev) => [
            ...prev,
            {
              turn: currentTurn.turnNumber,
              type: "SUCCESS",
              text: `Turn ${currentTurn.turnNumber}: >> ${chosenOpt.name} (${chosenOpt.weaponType}) connected! Skillchain: ${currentTurn.resultingSC}! [Streak: ${nextStreak}] — 🏆 SEQUENCE COMPLETED!`,
              time: new Date().toLocaleTimeString(),
            },
          ]);
          return;
        }

        setSurvivalLog((prev) => [
          ...prev,
          {
            turn: currentTurn.turnNumber,
            type: "SUCCESS",
            text: `Turn ${currentTurn.turnNumber}: >> ${chosenOpt.name} (${chosenOpt.weaponType}) connected! Skillchain: ${currentTurn.resultingSC}! [Streak: ${nextStreak}]`,
            time: new Date().toLocaleTimeString(),
          },
        ]);

        const nextTurn = generateSurvivalTurn(
          activeSurvivalFlow,
          currentTurn.flowStepIndex + 1,
          nextStreak,
          { name: chosenOpt.name, weaponType: chosenOpt.weaponType },
          currentTurn.resultingSC,
        );
        setCurrentTurn(nextTurn);

        // Reset timer to PAUSE 4s for next step
        phaseRef.current = "PAUSE";
        phaseDurationRef.current = 4.0;
        phaseStartRef.current = Date.now();
        setTimerPhase("PAUSE");
        setTimeRemaining(4.0);
        setEarlyWarning(null);
      } else {
        setSurvivalStatus("GAME_OVER");
        const beatHigh =
          survivalStreak > 0 &&
          (isNewRecord || survivalStreak > survivalHighScore);
        setGameOverData({
          reason: "FAIL",
          chosen: chosenOpt,
          required: currentTurn.correctOption,
          streak: survivalStreak,
          beatHigh,
          resultingSC: currentTurn.resultingSC,
          previousWS: currentTurn.previousWS,
        });
        setSurvivalLog((prev) => [
          ...prev,
          {
            turn: currentTurn.turnNumber,
            type: "FAIL",
            text: `Turn ${currentTurn.turnNumber}: 💥 BROKEN! ${chosenOpt.name} failed to chain! Required WS was ${currentTurn.correctOption.name}. Final Streak: ${survivalStreak}`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    },
    [
      survivalStatus,
      currentTurn,
      activeSurvivalFlow,
      survivalStreak,
      survivalHighScore,
      isNewRecord,
      timerPhase,
      timeRemaining,
    ],
  );

  useEffect(() => {
    if (viewMode === "challenge" && !currentTurn) {
      initSurvivalGame(survivalFlowId, 0);
    }
  }, [viewMode, currentTurn, survivalFlowId, initSurvivalGame]);

  useEffect(() => {
    if (viewMode !== "challenge" || survivalStatus !== "PLAYING" || !currentTurn) {
      return;
    }

    const intervalId = setInterval(() => {
      const elapsed = (Date.now() - phaseStartRef.current) / 1000;
      if (phaseRef.current === "PAUSE") {
        const remaining = Math.max(0, phaseDurationRef.current - elapsed);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          phaseRef.current = "ACTIVE";
          phaseDurationRef.current = currentTurn.timing.seconds;
          phaseStartRef.current = Date.now();
          setTimerPhase("ACTIVE");
          setTimeRemaining(currentTurn.timing.seconds);
          setEarlyWarning(null);
        }
      } else if (phaseRef.current === "ACTIVE") {
        const remaining = Math.max(0, phaseDurationRef.current - elapsed);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(intervalId);
          handleSurvivalTimeout();
        }
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [viewMode, survivalStatus, currentTurn, handleSurvivalTimeout]);

  useEffect(() => {
    if (viewMode !== "challenge") return;

    const handleKeyDown = (e) => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target?.tagName)) return;

      if (survivalStatus === "PLAYING" && currentTurn?.options) {
        const key = e.key.toUpperCase();
        let matched = null;
        if (key === "A" || key === "1") matched = currentTurn.options[0];
        else if (key === "B" || key === "2") matched = currentTurn.options[1];
        else if (key === "C" || key === "3") matched = currentTurn.options[2];

        if (matched) {
          e.preventDefault();
          handleSurvivalChoice(matched);
        } else if (e.key === " " && timerPhase === "PAUSE") {
          e.preventDefault();
          skipPauseWindow();
        }
      } else if (survivalStatus === "GAME_OVER") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          initSurvivalGame(survivalFlowId, 0);
        }
      } else if (survivalStatus === "COMPLETED") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          initSurvivalGame("random", survivalStreak);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    viewMode,
    survivalStatus,
    currentTurn,
    survivalFlowId,
    handleSurvivalChoice,
    initSurvivalGame,
    skipPauseWindow,
    timerPhase,
    survivalStreak,
  ]);

  const toggleAntiChain = () => {
    const newMode = !antiChainMode;
    setAntiChainMode(newMode);
    setHistory(recalculateChain(history, newMode));
  };

  const addToChain = (wsName, weaponType) => {
    const newHistory = recalculateChain(
      [...history, { name: wsName, weaponType }],
      antiChainMode,
    );
    setHistory(newHistory);
  };

  const removeStep = (index) => {
    setHistory(
      recalculateChain(
        history.filter((_, i) => i !== index),
        antiChainMode,
      ),
    );
  };

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
    // Calculator Mode Option Matrices
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
          if (priorityResult !== null) {
            const scElements = SKILLCHAIN_ELEMENTS[priorityResult] || [];
            const matchesElementFilter = scElements.some(
              (el) => activeElements[el],
            );
            if (matchesElementFilter) {
              if (!groups[priorityResult]) groups[priorityResult] = [];
              groups[priorityResult].push({
                name: wsName,
                weaponType: wType,
                isPriority: true,
              });
            }
          }
        }
      });
    });

    const sortSkills = (a, b) => {
      if (a.weaponType !== b.weaponType)
        return a.weaponType.localeCompare(b.weaponType);
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

  const handleViewSwitch = (targetMode) => {
    setHistory([]);
    setAntiChainMode(false);
    setViewMode(targetMode);
    if (targetMode === "challenge") {
      initSurvivalGame(survivalFlowId);
    }
  };

  const handleFlowSelectChange = (newFlowId) => {
    setSurvivalFlowId(newFlowId);
    initSurvivalGame(newFlowId);
  };

  const groupedNextSteps = getGroupedNextSteps();
  const activeElementCount = Object.values(activeElements).filter(Boolean).length;
  const isAllElementsSelected = activeElementCount === 8;
  const isNoElementsSelected = activeElementCount === 0;

  const isChainClosed =
    viewMode === "calculator" &&
    history.length > 0 &&
    history[history.length - 1].isLevel4;
  const canSelectSkills = !isChainClosed;

  const renderActionButtons = () => (
    <>
      {viewMode === "calculator" && (
        <button
          onClick={() => setMultiPartyMode(!multiPartyMode)}
          style={{
            cursor: "pointer",
            background: multiPartyMode ? theme.accent : theme.itemBg,
            color: multiPartyMode ? theme.bg : theme.text,
            border: `1px solid ${theme.border}`,
            padding: "10px 14px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            fontFamily: "monospace",
            width: isMobile ? "100%" : "auto",
          }}
        >
          {multiPartyMode ? "👥 PARTY_WEAPONS" : "👤 SINGLE_WEAPON"}
        </button>
      )}
      {viewMode === "calculator" && (
        <button
          onClick={toggleAntiChain}
          style={{
            cursor: "pointer",
            background: antiChainMode ? theme.danger : theme.itemBg,
            color: antiChainMode ? "#fff" : theme.text,
            border: `1px solid ${antiChainMode ? theme.danger : theme.border}`,
            padding: "10px 14px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            fontFamily: "monospace",
            width: isMobile ? "100%" : "auto",
          }}
        >
          Ø ANTI_MODE
        </button>
      )}
      <button
        onClick={() => setGuideOpen(!guideOpen)}
        style={{
          cursor: "pointer",
          background: guideOpen ? "#b388ff" : theme.itemBg,
          color: guideOpen ? "#000" : theme.text,
          border: `1px solid ${theme.border}`,
          padding: "10px 14px",
          fontSize: "0.9rem",
          fontWeight: "bold",
          fontFamily: "monospace",
          width: isMobile ? "100%" : "auto",
        }}
      >
        {guideOpen ? "📖 GUIDE_OPEN" : "📖 GUIDE_CLOSED"}
      </button>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          cursor: "pointer",
          background: theme.itemBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          padding: "10px 14px",
          fontSize: "0.9rem",
          fontFamily: "monospace",
          width: isMobile ? "100%" : "auto",
        }}
      >
        {darkMode ? "☀" : "🌙"}
      </button>
    </>
  );

  const renderSurvivalGame = () => {
    const isPause = timerPhase === "PAUSE";
    const activeSecondsMax = currentTurn?.timing?.seconds || 10;
    const activePercent = Math.max(
      0,
      Math.min(100, (timeRemaining / activeSecondsMax) * 100),
    );
    const pausePercent = Math.max(
      0,
      Math.min(100, (timeRemaining / 4.0) * 100),
    );
    const isUrgent = !isPause && timeRemaining <= 2.5;
    const timerColor = isPause
      ? "#60a5fa"
      : isUrgent
        ? "#ff4757"
        : timeRemaining <= 4.0
          ? "#f59e0b"
          : "#10b981";

    return (
      <div style={{ width: "100%", fontFamily: "monospace" }}>
        {/* Game Master Briefing Box */}
        <div
          style={{
            background: darkMode ? "#1a1a2e" : "#eef2ff",
            border: `1px solid ${darkMode ? "#3f3f7f" : "#c7d2fe"}`,
            padding: "16px 20px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                color: "#a5b4fc",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚔️</span>
              <span>FFXI SKILLCHAIN SURVIVAL ARENA • GAME MASTER</span>
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                background: darkMode ? "#252545" : "#e0e7ff",
                color: "#a5b4fc",
                padding: "2px 8px",
                border: "1px solid #4338ca",
              }}
            >
              TIMING: 4s PAUSE → SHRINKING ACTIVE WINDOW
            </div>
          </div>
          <p
            style={{
              margin: "0 0 6px 0",
              fontSize: "0.88rem",
              lineHeight: "1.5",
              color: theme.text,
            }}
          >
            Welcome, adventurer! As the <strong>Game Master</strong>, I will deploy opening Weapon Skills. Your objective is to continuously extend the skillchain by choosing the correct follow-up WS from 3 choices. Each correct pick advances your <strong>Streak / Score</strong>!
          </p>
          <div
            style={{
              fontSize: "0.82rem",
              color: theme.muted,
              lineHeight: "1.5",
            }}
          >
            <strong>FFXI Timing Windows:</strong> Every WS has a <strong>4-second pause window</strong> before a link can connect, followed by a shrinking active window (WS 1→2: <strong>10s</strong> | WS 2→3: <strong>7s</strong> | WS 3→4: <strong>4s</strong> | WS 4+: <strong>3s</strong>).
            <div style={{ marginTop: "4px" }}>
              <strong>Sequence Caps:</strong> In FFXI rules, Level 3 Light / Darkness and Level 4 Radiance / Umbra caps naturally conclude the chain. Complete all steps to conquer the sequence, or play Random Survival to build an unbroken streak!
            </div>
          </div>
        </div>

        {/* Scoreboard and Sequence Selection Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            padding: "12px 18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span style={{ color: theme.muted, fontSize: "0.8rem" }}>
                CURRENT STREAK:{" "}
              </span>
              <strong style={{ fontSize: "1.4rem", color: "#2ecc71" }}>
                {survivalStreak}
              </strong>
            </div>
            <div>
              <span style={{ color: theme.muted, fontSize: "0.8rem" }}>
                HIGH SCORE:{" "}
              </span>
              <strong style={{ fontSize: "1.4rem", color: "#ffd700" }}>
                {survivalHighScore}
              </strong>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: theme.muted, fontSize: "0.8rem" }}>
              SEQUENCE:
            </span>
            <select
              value={survivalFlowId}
              onChange={(e) => handleFlowSelectChange(e.target.value)}
              style={{
                padding: "8px 12px",
                fontFamily: "monospace",
                background: theme.itemBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                cursor: "pointer",
                maxWidth: isMobile ? "220px" : "320px",
              }}
            >
              <option value="random">🔀 Random Sequence (Survival)</option>
              {SURVIVAL_FLOWS.map((f, i) => (
                <option key={f.id} value={f.id}>
                  {i + 1}. {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => initSurvivalGame(survivalFlowId, 0)}
              title="Restart chain run"
              style={{
                cursor: "pointer",
                background: theme.accent,
                color: theme.bg,
                border: "none",
                padding: "8px 14px",
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              [ ↺ RESTART ]
            </button>
          </div>
        </div>

        {/* Game State: SEQUENCE COMPLETED View */}
        {survivalStatus === "COMPLETED" && (
          <div
            style={{
              background: "#031a0e",
              border: "2px solid #2ecc71",
              padding: "24px 20px",
              marginBottom: "18px",
            }}
          >
            {/* ASCII Completion Banner */}
            <pre
              style={{
                color: "#2ecc71",
                fontSize: isMobile ? "0.55rem" : "0.75rem",
                lineHeight: "1.1",
                margin: "0 0 16px 0",
                overflowX: "auto",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
{`
   ______ ____  __  __ ____  __     ______ ______ ______ ____  
  / ____// __ \\/  |/  // __ \\/ /    / ____//_  __// ____// __ \\ 
 / /    / / / / /|_/ // /_/ / /    / __/    / /  / __/  / / / / 
/ /___ / /_/ / /  / // ____/ /___ / /___   / /  / /___ / /_/ /  
\\____/ \\____/_/  /_//_/   /_____//_____/  /_/  /_____//_____/   
`}
            </pre>

            <div
              style={{
                textAlign: "center",
                color: "#2ecc71",
                fontSize: "1.2rem",
                fontWeight: "bold",
                marginBottom: "8px",
                letterSpacing: "1px",
              }}
            >
              ✨✨ SKILLCHAIN MASTERED! SEQUENCE COMPLETED! ✨✨
            </div>

            <div
              style={{
                textAlign: "center",
                color: "#ffd700",
                fontSize: "0.92rem",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              [ NATURAL FFXI CONCLUSION REACHED: {gameOverData?.flowCategory || "Level 3 / 4 Cap"} ]
            </div>

            <div
              style={{
                background: "#062b17",
                border: "1px solid #2ecc71",
                padding: "16px 18px",
                marginBottom: "18px",
                fontSize: "0.92rem",
                lineHeight: "1.6",
              }}
            >
              <div>
                🎯 <strong>Sequence:</strong>{" "}
                <span style={{ color: "#fff", fontWeight: "bold" }}>
                  {gameOverData?.flowName}
                </span>{" "}
                ({gameOverData?.stepsCompleted} consecutive links successfully landed!)
              </div>
              <div>
                ⚡ <strong>Closing Skillchain:</strong>{" "}
                <span style={{ color: "#ffd700", fontWeight: "bold" }}>
                  {gameOverData?.resultingSC}
                </span>
              </div>
              <div style={{ marginTop: "6px", color: "#a7f3d0", fontSize: "0.85rem" }}>
                <em>
                  In FFXI rules, higher-level skillchains (such as Level 3 Light or Dark, or Level 4 Radiance or Umbra) naturally conclude a skillchain sequence and cannot be chained into indefinitely. You executed the full sequence with flawless timing!
                </em>
              </div>
              <div style={{ marginTop: "8px", borderTop: "1px dashed #2ecc71", paddingTop: "8px" }}>
                🏆 <strong>Final Streak (Score):</strong>{" "}
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "bold",
                    color: "#2ecc71",
                  }}
                >
                  {gameOverData?.streak}
                </span>{" "}
                | <strong>High Score Record:</strong> {survivalHighScore}
              </div>
            </div>

            {/* High Score Text Celebration */}
            {gameOverData?.beatHigh && (
              <div
                style={{
                  background: "#2e2200",
                  border: "2px solid #ffd700",
                  color: "#ffd700",
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  marginBottom: "18px",
                }}
              >
                ★ ★ ★ 🏆 NEW PERSONAL RECORD HIGH SCORE: {survivalHighScore}! 🏆 ★ ★ ★
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#fff",
                    marginTop: "6px",
                    fontWeight: "normal",
                  }}
                >
                  Outstanding skillchain mastery! You conquered the timing windows and set a new standard of greatness!
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => initSurvivalGame("random", survivalStreak)}
                style={{
                  cursor: "pointer",
                  background: "#2ecc71",
                  color: "#000",
                  border: "none",
                  padding: "12px 26px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                [ ⚔️ NEXT SEQUENCE (CONTINUE STREAK: {survivalStreak}) ]
              </button>
              <button
                onClick={() => initSurvivalGame(survivalFlowId, 0)}
                style={{
                  cursor: "pointer",
                  background: theme.itemBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  padding: "12px 26px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                [ ↺ REPLAY THIS SEQUENCE ]
              </button>
              <button
                onClick={() => handleViewSwitch("calculator")}
                style={{
                  cursor: "pointer",
                  background: theme.itemBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  padding: "12px 26px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                [ 💻 RETURN TO CALCULATOR ]
              </button>
            </div>
          </div>
        )}

        {/* Game State: GAME OVER View */}
        {survivalStatus === "GAME_OVER" && (
          <div
            style={{
              background: "#160000",
              border: "2px solid #ff4757",
              padding: "24px 20px",
              marginBottom: "18px",
            }}
          >
            {/* ASCII Crash and Burn Flare */}
            <pre
              style={{
                color: "#ff4757",
                fontSize: isMobile ? "0.55rem" : "0.75rem",
                lineHeight: "1.1",
                margin: "0 0 16px 0",
                overflowX: "auto",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
{`
   ______ ____  ___   _____ __  __   ___    _   __ ____     ____  __  ______  _   __
  / ____// __ \\/   | / ___// / / /  /   |  / | / // __ \\   / __ )/ / / / __ \\/ | / /
 / /    / /_/ / /| | \\__ \\/ /_/ /  / /| | /  |/ // / / /  / __  / / / / /_/ /  |/ / 
/ /___ / _, _/ ___ |___/ / __  /  / ___ |/ /|  // /_/ /  / /_/ / /_/ / _, _/ /|  /  
\\____//_/ |_/_/  |_/____/_/ /_/  /_/  |_/_/ |_//_____/  /_____/\\____/_/ |_/_/ |_/   
`}
            </pre>

            <div
              style={{
                textAlign: "center",
                color: "#ff4757",
                fontSize: "1.15rem",
                fontWeight: "bold",
                marginBottom: "16px",
                letterSpacing: "1px",
              }}
            >
              {gameOverData?.reason === "TIMEOUT"
                ? "⏱️⏱️ TIME EXPIRED! ACTIVE SKILLCHAIN WINDOW CLOSED! ⏱️⏱️"
                : "💥💥 CRASH AND BURN! THE SKILLCHAIN HAS SHATTERED! 💥💥"}
            </div>

            <div
              style={{
                background: "#2a0000",
                border: "1px solid #ff4757",
                padding: "14px 18px",
                marginBottom: "18px",
                fontSize: "0.92rem",
                lineHeight: "1.6",
              }}
            >
              {gameOverData?.reason === "TIMEOUT" ? (
                <div>
                  ⏱️ <strong>Failure Cause:</strong>{" "}
                  <span style={{ color: "#ff4757", fontWeight: "bold" }}>
                    TIMEOUT
                  </span>{" "}
                  — Active timing window elapsed before a Weapon Skill was chosen!
                </div>
              ) : (
                <div>
                  ❌ <strong>Chosen Weapon Skill:</strong>{" "}
                  <span style={{ color: "#ff4757", fontWeight: "bold" }}>
                    {gameOverData?.chosen?.name}
                  </span>{" "}
                  ({gameOverData?.chosen?.weaponType}) —{" "}
                  <em>MISALIGNMENT / CHAIN BROKEN</em>
                </div>
              )}
              <div>
                ✅ <strong>Required Continuation:</strong>{" "}
                <span style={{ color: "#2ecc71", fontWeight: "bold" }}>
                  {gameOverData?.required?.name}
                </span>{" "}
                ({gameOverData?.required?.weaponType}) → Would have closed{" "}
                <span style={{ color: "#ffd700", fontWeight: "bold" }}>
                  {gameOverData?.resultingSC}
                </span>
              </div>
              <div style={{ marginTop: "4px" }}>
                🏆 <strong>Final Streak (Score):</strong>{" "}
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {gameOverData?.streak}
                </span>{" "}
                | <strong>High Score Record:</strong> {survivalHighScore}
              </div>
            </div>

            {/* High Score Text Celebration */}
            {gameOverData?.beatHigh && (
              <div
                style={{
                  background: "#2e2200",
                  border: "2px solid #ffd700",
                  color: "#ffd700",
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  marginBottom: "18px",
                }}
              >
                ★ ★ ★ 🏆 NEW PERSONAL RECORD HIGH SCORE: {survivalHighScore}! 🏆 ★ ★ ★
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#fff",
                    marginTop: "6px",
                    fontWeight: "normal",
                  }}
                >
                  Outstanding skillchain execution! You conquered the pressure and set a new standard of mastery!
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => initSurvivalGame(survivalFlowId, 0)}
                style={{
                  cursor: "pointer",
                  background: "#ff4757",
                  color: "#fff",
                  border: "none",
                  padding: "12px 26px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                [ ⚔️ RETRY / PLAY AGAIN ]
              </button>
              <button
                onClick={() => handleViewSwitch("calculator")}
                style={{
                  cursor: "pointer",
                  background: theme.itemBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  padding: "12px 26px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                [ 💻 RETURN TO CALCULATOR ]
              </button>
            </div>
          </div>
        )}

        {/* Game State: PLAYING View */}
        {survivalStatus === "PLAYING" && currentTurn && (
          <div
            style={{
              background: theme.cardBg,
              border: `2px solid ${theme.border}`,
              padding: "20px",
              marginBottom: "18px",
            }}
          >
            {/* Round info header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                borderBottom: `1px solid ${theme.border}`,
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span style={{ color: theme.muted, fontSize: "0.85rem" }}>
                  CURRENT ROUND:{" "}
                </span>
                <strong style={{ color: "#a5b4fc", fontSize: "1.1rem" }}>
                  TURN {currentTurn.turnNumber} (STEP {currentTurn.flowStepIndex + 1} OF {activeSurvivalFlow?.steps.length})
                </strong>
                {currentTurn.isFinisher && (
                  <span
                    style={{
                      marginLeft: "10px",
                      background: "#ffd700",
                      color: "#000",
                      padding: "2px 8px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      borderRadius: "2px",
                    }}
                  >
                    ★ FINAL FINISHER LINK
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.85rem", color: theme.muted }}>
                FLOW:{" "}
                <span style={{ color: theme.text, fontWeight: "bold" }}>
                  {activeSurvivalFlow?.name}
                </span>
              </div>
            </div>

            {/* Previous WS Executed and Resulting SC Announcement */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "14px",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                background: theme.itemBg,
                padding: "14px 18px",
                border: `1px solid ${theme.border}`,
                marginBottom: "16px",
              }}
            >
              <div>
                <div style={{ color: theme.muted, fontSize: "0.75rem", marginBottom: "3px" }}>
                  PREVIOUS WEAPON SKILL EXECUTED:
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: "bold" }}>
                  {currentTurn.previousWS?.name}{" "}
                  <span style={{ fontSize: "0.82rem", color: theme.muted, fontWeight: "normal" }}>
                    [{currentTurn.previousWS?.weaponType}]
                  </span>
                </div>
              </div>
              <div>
                <div style={{ color: theme.muted, fontSize: "0.75rem", marginBottom: "4px" }}>
                  RESULTING SKILLCHAIN:
                </div>
                {currentTurn.turnNumber === 1 ? (
                  <span
                    style={{
                      color: theme.muted,
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                    }}
                  >
                    None (Opener Initiated)
                  </span>
                ) : (
                  <span
                    style={getStyleForElement(
                      currentTurn.previousSC?.replace(/ \(Lv\d[^)]*\)/, "").trim(),
                    )}
                  >
                    {currentTurn.previousSC}
                  </span>
                )}
              </div>
            </div>

            {/* Real-time Countdown Timer Box (Pause Window vs Active Window) */}
            <div
              style={{
                background: isPause
                  ? "#0c1527"
                  : isUrgent
                    ? "#200b0b"
                    : "#0d1b14",
                border: `2px solid ${timerColor}`,
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "18px",
                boxShadow: `0 0 14px ${timerColor}44`,
                transition: "border-color 0.2s, background-color 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: timerColor,
                      fontWeight: "900",
                      fontSize: "1.2rem",
                      letterSpacing: "1px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{isPause ? "⏸️" : isUrgent ? "⚠️" : "⏱️"}</span>
                    <span>
                      {isPause
                        ? `PAUSE WINDOW (INACTIVE): ${timeRemaining.toFixed(1)}s`
                        : isUrgent
                          ? `TIME CRITICAL: ${timeRemaining.toFixed(1)}s`
                          : `TIME REMAINING: ${timeRemaining.toFixed(1)} SECONDS`}
                    </span>
                  </div>
                  <div
                    style={{
                      color: isPause
                        ? "#93c5fd"
                        : isUrgent
                          ? "#ffb8b8"
                          : "#a7f3d0",
                      fontSize: "0.84rem",
                      marginTop: "4px",
                    }}
                  >
                    {isPause
                      ? "FFXI 4-second pause window active — wait for WS animation to settle before closing chain!"
                      : `${currentTurn.timing.description} — ACTIVE WINDOW OPEN — EXECUTE NOW!`}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isPause && (
                    <button
                      onClick={skipPauseWindow}
                      title="Skip 4-second wait and open active link window immediately (or press Space)"
                      style={{
                        background: "#1e3a8a",
                        border: "1px solid #60a5fa",
                        color: "#fff",
                        padding: "6px 12px",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      [ ⏩ SKIP PAUSE ]
                    </button>
                  )}
                  <div
                    style={{
                      fontSize: "1.9rem",
                      fontWeight: "900",
                      color: timerColor,
                      fontFamily: "monospace",
                      minWidth: "65px",
                      textAlign: "right",
                    }}
                  >
                    {timeRemaining.toFixed(1)}s
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "7px",
                  background: isPause
                    ? "#172554"
                    : isUrgent
                      ? "#450a0a"
                      : "#064e3b",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${isPause ? pausePercent : activePercent}%`,
                    height: "100%",
                    background: isPause
                      ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                      : isUrgent
                        ? "linear-gradient(90deg, #ff4757, #ff6b81)"
                        : timeRemaining <= 4.0
                          ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                          : "linear-gradient(90deg, #10b981, #34d399)",
                    transition: "width 0.05s linear",
                  }}
                />
              </div>
            </div>

            {/* Early Attempt Warning Banner */}
            {earlyWarning && (
              <div
                style={{
                  background: "#3a2500",
                  border: "2px solid #f59e0b",
                  color: "#fbbf24",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️</span>
                <span>{earlyWarning}</span>
              </div>
            )}

            {/* 3 Choices Prompt */}
            <div>
              <div
                style={{
                  color: theme.text,
                  fontSize: "0.9rem",
                  marginBottom: "10px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>⚔️ SELECT NEXT WEAPON SKILL TO EXTEND THE CHAIN:</span>
                {isPause && (
                  <span style={{ fontSize: "0.8rem", color: "#60a5fa" }}>
                    [ ⏸️ LOCKED: Window opens in {timeRemaining.toFixed(1)}s ]
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                  gap: "14px",
                }}
              >
                {currentTurn.options.map((opt) => (
                  <button
                    key={opt.keyLabel}
                    onClick={() => handleSurvivalChoice(opt)}
                    style={{
                      padding: "16px",
                      background: theme.itemBg,
                      color: theme.text,
                      border: `2px solid ${isPause ? theme.border : theme.border}`,
                      cursor: isPause ? "not-allowed" : "pointer",
                      opacity: isPause ? 0.72 : 1,
                      textAlign: "left",
                      fontFamily: "monospace",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      transition: "all 0.15s ease",
                      boxShadow: isPause
                        ? "none"
                        : `3px 3px 0px ${theme.border}`,
                    }}
                    onMouseOver={(e) => {
                      if (!isPause) {
                        e.currentTarget.style.borderColor = "#2ecc71";
                        e.currentTarget.style.boxShadow = "3px 3px 0px #2ecc71";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isPause) {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.boxShadow = `3px 3px 0px ${theme.border}`;
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          background: isPause ? "#4b5563" : "#2ecc71",
                          color: isPause ? "#fff" : "#000",
                          fontWeight: "bold",
                          padding: "2px 8px",
                          fontSize: "0.9rem",
                          borderRadius: "2px",
                        }}
                      >
                        [ {opt.keyLabel} ]
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: theme.muted,
                        }}
                      >
                        [{opt.weaponType}]
                      </span>
                    </div>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.08rem",
                        marginTop: "4px",
                      }}
                    >
                      {opt.name}
                    </div>
                  </button>
                ))}
              </div>

              <div
                style={{
                  color: theme.muted,
                  fontSize: "0.8rem",
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                [ TIP: Press <strong>A</strong>, <strong>B</strong>, or <strong>C</strong> (or <strong>1</strong>, <strong>2</strong>, <strong>3</strong>) to select. Press <strong>Space</strong> during pause to skip immediately! ]
              </div>
            </div>
          </div>
        )}

        {/* Battle Chronicle Terminal Window */}
        <div
          style={{
            background: "#0a0a0a",
            border: `1px solid ${theme.border}`,
            padding: "14px 18px",
            maxHeight: "180px",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "0.84rem",
          }}
        >
          <div
            style={{
              color: theme.muted,
              marginBottom: "8px",
              borderBottom: `1px dashed ${theme.border}`,
              paddingBottom: "4px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>== BATTLE CHRONICLE LOG ==</span>
            <span>{survivalLog.length} EVENTS</span>
          </div>
          {survivalLog.map((log, i) => (
            <div
              key={i}
              style={{
                marginBottom: "4px",
                lineHeight: "1.4",
                color:
                  log.type === "FAIL"
                    ? "#ff4757"
                    : log.type === "SUCCESS"
                      ? "#2ecc71"
                      : log.type === "OPENER"
                        ? "#fb8fff"
                        : "#a2e4f1",
              }}
            >
              <span style={{ color: "#555", marginRight: "8px" }}>
                [{log.time}]
              </span>
              {log.text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBlueprintGuide = () => (
    <div
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        padding: "18px",
        fontSize: "0.9rem",
        lineHeight: "1.5",
        color: theme.text,
        overflowY: "auto",
        maxHeight: isMobile ? "none" : "calc(100vh - 180px)",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          borderBottom: `1px solid ${theme.border}`,
          paddingBottom: "6px",
          marginBottom: "12px",
          color: "#b388ff",
          fontSize: "0.95rem",
        }}
      >
        === SKILLCHAINS ===
      </div>

      <p style={{ margin: "0 0 12px 0" }}>
        Skillchains occur when specific Weaponskills successfully strike
        sequentially within a <strong>3-10 seconds window</strong>.
      </p>

      <div
        style={{
          fontWeight: "bold",
          marginBottom: "6px",
          color: theme.muted,
          fontSize: "0.9rem",
        }}
      >
        [ 1. EXECUTION ORDER ]
      </div>
      <p style={{ margin: "0 0 8px 0" }}>
        Properties do not automatically link both ways. Order dictates the chain
        results:
      </p>

      <pre
        style={{
          margin: "0 0 12px 0",
          fontStyle: "normal",
          background: theme.bg,
          padding: "10px",
          border: `1px dashed ${theme.border}`,
          fontSize: "0.85rem",
        }}
      >
        {`  STEP 1: STARTER (A)
  └─ Prop: [Detonation]
         │
         ▼ 
  STEP 2: CLOSER (B)
  └─ Prop: [Scission]
         │
         ▼ 
  RESULT: [Scission]`}
      </pre>

      <div
        style={{
          fontWeight: "bold",
          marginBottom: "6px",
          color: theme.muted,
          fontSize: "0.9rem",
        }}
      >
        [ 2. CONTINUATION & TIERS ]
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div>
          <span>LV1 (Basic): </span>
          <span style={getStyleForElement("Detonation")}>
            DETONATION
          </span> + <span style={getStyleForElement("Scission")}>SCISSON</span>{" "}
          = <span style={getStyleForElement("Scission")}>SCISSON</span>
        </div>
        <div>
          <span>LV2 (3 Step): </span>
          <span style={getStyleForElement("Impaction")}>IMPACTION</span> +{" "}
          <span style={getStyleForElement("Liquefaction")}>LIQUEFACTION</span> +{" "}
          <span style={getStyleForElement("Impaction")}>IMPACTION</span> ={" "}
          <span style={getStyleForElement("Fusion")}>FUSION</span>
        </div>
        <div>
          <span>LV3 (Ultimate): </span>
          <span style={getStyleForElement("Fusion")}>Fusion</span> +{" "}
          <span style={getStyleForElement("Fragmentation")}>Fragmentation</span>{" "}
          = <span style={getStyleForElement("Light")}>Light</span>
        </div>
      </div>

      <div
        style={{
          fontWeight: "bold",
          marginBottom: "6px",
          color: theme.muted,
          fontSize: "0.9rem",
        }}
      >
        [ 3. TERMINATION ]
      </div>
      <p style={{ margin: "0" }}>
        Reaching Level 3 Skillchains ends the standard mechanics progression:{" "}
        <span style={getStyleForElement("Light")}>Light</span> or{" "}
        <span style={getStyleForElement("Darkness")}>Darkness</span>.
      </p>
    </div>
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
          padding: isMobile ? "1.2rem" : "2.5rem",
          maxWidth: "1200px",
          margin: "0 auto",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Navigation Header Layout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `2px solid ${antiChainMode ? theme.danger : theme.accent}`,
            paddingBottom: "1.2rem",
            marginBottom: "1.8rem",
          }}
        >
          {/* Title and Easter Egg Toggle */}
          <h1
            style={{
              fontSize: isMobile ? "1.4rem" : "2.2rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>
              {viewMode === "challenge"
                ? "FFXI Skillchain Survival"
                : antiChainMode
                  ? "Gnovi's Anti-Chains"
                  : "Gnovi's Chains"}
            </span>
            <span
              onClick={() =>
                handleViewSwitch(
                  viewMode === "calculator" ? "challenge" : "calculator",
                )
              }
              style={{
                cursor: "pointer",
                opacity: 0.5,
                transition: "opacity 0.2s",
                userSelect: "none",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseOut={(e) => (e.currentTarget.style.opacity = 0.5)}
              title={
                viewMode === "calculator"
                  ? "Access FFXI Skillchain Survival Game (🎮)"
                  : "Return to Calculator (💻)"
              }
            >
              {viewMode === "calculator" ? "🎮" : "💻"}
            </span>
          </h1>

          {isMobile ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                cursor: "pointer",
                background: menuOpen ? theme.accent : theme.itemBg,
                color: menuOpen ? theme.bg : theme.text,
                border: `1px solid ${theme.border}`,
                padding: "8px 14px",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              {menuOpen ? "[ × CLOSE ]" : "[ ☰ SETTINGS ]"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: "12px" }}>
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
              gap: "10px",
              background: theme.cardBg,
              padding: "14px",
              border: `1px solid ${theme.border}`,
              marginBottom: "1.8rem",
            }}
          >
            {renderActionButtons()}
          </div>
        )}

        {/* Mobile Inline Guide Display */}
        {isMobile && guideOpen && (
          <div style={{ marginBottom: "1.8rem" }}>{renderBlueprintGuide()}</div>
        )}

        {/* Main Viewport Router: FFXI Survival Arena vs Calculator Workbench */}
        {viewMode === "challenge" ? (
          renderSurvivalGame()
        ) : (
          /* Split Workbench Viewport (Calculator) */
          <div style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>
            {/* Left Block Workspace Container */}
            <div style={{ flex: 1, minWidth: 0, width: "100%" }}>

            {/* Weapon Workspace Controller - Exclusive to Calculator View */}
            {viewMode === "calculator" && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "18px",
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
                        padding: isMobile ? "8px 12px" : "10px 18px",
                        fontSize: isMobile ? "0.85rem" : "1rem",
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
                        padding: "0 8px",
                        border: "none",
                        background: "transparent",
                        color: theme.danger,
                        cursor: "pointer",
                        fontSize: isMobile ? "1rem" : "1.15rem",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <select
                  onChange={(e) => {
                    if (
                      e.target.value &&
                      !partySlots.includes(e.target.value)
                    ) {
                      setPartySlots([...partySlots, e.target.value]);
                      setActiveWeaponType(e.target.value);
                    }
                  }}
                  value=""
                  style={{
                    padding: isMobile ? "8px" : "10px",
                    fontSize: isMobile ? "0.85rem" : "1rem",
                    fontFamily: "monospace",
                    border: `1px dashed ${theme.border}`,
                    background: theme.itemBg,
                    color: theme.text,
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled>
                    + ADD_WEAPON
                  </option>
                  {Object.keys(weaponskills)
                    .filter((w) => !partySlots.includes(w))
                    .map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Skillchain Element Filter - Toggles for the 8 elements */}
            {viewMode === "calculator" && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "14px 16px",
                  background: theme.cardBg,
                  border: `1px solid ${darkMode ? "#333" : "#ddd"}`,
                  boxShadow: `2px 2px 0px ${theme.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        color: theme.muted,
                        letterSpacing: "0.5px",
                      }}
                    >
                      == SKILLCHAIN ELEMENT FILTER ==
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: theme.muted,
                        fontFamily: "monospace",
                      }}
                    >
                      [{activeElementCount}/8 ACTIVE]
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={selectAllElements}
                      title={
                        isAllElementsSelected
                          ? "All elements currently active"
                          : "Enable all elements"
                      }
                      style={{
                        cursor: "pointer",
                        background: isAllElementsSelected
                          ? darkMode
                            ? "#2ecc7125"
                            : "#e8f8f0"
                          : theme.itemBg,
                        border: isAllElementsSelected
                          ? "1px solid #2ecc71"
                          : `1px solid ${theme.border}`,
                        color: isAllElementsSelected ? "#2ecc71" : theme.text,
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        fontFamily: "monospace",
                        boxShadow: isAllElementsSelected
                          ? "2px 2px 0px #2ecc71"
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isAllElementsSelected ? "[ ALL SELECTED ✓ ]" : "[ ALL ]"}
                    </button>
                    <button
                      onClick={clearAllElements}
                      title="Disable all elements"
                      style={{
                        cursor: "pointer",
                        background: isNoElementsSelected
                          ? darkMode
                            ? "#ff475725"
                            : "#ffeae8"
                          : theme.itemBg,
                        border: isNoElementsSelected
                          ? "1px solid #ff4757"
                          : `1px solid ${theme.border}`,
                        color: isNoElementsSelected ? "#ff4757" : theme.text,
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        fontFamily: "monospace",
                        boxShadow: isNoElementsSelected
                          ? "2px 2px 0px #ff4757"
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isNoElementsSelected ? "[ NONE SELECTED ]" : "[ NONE ]"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {ELEMENT_CONFIG.map((el) => {
                    const isActive = !!activeElements[el.key];
                    return (
                      <button
                        key={el.key}
                        onClick={() => toggleElement(el.key)}
                        title={`Toggle ${el.label} filter`}
                        aria-pressed={isActive}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          border: isActive
                            ? `2px solid ${
                                el.key === "Dark" && darkMode
                                  ? "#777"
                                  : el.key === "Light" && !darkMode
                                    ? "#d4af37"
                                    : el.color
                              }`
                            : `1px dashed ${theme.border}`,
                          background: isActive
                            ? darkMode
                              ? el.key === "Dark"
                                ? "#1e1e1e"
                                : `${el.color}25`
                              : el.key === "Light"
                                ? "#fffbe6"
                                : `${el.color}22`
                            : theme.itemBg,
                          color: isActive
                            ? el.key === "Dark" && darkMode
                              ? "#fff"
                              : el.key === "Light" && !darkMode
                                ? "#333"
                                : el.color
                            : theme.muted,
                          opacity: isActive ? 1 : 0.45,
                          transition: "all 0.15s ease",
                          boxShadow: isActive
                            ? `2px 2px 0px ${
                                el.key === "Dark" && darkMode
                                  ? "#555"
                                  : el.key === "Light" && !darkMode
                                    ? "#c0a030"
                                    : el.color
                              }`
                            : "none",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ fontSize: "1rem" }}>{el.icon}</span>
                          <span>{el.label}</span>
                        </span>
                        {/* Mini Slider Switch */}
                        <div
                          style={{
                            width: "28px",
                            height: "14px",
                            borderRadius: "10px",
                            background: isActive
                              ? el.key === "Dark"
                                ? darkMode
                                  ? "#666"
                                  : "#000"
                                : el.color
                              : darkMode
                                ? "#333"
                                : "#ccc",
                            position: "relative",
                            transition: "background 0.2s ease",
                            flexShrink: 0,
                            marginLeft: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background:
                                isActive &&
                                (el.key === "Light" || el.key === "Ice")
                                  ? "#000"
                                  : "#fff",
                              position: "absolute",
                              top: "2px",
                              left: isActive ? "16px" : "2px",
                              transition: "left 0.2s ease",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === "calculator" && (
              <button
                onClick={() => setHistory([])}
                style={{
                  cursor: "pointer",
                  border: `1px solid ${theme.border}`,
                  background: theme.itemBg,
                  color: theme.text,
                  padding: "6px 12px",
                  fontSize: "0.85rem",
                  marginBottom: "2.2rem",
                }}
              >
                CLEAR ACTIVE CHAIN
              </button>
            )}

            {/* Core Display History Panel */}
            <section
              style={{
                marginBottom: "3.5rem",
                background: theme.cardBg,
                padding: "18px",
                border: `1px solid ${darkMode ? "#333" : "#eee"}`,
                marginTop: "0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "24px",
                }}
              >
                <div style={{ flex: 1, width: "100%" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: theme.muted,
                      marginBottom: "12px",
                    }}
                  >
                    == Active Chain Track ==
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {history.length === 0 && (
                      <div style={{ color: theme.muted, fontSize: "0.95rem" }}>
                        - idle -
                      </div>
                    )}
                    {history.map((step, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                          gap: isMobile ? "8px" : "16px",
                        }}
                      >
                        <div
                          style={{
                            width: isMobile ? "100%" : "260px",
                            padding: "10px",
                            border: `1px solid ${darkMode ? "#444" : "#ddd"}`,
                            background: theme.itemBg,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxSizing: "border-box",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: theme.muted,
                              }}
                            >
                              {step.weaponType}
                            </div>
                            <div
                              style={{ fontWeight: "bold", fontSize: "1rem" }}
                            >
                              {step.name}
                            </div>
                          </div>
                          {viewMode === "calculator" && (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => moveStep(i, -1)}
                                disabled={i === 0}
                                style={{
                                  background: "transparent",
                                  color: theme.text,
                                  border: "none",
                                  cursor: i === 0 ? "default" : "pointer",
                                  opacity: i === 0 ? "0.2" : "1",
                                  fontSize: "1rem",
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
                                    i === history.length - 1
                                      ? "default"
                                      : "pointer",
                                  opacity:
                                    i === history.length - 1 ? "0.2" : "1",
                                  fontSize: "1rem",
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
                                  marginLeft: "6px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        {i > 0 && (
                          <div
                            style={{
                              padding: "0 8px",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span
                              style={{
                                color: darkMode ? "#ccc" : "#444",
                                fontSize: "1rem",
                              }}
                            >
                              ◀
                            </span>
                            {antiChainMode ? (
                              <span
                                style={{
                                  fontSize: "1.35rem",
                                  color: theme.muted,
                                }}
                              >
                                ∅
                              </span>
                            ) : (
                              <span style={getStyleForElement(step.scResult)}>
                                {step.scResult?.toUpperCase()}{" "}
                                {step.isLevel4 ? "LV4" : ""}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {history.length > 0 && viewMode === "calculator" && (
                  <div
                    style={{
                      width: isMobile ? "100%" : "320px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", color: theme.muted }}>
                      == Export Data ==
                    </div>
                    <button
                      onClick={() => handleCopy("simple")}
                      style={{
                        textAlign: "left",
                        padding: "12px",
                        background: theme.itemBg,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        cursor: "pointer",
                        fontSize: "0.85rem",
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
                          padding: "12px",
                          background: theme.itemBg,
                          color: theme.text,
                          border: `1px solid ${theme.border}`,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontFamily: "monospace",
                        }}
                      >
                        <div
                          style={{ color: theme.muted, marginBottom: "4px" }}
                        >
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
                          padding: "12px",
                          background: theme.itemBg,
                          color: theme.text,
                          border: `1px solid ${theme.border}`,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontFamily: "monospace",
                        }}
                      >
                        <div
                          style={{ color: theme.muted, marginBottom: "4px" }}
                        >
                          [ COPY_ALL_SAFE_FOLLOWUPS ]{" "}
                          {copyFeedback === "all-safe" && "✓"}
                        </div>
                        <div
                          style={{ fontSize: "0.75rem", color: theme.muted }}
                        >
                          Generates multiline list of all ∅ options
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Branch Interaction Elements Block */}
            <section>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: theme.muted,
                  marginBottom: "1.5rem",
                }}
              >
                {antiChainMode
                  ? " === SAFETY BRANCHES (ZERO LINK) === "
                  : " === BRANCH OPTIONS === "}
              </div>

              {!isChainClosed ? (
                Object.keys(groupedNextSteps).length > 0 ? (
                  Object.entries(groupedNextSteps).map(([element, skills]) => {
                  const isSectionOpen =
                    !isMobile || !!expandedSections[element];

                  return (
                    <div key={element} style={{ marginBottom: "1.8rem" }}>
                      <div
                        onClick={() => isMobile && toggleSection(element)}
                        style={{
                          marginBottom: "14px",
                          cursor: isMobile ? "pointer" : "default",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: isMobile ? theme.cardBg : "transparent",
                          padding: isMobile ? "12px" : "0",
                          border: isMobile
                            ? `1px solid ${theme.border}`
                            : "none",
                        }}
                      >
                        <div>
                          {antiChainMode ? (
                            <span
                              style={{
                                border: `1px solid ${theme.muted}`,
                                padding: "6px 12px",
                                color: theme.muted,
                                fontSize: "0.9rem",
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
                            <span
                              style={{ color: theme.muted, fontSize: "0.9rem" }}
                            >
                              STARTING WEAPON SKILLS (
                              {activeWeaponType.toUpperCase()})
                            </span>
                          )}
                        </div>
                        {isMobile && (
                          <span
                            style={{ fontSize: "0.95rem", color: theme.muted }}
                          >
                            {isSectionOpen
                              ? "[ - COLLAPSE ]"
                              : `[ + EXPAND (${skills.length}) ]`}
                          </span>
                        )}
                      </div>

                      {isSectionOpen && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "14px",
                          }}
                        >
                          {skills.map((ws, idx) => {
                            const hasPartyHeader =
                              multiPartyMode && history.length > 0;
                            const isSelectable = canSelectSkills && ws.isPriority;

                            return (
                              <button
                                key={`${ws.weaponType}-${ws.name}-${idx}`}
                                onClick={() =>
                                  isSelectable &&
                                  addToChain(ws.name, ws.weaponType)
                                }
                                disabled={!isSelectable}
                                style={{
                                  position: "relative",
                                  padding: "14px",
                                  paddingTop: hasPartyHeader ? "26px" : "14px",
                                  background: theme.itemBg,
                                  color: theme.text,
                                  border: isSelectable
                                    ? `2px solid ${antiChainMode ? theme.danger : theme.accent}`
                                    : `1px solid ${theme.border}`,
                                  cursor: isSelectable
                                    ? "pointer"
                                    : "not-allowed",
                                  fontFamily: "monospace",
                                  textAlign: "left",
                                  width: isMobile ? "100%" : "185px",
                                  boxSizing: "border-box",
                                  boxShadow: isSelectable
                                    ? `4px 4px 0px ${antiChainMode ? theme.danger : theme.accent}`
                                    : "none",
                                  opacity: isSelectable ? 1 : 0.4,
                                }}
                              >
                                {hasPartyHeader && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "6px",
                                      right: "10px",
                                      fontSize: "0.85rem",
                                      color: isSelectable
                                        ? antiChainMode
                                          ? theme.danger
                                          : theme.accent
                                        : theme.muted,
                                      fontWeight: "bold",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    [{ws.weaponType}]
                                  </div>
                                )}
                                <strong style={{ fontSize: "1rem" }}>
                                  {ws.name}
                                </strong>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: theme.muted,
                                    marginTop: "6px",
                                  }}
                                >
                                  {getWSProperties(ws.name, ws.weaponType).join(
                                    " • ",
                                  )}
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
                      padding: "36px",
                      border: `1px dashed ${theme.border}`,
                      color: theme.muted,
                      textAlign: "center",
                      background: theme.itemBg,
                      fontSize: "0.95rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {history.length > 0
                      ? "[ NO_BRANCHES_MATCH_ELEMENT_FILTER ]"
                      : "[ NO_AVAILABLE_OPTIONS ]"}
                  </div>
                )
              ) : (
                <div
                  style={{
                    padding: "40px",
                    border: "1px solid #e74c3c",
                    color: "#e74c3c",
                    textAlign: "center",
                    background: theme.itemBg,
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  [ CHAIN_TERMINATED ]
                </div>
              )}
            </section>
          </div>

          {/* Right Desktop Flyout Block */}
          {!isMobile && guideOpen && (
            <div
              style={{
                width: "380px",
                flexShrink: 0,
                position: "sticky",
                top: "2rem",
              }}
            >
              {renderBlueprintGuide()}
            </div>
          )}
        </div>
      )}
      </div>
      <footer
        style={{
          padding: "2.5rem",
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
            fontSize: "0.85rem",
            fontFamily: "monospace",
            border: `1px solid ${theme.border}`,
            padding: "6px 18px",
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
