---
'chromaterm': minor
---

Add gradient builder with OKLCH interpolation for smooth, perceptually uniform color transitions.

**1D Gradients:**

- `createGradient(stops, options?)` - Create gradients with any number of color stops
- Sample at any position with `gradient.at(t)` where t is 0-1
- Support for looping gradients (seamless animation)
- Configurable hue interpolation direction: `short`, `long`, `increasing`, `decreasing`
- Optional easing functions for non-linear interpolation

**2D Gradients:**

- `createGradient2D({ x, y }, options?)` - Create gradients with separate X and Y axes
- Sample at any coordinate with `gradient.at(x, y)`
- Blend modes: `multiply`, `overlay`, `average`
- Independent loop settings per axis

**Color Interpolation:**

- `interpolateOklch(color1, color2, t, hueDirection?)` - Direct OKLCH interpolation
- OKLCH color space provides perceptually uniform transitions
- Proper handling of achromatic (gray) colors

**Updated Transforms:**

- `fade()` now uses OKLCH interpolation for smoother results
