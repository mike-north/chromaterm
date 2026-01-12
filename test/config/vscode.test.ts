import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseVSCodeSettings } from '../../src/config/index.js';
import type { VSCodeFamilyInfo } from '../../src/config/index.js';

// Fixture data as strings
const FIXTURES = {
  'settings-full': JSON.stringify({
    'workbench.colorCustomizations': {
      'terminal.foreground': '#d4d4d4',
      'terminal.background': '#1e1e1e',
      'terminal.ansiBlack': '#000000',
      'terminal.ansiRed': '#cd3131',
      'terminal.ansiGreen': '#0dbc79',
      'terminal.ansiYellow': '#e5e510',
      'terminal.ansiBlue': '#2472c4',
      'terminal.ansiMagenta': '#bc3fbc',
      'terminal.ansiCyan': '#11a8cd',
      'terminal.ansiWhite': '#e5e5e5',
      'terminal.ansiBrightBlack': '#666666',
      'terminal.ansiBrightRed': '#f14c4c',
      'terminal.ansiBrightGreen': '#23d18b',
      'terminal.ansiBrightYellow': '#f5f543',
      'terminal.ansiBrightBlue': '#3b8eea',
      'terminal.ansiBrightMagenta': '#d670d6',
      'terminal.ansiBrightCyan': '#29b8db',
      'terminal.ansiBrightWhite': '#e5e5e5',
    },
  }),
  'settings-partial': JSON.stringify({
    'workbench.colorCustomizations': {
      'terminal.foreground': '#ffffff',
      'terminal.ansiRed': '#ff0000',
      'terminal.ansiGreen': '#00ff00',
      'terminal.ansiBlue': '#0000ff',
    },
    'editor.fontSize': 14,
    'files.autoSave': 'onFocusChange',
  }),
  'settings-empty': JSON.stringify({
    'editor.fontSize': 14,
    'files.autoSave': 'onFocusChange',
  }),
  'settings-empty-customizations': JSON.stringify({
    'workbench.colorCustomizations': {},
  }),
};

// Mock fs module
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    readFileSync: vi.fn(),
  };
});

// Mock os module to control homedir
vi.mock('node:os', () => ({
  homedir: () => '/mock/home',
}));

