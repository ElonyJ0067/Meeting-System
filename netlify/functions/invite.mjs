import { getStore } from "@netlify/blobs";

const CHARSET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ID_MIN = 8;
const ID_MAX = 12;
const ID_PATTERN = /^[0-9A-HJ-NP-Z]{8,12}$/;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function randomInviteId() {
  const length = ID_MIN + Math.floor(Math.random() * (ID_MAX - ID_MIN + 1));
  let id = "";
  for (let index = 0; index < length; index += 1) {
    id += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return id;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
    },
  });
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const store = getStore({ name: "invites", consistency: "strong" });

  if (request.method === "GET") {
    const id = new URL(request.url).searchParams.get("id")?.toUpperCase();
    if (!id || !ID_PATTERN.test(id)) {
      return jsonResponse({ error: "Invalid invite id" }, 400);
    }

    const payload = await store.get(id, { type: "json" });
    if (!payload) {
      return jsonResponse({ error: "Invite not found" }, 404);
    }

    return jsonResponse(payload);
  }

  if (request.method === "POST") {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    if (!payload?.topic || !payload?.room || !payload?.passcode || !payload?.host) {
      return jsonResponse({ error: "Missing invite fields" }, 400);
    }

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const id = randomInviteId();
      const existing = await store.get(id);
      if (existing) continue;
      await store.setJSON(id, payload);
      return jsonResponse({ id });
    }

    return jsonResponse({ error: "Could not allocate invite id" }, 503);
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
};
