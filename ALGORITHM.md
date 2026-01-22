# Terminal Palette Detection: A Language-Agnostic Guide

This document describes the algorithm and methodology for detecting a terminal's color palette at runtime. It is intended to enable implementers to port this functionality to any programming language.

## Overview

Modern terminal emulators allow programs to query the actual RGB values of their configured color palette using OSC (Operating System Command) escape sequences. By probing these values at runtime, CLI applications can derive colors that harmonize with whatever theme the user has configured—without parsing config files or making assumptions.

## Core Concept

### The Two-Axis Model

Terminal color capability exists on two independent axes:

**C-level (Color Output Capability)**: What color formats can the terminal render?
- C0: No color (non-TTY, `NO_COLOR` set)
- C1: ANSI-16 (standard 16 colors)
- C2: ANSI-256 (extended 256-color palette)
- C3: Truecolor (24-bit RGB)

**T-level (Theme Alignment Capability)**: How much do we know about the user's palette?
- T1: Blind (no theme information)
- T2: Light/Dark (can infer light vs dark mode from fg/bg luminance)
- T3: Full Palette (know RGB values for all 16 ANSI colors)

The combination determines what's possible:
- C3 + T3: Full RGB output, perfectly aligned with user's theme
- C1 + T1: Basic ANSI-16, no transformations possible
- C2 + T3: Theme-aligned colors, quantized to ANSI-256

---

## The Detection Algorithm

### Step 1: Check for TTY

Before any probing, verify that stdin and stdout are connected to a terminal:

```
if not is_tty(stdin) or not is_tty(stdout):
    return T1 (blind mode)
```

### Step 2: Detect VS Code Family (Config Parsing Path)

The VS Code integrated terminal (and derivatives like Cursor, Windsurf) has ~100ms probe latency due to its xterm.js layer. For these, reading the JSON settings file is faster and more reliable.

**Detection signals (macOS):**

| Editor | `TERM_PROGRAM` | `__CFBundleIdentifier` | Other Signals |
|--------|----------------|------------------------|---------------|
| VS Code | `vscode` | `com.microsoft.VSCode` | — |
| Cursor | `vscode` | (unstable build hash) | `CURSOR_CLI` env var |
| Windsurf | `vscode` | `com.exafunction.windsurf` | — |

**Detection logic:**
```
if env("TERM_PROGRAM") == "vscode":
    bundle_id = env("__CFBundleIdentifier") or ""
    
    if "windsurf" in bundle_id:
        config_dir = "~/.windsurf"
    else if env("CURSOR_CLI") exists:
        config_dir = "~/.cursor"
    else:
        config_dir = "~/.vscode"
    
    return parse_vscode_settings(config_dir + "/settings.json")
```

**Settings file schema:**
```json
{
  "workbench.colorCustomizations": {
    "terminal.foreground": "#d4d4d4",
    "terminal.background": "#1e1e1e",
    "terminal.ansiBlack": "#000000",
    "terminal.ansiRed": "#cd3131",
    "terminal.ansiGreen": "#0dbc79",
    "terminal.ansiYellow": "#e5e510",
    "terminal.ansiBlue": "#2472c4",
    "terminal.ansiMagenta": "#bc3fbc",
    "terminal.ansiCyan": "#11a8cd",
    "terminal.ansiWhite": "#e5e5e5",
    "terminal.ansiBrightBlack": "#666666",
    "terminal.ansiBrightRed": "#f14c4c",
    "terminal.ansiBrightGreen": "#23d18b",
    "terminal.ansiBrightYellow": "#f5f543",
    "terminal.ansiBrightBlue": "#3b8eea",
    "terminal.ansiBrightMagenta": "#d670d6",
    "terminal.ansiBrightCyan": "#29b8db",
    "terminal.ansiBrightWhite": "#e5e5e5"
  }
}
```

If parsing fails or file is missing, fall back to OSC probing.

