(function (global) {
  const INVITE_ROUTE = "inv";
  const INVITE_ID_MIN = 8;
  const INVITE_ID_MAX = 12;
  const INVITE_ID_PATTERN = /^[0-9A-HJ-NP-Z]{8,12}$/;
  const TOKEN_CAPTURE = "([0-9A-HJ-NP-Z]{8,12})";
  const INVITE_CHARSET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const LOCAL_INVITE_PREFIX = "meeting-invite:";

  function isInviteId(token) {
    return INVITE_ID_PATTERN.test(String(token || "").toUpperCase());
  }

  function normalizeInviteId(token) {
    if (!isInviteId(token)) return null;
    return String(token).toUpperCase();
  }

  function generateInviteId() {
    const length = INVITE_ID_MIN + Math.floor(Math.random() * (INVITE_ID_MAX - INVITE_ID_MIN + 1));
    let id = "";
    for (let index = 0; index < length; index += 1) {
      id += INVITE_CHARSET[Math.floor(Math.random() * INVITE_CHARSET.length)];
    }
    return id;
  }

  function parseInviteSlashPath(pathname) {
    const match = String(pathname || "").match(new RegExp(`^\\/${INVITE_ROUTE}\\/${TOKEN_CAPTURE}\\/?$`, "i"));
    return normalizeInviteId(match?.[1]);
  }

  function parseInviteHash(hash) {
    const match = String(hash || "").match(new RegExp(`^#\\/?${INVITE_ROUTE}\\/${TOKEN_CAPTURE}\\/?$`, "i"));
    return normalizeInviteId(match?.[1]);
  }

  function parseInviteQuery(search) {
    const value = new URLSearchParams(search || "").get("inv");
    return normalizeInviteId(value);
  }

  function parseInviteLegacyUnderscorePath(pathname) {
    const match = String(pathname || "").match(/^\/inv_([0-9A-HJ-NP-Z]{8,12})$/i);
    return normalizeInviteId(match?.[1]);
  }

  function parseInviteFromLocation(locationRef) {
    const location = locationRef || global.location;
    return (
      parseInviteSlashPath(location.pathname) ||
      parseInviteHash(location.hash) ||
      parseInviteQuery(location.search) ||
      parseInviteLegacyUnderscorePath(location.pathname)
    );
  }

  function parseInviteFromUrl(url) {
    try {
      const parsed = new URL(url);
      return (
        parseInviteSlashPath(parsed.pathname) ||
        parseInviteHash(parsed.hash) ||
        parseInviteQuery(parsed.search) ||
        parseInviteLegacyUnderscorePath(parsed.pathname)
      );
    } catch {
      return null;
    }
  }

  function getRemoteApiOrigin(locationRef) {
    const location = locationRef || global.location;
    if (location.protocol === "https:" || location.protocol === "http:") {
      return location.origin;
    }

    const configured = global.INVITE_API_CONFIG?.origin;
    return configured ? String(configured).replace(/\/$/, "") : null;
  }

  function formatInviteUrl(id, locationRef, options = {}) {
    const token = normalizeInviteId(id);
    if (!token) return null;

    const location = locationRef || global.location;
    const remoteOrigin = options.remoteOrigin || getRemoteApiOrigin(location);

    if (remoteOrigin && options.preferRemote) {
      return `${remoteOrigin}/${INVITE_ROUTE}/${token}`;
    }

    if (location.protocol === "file:") {
      const pageUrl = location.href.split(/[?#]/)[0];
      return `${pageUrl}#/inv/${token}`;
    }

    return `${location.origin}/${INVITE_ROUTE}/${token}`;
  }

  function saveLocalInvite(id, payload) {
    try {
      localStorage.setItem(`${LOCAL_INVITE_PREFIX}${id}`, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  function loadLocalInvite(id) {
    try {
      const stored = localStorage.getItem(`${LOCAL_INVITE_PREFIX}${id}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  global.InviteCode = {
    ROUTE: INVITE_ROUTE,
    ID_MIN: INVITE_ID_MIN,
    ID_MAX: INVITE_ID_MAX,
    isInviteId,
    generateInviteId,
    parseInviteFromLocation,
    parseInviteFromUrl,
    formatInviteUrl,
    getRemoteApiOrigin,
    saveLocalInvite,
    loadLocalInvite,
  };
})(window);
