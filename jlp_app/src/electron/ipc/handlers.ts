import path from 'path';
import { ipcMain, app } from 'electron';
import { InsertJContent } from '../database/schema/index';
import {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../database/queries/jContent';
import { createSegments } from '../database/queries/jSegment';
import { downloadContent } from '../services/downloader';

export function registerContentHandlers(): void {
  ipcMain.handle('content:getAll', () => {
    return getAllContent();
  });

  ipcMain.handle('content:getById', (_event, contentId: number) => {
    return getContentById(contentId);
  });

  ipcMain.handle('content:create', (_event, data: InsertJContent) => {
    return createContent(data);
  });

  ipcMain.handle('content:update', (_event, contentId: number, data: Partial<InsertJContent>) => {
    return updateContent(contentId, data);
  });

  ipcMain.handle('content:delete', (_event, contentId: number) => {
    return deleteContent(contentId);
  });

  ipcMain.handle('content:import', async (_event, url: string) => {
    const outputDir = path.join(app.getPath('userData'), 'media');
    console.log('[import] Starting import for:', url);
    console.log('[import] Output dir:', outputDir);
    console.log('[import] App path:', app.getAppPath());

    const result = await downloadContent(url, outputDir);
    console.log('[import] Download complete:', result.title);

    // Parse upload_date string (YYYYMMDD) into a Date
    let uploadDate: Date | null = null;
    if (result.upload_date) {
      const y = parseInt(result.upload_date.slice(0, 4));
      const m = parseInt(result.upload_date.slice(4, 6)) - 1;
      const d = parseInt(result.upload_date.slice(6, 8));
      uploadDate = new Date(y, m, d);
    }

    // Insert content record
    const content = createContent({
      title: result.title ?? null,
      duration: result.duration ?? null,
      author: result.author ?? null,
      uploadDate: uploadDate,
      link: result.link,
      audio: result.audio_path ?? null,
    });

    // Bulk insert segment records
    if (result.segments.length > 0) {
      createSegments(
        result.segments.map((seg) => ({
          contentId: content.contentId,
          seqIndex: seg.seq_index,
          startTime: seg.start_time,
          endTime: seg.end_time,
          text: seg.text,
        }))
      );
    }

    return content;
  });
}
