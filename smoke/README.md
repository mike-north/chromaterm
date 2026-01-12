# ChromaTerm Smoke Tests

Manual verification tool for visual testing of ChromaTerm in real terminals.

## Running

```bash
pnpm smoke
```

## What It Does

The smoke test CLI displays:

1. **Terminal Capabilities**: Detected color level, theme level, TTY status
2. **Basic Colors**: All 16 ANSI colors (black through brightWhite)
3. **Color Transforms**: Saturate, lighten, darken, and rotate transformations
4. **Text Modifiers**: Bold, dim, italic, underline, strikethrough
5. **Background Colors**: Text on colored backgrounds and inverse rendering

## Test Matrix

Run the smoke test in different terminal emulators to verify rendering:

### macOS Terminals

- [ ] **kitty** - Modern GPU-accelerated terminal
- [ ] **Ghostty** - Fast native terminal
- [ ] **iTerm2** - Popular feature-rich terminal
- [ ] **Terminal.app** - macOS default terminal
- [ ] **Alacritty** - GPU-accelerated, minimal
- [ ] **VS Code** - Integrated terminal
- [ ] **Hyper** - Electron-based terminal

### Linux Terminals

- [ ] **kitty**
- [ ] **GNOME Terminal**
- [ ] **Konsole**
- [ ] **Alacritty**
- [ ] **xterm**

### Windows Terminals

- [ ] **Windows Terminal**
- [ ] **PowerShell**
- [ ] **Command Prompt**
- [ ] **WSL** (with any Linux terminal)

## What to Check

### 1. Base Colors

- All 16 colors should be **distinct** from each other
- Colors should **match your terminal theme**
- Bright variants should be visibly brighter than normal variants
- Colors should look natural (not oversaturated or washed out)

### 2. Theme Alignment

- If using a dark theme, colors should work well on dark background
- If using a light theme, colors should work well on light background
- Switch your terminal theme and re-run to verify both modes

### 3. Transforms

- **Saturate**: Colors should appear more vivid/intense
- **Lighten**: Colors should be noticeably lighter
- **Darken**: Colors should be noticeably darker
- **Rotate**: Colors should shift to different hues (e.g., red → orange, blue → purple)

### 4. Text Modifiers

- **Bold**: Text should be thicker/bolder
- **Dim**: Text should be fainter
- **Italic**: Text should be slanted (not supported in all terminals)
- **Underline**: Text should have underline
- **Strikethrough**: Text should have line through it (not supported in all terminals)

### 5. Backgrounds

- Background colors should fill the space behind text
- Text should be readable on colored backgrounds
- Inverse should swap foreground and background

## Troubleshooting

### Colors Don't Match Terminal Theme

Check the "Theme Level" in capabilities:

- **blind**: No theme detection, using default colors
- **lightdark**: Basic light/dark detection only
- **palette**: Full palette detection (T3)

If showing "blind" or "lightdark" but your terminal supports OSC queries, this may indicate:

- Terminal doesn't respond to OSC queries fast enough (increase `probeTimeout`)
- Terminal doesn't support OSC queries for palette colors

### No Color Output

Check the "Color Level" in capabilities:

- **none**: Color disabled (force enable with `FORCE_COLOR=1`)
- **ansi16**: Basic 16 colors only
- **ansi256**: 256-color support
- **truecolor**: Full RGB color support

### Transforms Don't Work

Transforms require:

- Theme level must be "palette" (T3)
- Terminal must support truecolor
- If T1/T2, transforms fall back to nearest ANSI color

## Development Notes

The smoke test is **not** an automated test. It's a manual verification tool for:

- Testing in different terminals during development
- Verifying color rendering before releases
- Debugging color issues in specific terminals
- Demonstrating library capabilities

For automated testing, see the test suite in `/test`.
