import { ipcMain } from 'electron';
import { getMasterGrammarByUserId, updateMasterGrammar } from '../database/queries/masterGrammar';
import { getSegmentsByGrammarAndContent, getSegmentsByGrammarForUser } from '../database/queries/jSegmentGrammar';

export function registerGrammarHandlers(): void {
  ipcMain.handle('grammar:getAll', (_event, userId: number) => {
    return getMasterGrammarByUserId(userId);
  });

  ipcMain.handle('grammar:update', (_event, masterGrammarId: number, data: { level?: number | null; notes?: string | null }) => {
    return updateMasterGrammar(masterGrammarId, data);
  });

  ipcMain.handle('grammar:getSegmentsByContent', (_event, masterGrammarId: number, contentId: number) => {
    return getSegmentsByGrammarAndContent(masterGrammarId, contentId);
  });

  ipcMain.handle('grammar:getSegments', (_event, masterGrammarId: number, userId: number) => {
    return getSegmentsByGrammarForUser(masterGrammarId, userId);
  });
}
