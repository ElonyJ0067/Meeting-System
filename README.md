# Aster Ridge Recruiting Demo

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

This project does not need a build step.

1. Upload the folder to Netlify, or connect this folder as a repository.
2. Keep the build command empty.
3. Use `.` as the publish directory.

The included `netlify.toml` already sets the publish directory.

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

Default code in the repo is `aster-ridge-host` — change it before sharing publicly.

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

## Share Link Options

You can customize the first screen with URL parameters:

```text
https://your-site.netlify.app/?name=Jordan%20Lee&topic=Aster%20Ridge%20Candidate%20Interview
```

The invite button inside the meeting creates a shareable URL with the interview topic
and room code:

```text
https://your-site.netlify.app/?topic=Aster%20Ridge%20Candidate%20Interview&room=482%20931%20774&passcode=814205&invite=1
```

When a visitor opens an invite URL, the page briefly shows an "Opening meeting"
screen, preloads the room details, and then lets them join the same visual meeting
simulation locally. Every visitor sees the same styled meeting-room experience,
but there is no real live call or server synchronization.
