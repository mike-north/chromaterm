import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectVSCodeFamily } from '../../src/config/index.js';

describe('detectVSCodeFamily', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment to clean state
    process.env = { ...originalEnv };
    delete process.env['TERM_PROGRAM'];
    delete process.env['__CFBundleIdentifier'];
    delete process.env['CURSOR_CLI'];
    delete process.env['CURSOR_TRACE_ID'];
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('non-VS Code environments', () => {
    it('should return null when TERM_PROGRAM is not set', () => {
      expect(detectVSCodeFamily()).toBeNull();
    });

    it('should return null when TERM_PROGRAM is not vscode', () => {
      process.env['TERM_PROGRAM'] = 'iTerm.app';
      expect(detectVSCodeFamily()).toBeNull();
    });

    it('should return null when TERM_PROGRAM is other terminal', () => {
      process.env['TERM_PROGRAM'] = 'Apple_Terminal';
      expect(detectVSCodeFamily()).toBeNull();
    });
  });

  describe('VS Code detection', () => {
    it('should detect VS Code via bundle ID', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['__CFBundleIdentifier'] = 'com.microsoft.VSCode';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'vscode',
        configDir: '.vscode',
      });
    });

    it('should detect VS Code with case insensitive TERM_PROGRAM', () => {
      process.env['TERM_PROGRAM'] = 'VSCode';
      process.env['__CFBundleIdentifier'] = 'com.microsoft.VSCode';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'vscode',
        configDir: '.vscode',
      });
    });

    it('should default to vscode when bundle ID is not recognized', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['__CFBundleIdentifier'] = 'com.unknown.editor';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'vscode',
        configDir: '.vscode',
      });
    });

    it('should default to vscode when no bundle ID is present', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'vscode',
        configDir: '.vscode',
      });
    });
  });

  describe('Cursor detection', () => {
    it('should detect Cursor via CURSOR_CLI env var', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['CURSOR_CLI'] = '1';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'cursor',
        configDir: '.cursor',
      });
    });

    it('should detect Cursor via CURSOR_TRACE_ID env var', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['CURSOR_TRACE_ID'] = 'some-trace-id';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'cursor',
        configDir: '.cursor',
      });
    });

    it('should detect Cursor with both env vars set', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['CURSOR_CLI'] = '1';
      process.env['CURSOR_TRACE_ID'] = 'some-trace-id';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'cursor',
        configDir: '.cursor',
      });
    });

    it('should prioritize Windsurf bundle ID over Cursor env vars', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['__CFBundleIdentifier'] = 'com.exafunction.windsurf';
      process.env['CURSOR_CLI'] = '1';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'windsurf',
        configDir: '.windsurf',
      });
    });

    it('should prioritize VS Code bundle ID over Cursor env vars', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['__CFBundleIdentifier'] = 'com.microsoft.VSCode';
      process.env['CURSOR_CLI'] = '1';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'vscode',
        configDir: '.vscode',
      });
    });
  });

  describe('Windsurf detection', () => {
    it('should detect Windsurf via bundle ID', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['__CFBundleIdentifier'] = 'com.exafunction.windsurf';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'windsurf',
        configDir: '.windsurf',
      });
    });

    it('should detect Windsurf with partial bundle ID match', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['__CFBundleIdentifier'] = 'com.exafunction.windsurf.someversion';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'windsurf',
        configDir: '.windsurf',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty TERM_PROGRAM', () => {
      process.env['TERM_PROGRAM'] = '';
      expect(detectVSCodeFamily()).toBeNull();
    });

    it('should handle empty bundle ID', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      process.env['__CFBundleIdentifier'] = '';
      expect(detectVSCodeFamily()).toEqual({
        editor: 'vscode',
        configDir: '.vscode',
      });
    });

    it('should handle undefined bundle ID', () => {
      process.env['TERM_PROGRAM'] = 'vscode';
      delete process.env['__CFBundleIdentifier'];
      expect(detectVSCodeFamily()).toEqual({
        editor: 'vscode',
        configDir: '.vscode',
      });
    });
  });
});
