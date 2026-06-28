# Interview Portal Demo

A static, visual-only fictional recruiting interview interface that can be
deployed to Netlify.

It is designed to feel like a polished candidate hiring panel prototype from
the viewer side:

- Host dashboard for creating a meeting and copying an invitation link.
- Guest invite flow with an "Opening meeting" screen and waiting-room style join steps.
- Cloud-style secure-browser verification overlay after joining the room, started by candidate click.
- Prejoin screen with candidate name, interview topic, microphone, and camera controls.
- Professional device check with an intentional camera-not-recognized state.
- Hiring panel with fictional recruiter, hiring manager, team interviewer, technical interviewer, and people operations reviewer.
- In-room interview brief with role, round, panel, agenda, policy, and duration details.
- Live system events for waiting-room admission, camera troubleshooting, join status, and policy status.
- Meeting gallery with fake participants, active speaker highlighting, and timer.
- Local-only chat, participants panel, invite dialog, reactions, and screen-share banner.
- No real camera, microphone, recording, WebRTC, or server connection.

This is a fictional prototype. Do not use it to impersonate a real company or
conduct deceptive hiring.

## Deploy to Netlify

1. Connect this repository to Netlify (or upload the folder).
2. Use the included `netlify.toml` build settings (`npm install` + host config).
3. Publish directory: `.`

Optional environment variables in **Site settings → Environment variables**:

| Variable | Purpose |
|----------|---------|
| `HOST_ACCESS_CODE` | Host console access code |
| `HOST_ACCESS_ENABLED` | Set to `false` to disable the host gate |
| `INVITE_SITE_ORIGIN` | Public site URL (example: `https://meetlyz.netlify.app`) |

The included `netlify.toml` already sets the publish directory and invite redirects.

## Host access code (optional gate)

By default, **creating a meeting** requires a host code. **Guests with an invite link are not affected.**

1. In Netlify: **Site settings → Environment variables**
2. Add `HOST_ACCESS_CODE` with your secret (example: `my-company-host-2026`)
3. Redeploy the site

Optional: set `HOST_ACCESS_ENABLED` to `false` to turn the gate off.

For local testing, edit `host-config.js` or run:

```bash
node scripts/generate-host-config.js
```

Change the default host code before sharing publicly.

This is a casual deterrent, not strong security. Technical users can bypass it.

## Demo Flow

1. Open the deployed site.
2. Enter a host name, interview topic, and duration.
3. Click **Create meeting**.
4. Copy the generated invitation link and send it to a friend.
5. The friend opens the link, sees the meeting launch flow, joins the visual
   interview room, then clicks a cloud-style secure-browser verification button.

The camera warning is intentional. It presents a realistic browser permission
issue and gives the candidate clear troubleshooting steps: allow camera access,
close other apps using the camera, reconnect the device, and refresh.

## Invite links

Creating a meeting generates a short invite URL:

```text
https://meetlyz.netlify.app/inv/K8F2N9QPLM
```

On Netlify, invite details are stored server-side so links work in any browser.
Local `file://` testing uses browser storage and only works in the same browser.

## Share Link Options (legacy)

You can customize the first screen with URL parameters:

```text
https://meetlyz.netlify.app/?name=Jordan%20Lee&topic=Intro%20Call
```

Legacy query-string invite URLs still open, but new invites use the short `/inv/` format:

```text
https://meetlyz.netlify.app/inv/K8F2N9QPLM
```

When a visitor opens an invite URL, the page briefly shows an "Opening meeting"
screen, preloads the room details, and then lets them join the same visual meeting
simulation locally. Every visitor sees the same styled meeting-room experience,
but there is no real live call or server synchronization.
