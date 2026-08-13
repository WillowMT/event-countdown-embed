# Soft Aurora Visual Refresh Implementation Plan

> **For Hermes:** Implement and visually verify this plan in one focused pass.

**Goal:** Upgrade the countdown’s visual layer with subtle lavender, blush, sky, and mint gradients while preserving all behavior and embed compatibility.

**Architecture:** CSS-only refresh. Existing theme custom properties expand from a single card tint to restrained aurora surface tokens; markup and URL behavior remain unchanged.

**Tech Stack:** CSS3, existing static HTML/JavaScript, Cloudflare Pages.

---

### Task 1: Add soft-aurora surface tokens

**Files:**
- Modify: `public/styles.css`

**Steps:**
1. Add static layered radial gradients to `body` using lavender, blush, sky, and mint at low opacity.
2. Expand card theme properties to include glass/surface/highlight colors per accent.
3. Update card background, border, and shadow with frosted-white layers while retaining dark text contrast.
4. Apply subtle per-tile pastel gradient surfaces, with the existing plain border fallback before progressive enhancement.
5. Add a title accent rule using a decorative pseudo-element; compact cards omit the title structurally, so need no special behavior.

### Task 2: Verify and deploy

**Files:**
- No planned source changes beyond CSS.

**Steps:**
1. Run `npm run check` and `git diff --check`.
2. Serve local production assets and capture visual desktop/mobile screenshots.
3. Deploy `public` to Cloudflare Pages.
4. Browser-test the stable production alias at desktop and 390px mobile; confirm no overlap, clipping, or lost contrast.
5. Commit, push, and report stable URL.
