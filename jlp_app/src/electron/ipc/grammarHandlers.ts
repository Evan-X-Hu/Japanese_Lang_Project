import { ipcMain } from 'electron';
import { getMasterGrammarByUserId, updateMasterGrammar } from '../database/queries/masterGrammar';

export function registerGrammarHandlers(): void {
  ipcMain.handle('grammar:getAll', (_event, userId: number) => {
    return getMasterGrammarByUserId(userId);
  });

  ipcMain.handle('grammar:update', (_event, masterGrammarId: number, data: { level?: number | null; notes?: string | null }) => {
    return updateMasterGrammar(masterGrammarId, data);
  });
}