### Step 3: OSC Palette Probing

For native terminals, query the palette using OSC escape sequences.

#### Query Format

OSC queries follow this structure:
```
ESC ] <code> ; ? BEL
```

Where:
- `ESC` = `\x1b` (escape character)
- `]` = literal right bracket
- `<code>` = the OSC code (4, 10, or 11)
- `;` = literal semicolon
- `?` = query marker
- `BEL` = `\x07` (bell character, acts as terminator)

**Queries to send:**

| Query | Purpose |
|-------|---------|
| `ESC ] 4 ; 0 ; ? BEL` | Query ANSI color 0 (black) |
| `ESC ] 4 ; 1 ; ? BEL` | Query ANSI color 1 (red) |
| ... | ... |
| `ESC ] 4 ; 15 ; ? BEL` | Query ANSI color 15 (bright white) |
| `ESC ] 10 ; ? BEL` | Query default foreground |
| `ESC ] 11 ; ? BEL` | Query default background |

**Send all queries in a single write** to minimize round-trips:
```
query_string = ""
for i in 0..15:
    query_string += ESC + "]4;" + str(i) + ";?" + BEL
query_string += ESC + "]10;?" + BEL
query_string += ESC + "]11;?" + BEL

write(stdout, query_string)
```

#### Response Format

Terminals respond with:
```
ESC ] 4 ; <index> ; rgb:<rrrr>/<gggg>/<bbbb> <terminator>
ESC ] 10 ; rgb:<rrrr>/<gggg>/<bbbb> <terminator>
ESC ] 11 ; rgb:<rrrr>/<gggg>/<bbbb> <terminator>
```

Where:
- `<rrrr>`, `<gggg>`, `<bbbb>` are 16-bit hex values (4 hex digits each)
- `<terminator>` is either `BEL` (`\x07`) or `ST` (`\x1b\`)

**Example response:**
```
ESC ] 4 ; 1 ; rgb:cdcd/3131/3131 BEL
```
This indicates ANSI color 1 (red) has RGB value `#cd3131` (using high 8 bits of each 16-bit component).

#### Reading Responses

1. **Set stdin to raw mode** (disable line buffering and echo)
2. **Read with timeout** (100ms is sufficient for native terminals)
3. **Parse responses as they arrive**
4. **Exit early** when all 18 expected responses are received
5. **Restore stdin mode** (always, even on error)

**Pseudocode:**
```
set_raw_mode(stdin)
start_time = now()
buffer = ""
expected_responses = 18  // 16 colors + fg + bg

try:
    while (now() - start_time) < timeout:
        if data_available(stdin):
            buffer += read(stdin)
            
            response_count = count_terminators(buffer)  // count BEL or ST
            if response_count >= expected_responses:
                break
finally:
    restore_mode(stdin)

return parse_responses(buffer)
```

#### Parsing Responses

Use a regex or parser to extract color values:

```
Pattern: ESC ] (4;(\d+);|10;|11;) rgb:([0-9a-f]{4})/([0-9a-f]{4})/([0-9a-f]{4}) (BEL|ST)
```

**Convert 16-bit to 8-bit RGB:**
```
r = parse_hex(rrrr) >> 8  // Take high byte
g = parse_hex(gggg) >> 8
b = parse_hex(bbbb) >> 8
```

### Step 4: Infer T-level

Based on probe results:

```
if all 16 colors + fg + bg received:
    return T3 (full palette)
else if fg and bg received:
    return T2 (light/dark detection)
else:
    return T1 (blind)
```

For T2, determine light vs dark mode by computing background luminance:
```
luminance = 0.299 * r + 0.587 * g + 0.114 * b
is_light_mode = luminance > 128
```

---

## Terminal-Specific Behaviors

### Tested Results (macOS, January 2025)

