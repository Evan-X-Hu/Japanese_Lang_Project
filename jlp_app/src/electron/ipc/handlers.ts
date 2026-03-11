import path from 'path';
import { ipcMain, app } from 'electron';
import { InsertJContent } from '../database/schema/index';
import {
  getContentByUserId,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  linkContentToUser,
} from '../database/queries/jContent';
import { createSegments } from '../database/queries/jSegment';
import { linkGrammarToSegments } from '../database/queries/jSegmentGrammar';
import { downloadContent } from '../services/downloader';
import { detect } from '../services/grammarParser';

const MIN_SEGMENT_LENGTH = 8;

export function registerContentHandlers(): void {
  ipcMain.handle('content:getAll', (_event, userId: number) => {
    return getContentByUserId(userId);
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

  ipcMain.handle('content:import', async (_event, url: string, userId: number) => {
    if (!userId || userId < 1) throw new Error('You must be signed in to import content.');
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
      video: result.video_path ?? null,
      vtt: result.vtt_path ?? null,
    });

    // Link content to user
    linkContentToUser(content.contentId, userId);

    // Bulk insert segment records, filtering out short segments before grammar detection
    if (result.segments.length > 0) {
      const segments = createSegments(
        result.segments.map((seg) => ({
          contentId: content.contentId,
          seqIndex: seg.seq_index,
          startTime: seg.start_time,
          endTime: seg.end_time,
          text: seg.text,
        }))
      );

      // Run grammar detection on segments that meet the minimum length threshold
      console.log(`[import] userId=${userId}, total segments=${segments.length}`);
      const pairs: Array<{ segmentId: number; grammarId: number }> = [];
      let skipped = 0;
      for (const seg of segments) {
        if (!seg.text || seg.text.length < MIN_SEGMENT_LENGTH) { skipped++; continue; }
        const grammarIds = detect(seg.text);
        for (const grammarId of grammarIds) {
          pairs.push({ segmentId: seg.segmentId, grammarId });
        }
      }
      console.log(`[import] Skipped ${skipped} short segments, found ${pairs.length} grammar pairs`);

      if (pairs.length > 0) {
        linkGrammarToSegments(userId, pairs);
        console.log(`[import] linkGrammarToSegments complete`);
      } else {
        console.log(`[import] No grammar pairs to insert`);
      }
    }

    return content;
  });
}