describe('parseVSCodeSettings', () => {
  // Import mocked readFileSync
  let mockReadFileSync: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const fs = await import('node:fs');
    mockReadFileSync = vi.mocked(fs.readFileSync);
    mockReadFileSync.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful parsing', () => {
    it('should parse full settings with all colors', () => {
      mockReadFileSync.mockReturnValue(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(result?.foreground).toEqual({ r: 212, g: 212, b: 212 });
      expect(result?.background).toEqual({ r: 30, g: 30, b: 30 });
      expect(result?.colors.size).toBe(16);

      // Check a few specific colors
      expect(result?.colors.get(0)).toEqual({ r: 0, g: 0, b: 0 }); // black
      expect(result?.colors.get(1)).toEqual({ r: 205, g: 49, b: 49 }); // red
      expect(result?.colors.get(2)).toEqual({ r: 13, g: 188, b: 121 }); // green
      expect(result?.colors.get(15)).toEqual({ r: 229, g: 229, b: 229 }); // bright white
    });

    it('should parse partial settings with some colors', () => {
      mockReadFileSync.mockReturnValue(FIXTURES['settings-partial']);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(result?.foreground).toEqual({ r: 255, g: 255, b: 255 });
      expect(result?.background).toBeNull();
      expect(result?.colors.size).toBe(3);

      expect(result?.colors.get(1)).toEqual({ r: 255, g: 0, b: 0 }); // red
      expect(result?.colors.get(2)).toEqual({ r: 0, g: 255, b: 0 }); // green
      expect(result?.colors.get(4)).toEqual({ r: 0, g: 0, b: 255 }); // blue
    });

    it('should handle empty color customizations', () => {
      mockReadFileSync.mockReturnValue(FIXTURES['settings-empty-customizations']);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(result?.foreground).toBeNull();
      expect(result?.background).toBeNull();
      expect(result?.colors.size).toBe(0);
    });

    it('should skip invalid hex colors', () => {
      const settingsWithInvalidColor = JSON.stringify({
        'workbench.colorCustomizations': {
          'terminal.foreground': '#ffffff',
          'terminal.ansiRed': 'not-a-color',
          'terminal.ansiGreen': '#00ff00',
        },
      });
      mockReadFileSync.mockReturnValue(settingsWithInvalidColor);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(result?.foreground).toEqual({ r: 255, g: 255, b: 255 });
      expect(result?.colors.size).toBe(1);
      expect(result?.colors.get(1)).toBeUndefined(); // red was invalid
      expect(result?.colors.get(2)).toEqual({ r: 0, g: 255, b: 0 }); // green is valid
    });
  });

  describe('fallback behavior', () => {
    it('should try primary path first', () => {
      mockReadFileSync.mockReturnValue(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = { editor: 'cursor', configDir: '.cursor' };
      parseVSCodeSettings(info);

      // First call should be to the cursor config
      expect(mockReadFileSync).toHaveBeenCalledWith(
        '/mock/home/.cursor/User/settings.json',
        'utf-8'
      );
    });

    it('should try fallback paths when primary fails', () => {
      mockReadFileSync
        .mockImplementationOnce(() => {
          throw new Error('ENOENT');
        })
        .mockImplementationOnce(() => {
          throw new Error('ENOENT');
        })
        .mockReturnValueOnce(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = { editor: 'cursor', configDir: '.cursor' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(mockReadFileSync).toHaveBeenCalledTimes(3);
      expect(mockReadFileSync).toHaveBeenNthCalledWith(
        1,
        '/mock/home/.cursor/User/settings.json',
        'utf-8'
      );
      expect(mockReadFileSync).toHaveBeenNthCalledWith(
        2,
        '/mock/home/.vscode/User/settings.json',
        'utf-8'
      );
      expect(mockReadFileSync).toHaveBeenNthCalledWith(
        3,
        '/mock/home/.cursor/User/settings.json',
        'utf-8'
      );
    });

    it('should skip files with no color customizations', () => {
      mockReadFileSync
        .mockReturnValueOnce(FIXTURES['settings-empty'])
        .mockReturnValueOnce(FIXTURES['settings-partial']);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should return null when no config files exist', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).toBeNull();
    });

    it('should return null when all config files have invalid JSON', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new SyntaxError('Unexpected token');
      });

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).toBeNull();
    });

    it('should continue to next file on JSON parse error', () => {
      mockReadFileSync
        .mockImplementationOnce(() => {
          throw new SyntaxError('Invalid JSON');
        })
        .mockReturnValueOnce(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });

    it('should continue to next file on read error', () => {
      mockReadFileSync
        .mockImplementationOnce(() => {
          throw new Error('EACCES: permission denied');
        })
        .mockReturnValueOnce(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('different editors', () => {
    it('should handle VS Code config', () => {
      mockReadFileSync.mockReturnValue(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = { editor: 'vscode', configDir: '.vscode' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(mockReadFileSync).toHaveBeenCalledWith(
        '/mock/home/.vscode/User/settings.json',
        'utf-8'
      );
    });

    it('should handle Cursor config', () => {
      mockReadFileSync.mockReturnValue(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = { editor: 'cursor', configDir: '.cursor' };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(mockReadFileSync).toHaveBeenCalledWith(
        '/mock/home/.cursor/User/settings.json',
        'utf-8'
      );
    });

    it('should handle Windsurf config', () => {
      mockReadFileSync.mockReturnValue(FIXTURES['settings-full']);

      const info: VSCodeFamilyInfo = {
        editor: 'windsurf',
        configDir: '.windsurf',
      };
      const result = parseVSCodeSettings(info);

      expect(result).not.toBeNull();
      expect(mockReadFileSync).toHaveBeenCalledWith(
        '/mock/home/.windsurf/User/settings.json',
        'utf-8'
      );
    });
  });
});