| Terminal | T-Level | P95 Latency | Terminator | Detection |
|----------|---------|-------------|------------|-----------|
| Ghostty | T3 | 1.4ms | BEL | `TERM_PROGRAM=ghostty` |
| Alacritty | T3 | 1.0ms | BEL | (none reliable) |
| Terminal.app | T3 | 1.7ms | BEL | `TERM_PROGRAM=Apple_Terminal` |
| kitty | T3 | 6.0ms | ST | `TERM=xterm-kitty` |
| iTerm2 | T3 | <10ms | ST | `TERM_PROGRAM=iTerm.app` |
| Hyper | T3 | <10ms | ST | `TERM_PROGRAM=Hyper` |
| VS Code | T3 | 114ms | ST | Use config parsing |
| Warp | T2 | N/A | BEL | `TERM_PROGRAM=WarpTerminal` |

### Tested Results (Linux, January 2025)

| Terminal | T-Level | Detection |
|----------|---------|-----------|
| GNOME Terminal (Ubuntu) | T3 | `TERM=xterm-256color` |

### Known Edge Cases

**Warp**: Ignores OSC 4 (palette queries) but responds to OSC 10/11 (fg/bg). Detect via `TERM_PROGRAM=WarpTerminal` and cap at T2.

**tmux**: Passes OSC queries through to the outer terminal transparently. Detect via `TERM_PROGRAM=tmux` or presence of `$TMUX` environment variable. Note: tmux inside Warp fails completely (T1).

**SSH**: Works but may have higher latency. Consider increasing timeout to 200-500ms for remote sessions.

---

## Color Transformation Pipeline

Once you have the palette (T3), you can derive new colors:

### 1. Convert RGB to HSL

```
function rgb_to_hsl(r, g, b):
    r, g, b = r/255, g/255, b/255
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    l = (max_c + min_c) / 2
    
    if max_c == min_c:
        h = s = 0
    else:
        d = max_c - min_c
        s = d / (2 - max_c - min_c) if l > 0.5 else d / (max_c + min_c)
        
        if max_c == r:
            h = (g - b) / d + (6 if g < b else 0)
        else if max_c == g:
            h = (b - r) / d + 2
        else:
            h = (r - g) / d + 4
        
        h = h / 6
    
    return (h * 360, s, l)
```

### 2. Apply Transformations

```
function saturate(hsl, amount):
    h, s, l = hsl
    return (h, clamp(s + amount, 0, 1), l)

function lighten(hsl, amount):
    h, s, l = hsl
    return (h, s, clamp(l + amount, 0, 1))

function rotate(hsl, degrees):
    h, s, l = hsl
    return ((h + degrees) % 360, s, l)
```

### 3. Convert Back to RGB

```
function hsl_to_rgb(h, s, l):
    if s == 0:
        r = g = b = l
    else:
        function hue_to_rgb(p, q, t):
            if t < 0: t += 1
            if t > 1: t -= 1
            if t < 1/6: return p + (q - p) * 6 * t
            if t < 1/2: return q
            if t < 2/3: return p + (q - p) * (2/3 - t) * 6
            return p
        
        q = l * (1 + s) if l < 0.5 else l + s - l * s
        p = 2 * l - q
        r = hue_to_rgb(p, q, h/360 + 1/3)
        g = hue_to_rgb(p, q, h/360)
        b = hue_to_rgb(p, q, h/360 - 1/3)
    
    return (round(r * 255), round(g * 255), round(b * 255))
```

### 4. Render Based on C-level

```
function render_color(rgb, c_level):
    r, g, b = rgb
    
    if c_level == C3:  // Truecolor
        return ESC + "[38;2;" + r + ";" + g + ";" + b + "m"
    
    else if c_level == C2:  // ANSI-256
        index = quantize_to_ansi256(r, g, b)
        return ESC + "[38;5;" + index + "m"
    
    else if c_level == C1:  // ANSI-16
        // Fall back to nearest base ANSI color
        index = nearest_ansi16(r, g, b)
        return ESC + "[" + (30 + index) + "m"
    
    else:  // C0 - no color
        return ""
```

