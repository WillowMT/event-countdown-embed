# Soft Aurora Visual Refresh — Design Specification

**Date:** 2026-08-12  
**Status:** Approved for implementation

## Goal

Refresh the reusable Event Countdown Embed so it feels less plain while remaining calm, high-legibility, compact, and appropriate for Notion/web embeds.

## Visual Direction

Use a **soft aurora** palette: lavender, blush, sky blue, and mint. Colors must be low-saturation and low-opacity; avoid neon, strong contrast washes, decorative illustrations, animation, or external assets.

## Design Changes

- Replace the flat page background with layered, static radial gradients: lavender at the upper left, blush at the upper right, sky/mint toward lower areas, on an off-white base.
- Give the countdown card a frosted-white/translucent surface, pearlescent border, layered soft shadow, and a subtle interior highlight.
- Add a narrow muted aurora-gradient accent line below the title area. It appears only when non-compact mode displays heading content.
- Replace plain white countdown tiles with very restrained individual pastel gradients and soft edge highlights. Maintain distinct visual separation and accessible dark number/label contrast.
- Retain existing layout, values, URL configuration, state behavior, responsive breakpoints, focus styles, reduced-motion rules, and no-third-party-dependency model.

## Accessibility and Compatibility

- Dark slate text remains unchanged or darker against every pastel surface.
- Gradients are decorative; no information depends on color alone.
- Preserve the non-`color-mix` border fallback.
- Do not add continuous motion; respect `prefers-reduced-motion`.
- Verify desktop, 390px mobile, compact mode, elapsed state, and invalid-config state after deployment.

## Acceptance Criteria

- The production countdown visibly has a subtle multi-pastel aurora atmosphere instead of a flat surface.
- It remains calm and readable, with no clipping/overlap at desktop or narrow mobile dimensions.
- Existing tests remain passing and URLs/functions behave unchanged.
- The Pages production alias is redeployed and visually verified.
