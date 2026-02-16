import { ipcMain } from 'electron';
import { InsertJContent } from '../database/schema/index';
import {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../database/queries/jContent';

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
}