---

## Testing Methodology

### Unit Tests

Test pure functions in isolation:

1. **RGB ↔ HSL conversion**: Round-trip known colors
2. **Transformations**: Verify saturation, lightness, rotation math
3. **Response parsing**: Handle well-formed and malformed OSC responses
4. **Quantization**: RGB to ANSI-256 mapping

### Integration Tests

Mock the terminal to test the full pipeline:

1. Inject mock OSC responses
2. Verify T-level inference
3. Verify color transformation chain
4. Verify escape sequence output

### Real Terminal Tests

Create a visual test harness that displays:

1. Detected capabilities (C-level, T-level)
2. Base ANSI colors (should match terminal theme)
3. Derived colors (saturated, lightened, rotated versions)
4. Instructions to change theme and re-run

**Test in each target terminal:**
- Verify capabilities detected correctly
- Verify base colors match terminal's actual theme
- Verify derived colors are visually correct
- Verify changing theme + re-running shows updated colors

### Probe Timing Benchmark

Measure probe latency to validate performance assumptions:

```
for i in 1..N:
    start = high_resolution_timer()
    
    send_queries()
    set_raw_mode()
    
    first_response_time = null
    all_responses_time = null
    
    while not timeout:
        if data_available():
            if first_response_time == null:
                first_response_time = now() - start
            
            read_and_parse()
            
            if all_responses_received:
                all_responses_time = now() - start
                break
    
    restore_mode()
    record(first_response_time, all_responses_time)

report_statistics(min, max, median, p95)
```

Expected results for native terminals: P95 < 10ms.

---

## Fallback Strategy

When probing fails or is unavailable, use a hardcoded fallback palette:

```
FALLBACK_PALETTE = {
    black:         (0, 0, 0),
    red:           (205, 49, 49),
    green:         (13, 188, 121),
    yellow:        (229, 229, 16),
    blue:          (36, 114, 200),
    magenta:       (188, 63, 188),
    cyan:          (17, 168, 205),
    white:         (229, 229, 229),
    bright_black:  (102, 102, 102),
    bright_red:    (241, 76, 76),
    bright_green:  (35, 209, 139),
    bright_yellow: (245, 245, 67),
    bright_blue:   (59, 142, 234),
    bright_magenta:(214, 112, 214),
    bright_cyan:   (41, 184, 219),
    bright_white:  (255, 255, 255),
}
```

These are based on typical terminal defaults and provide reasonable starting points for transformations.

---

## Implementation Checklist

For a complete implementation, ensure:

- [ ] TTY detection before probing
- [ ] VS Code family detection and config parsing
- [ ] OSC query generation (all 18 queries in one write)
- [ ] Raw mode handling with guaranteed cleanup
- [ ] Timeout-based reading with early exit
- [ ] Response parsing for both BEL and ST terminators
- [ ] T-level inference from probe results
- [ ] RGB ↔ HSL conversion
- [ ] Saturation, lightness, rotation transformations
- [ ] ANSI-256 quantization
- [ ] Escape sequence generation for C1/C2/C3
- [ ] Graceful degradation (never crash on probe failure)
- [ ] Fallback palette for T1 mode

---

## References

- [XTerm Control Sequences](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html) - Authoritative OSC documentation
- [ANSI Escape Codes (Wikipedia)](https://en.wikipedia.org/wiki/ANSI_escape_code) - General reference
- [terminal-light (Rust)](https://github.com/Canop/terminal-light) - Rust implementation of background detection
- [CLITHEME Proposal](https://wiki.tau.garden/cli-theme/) - Emerging standard for CLI theme preferences

---

## License

This algorithm documentation is provided for the purpose of enabling implementations in any programming language. The concepts described are based on publicly documented terminal escape sequences and are not subject to patent or proprietary restrictions.
