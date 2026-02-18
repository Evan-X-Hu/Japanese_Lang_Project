import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { app } from 'electron';

export interface DownloadResult {
  title: string;
  duration: number | null;
  author: string | null;
  upload_date: string | null;
  link: string;
  audio_path: string | null;
  segments: {
    seq_index: number;
    start_time: number;
    end_time: number;
    text: string;
  }[];
}

/**
 * Walk up from startDir looking for a .venv/bin/python3.
 * Returns the path if found, null otherwise.
 */
function findVenvPython(startDir: string): string | null {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, '.venv', 'bin', 'python3');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
  return null;
}

/**
 * Resolve the command and args for the download script.
 *
 * Dev:      python3 <appPath>/python/download.py <url> <outputDir>
 * Packaged: <resourcesPath>/download <url> <outputDir>  (PyInstaller binary)
 */
function getCommand(url: string, outputDir: string): { cmd: string; args: string[] } {
  if (app.isPackaged) {
    // PyInstaller --onefile binary bundled as extraResource
    const binaryName = process.platform === 'win32' ? 'download.exe' : 'download';
    return {
      cmd: path.join(process.resourcesPath, binaryName),
      args: [url, outputDir],
    };
  }
  // Development: run the .py script directly
  // Walk up from appPath looking for a .venv with yt-dlp installed
  const pythonCmd = findVenvPython(app.getAppPath()) ?? 'python3';

  return {
    cmd: pythonCmd,
    args: [path.join(app.getAppPath(), 'python', 'download.py'), url, outputDir],
  };
}

/**
 * Spawn the download script and return the parsed result.
 * Stdout contains JSON output; stderr contains progress/debug logs.
 */
export function downloadContent(url: string, outputDir: string): Promise<DownloadResult> {
  return new Promise((resolve, reject) => {
    const { cmd, args } = getCommand(url, outputDir);
    console.log('[downloader] Spawning:', cmd, args.join(' '));

    const child = execFile(
      cmd,
      args,
      { timeout: 5 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (stderr) {
          console.log('[downloader] stderr:', stderr);
        }

        if (error) {
          reject(new Error(`Download failed: ${error.message}\n${stderr}`));
          return;
        }

        try {
          const result: DownloadResult = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse download output: ${stdout.slice(0, 200)}`));
        }
      }
    );

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn download process: ${err.message}`));
    });
  });
}
