import { ipcMain } from 'electron';
import { InsertUser } from '../database/schema/index';
import { createUser, getAllUsers, getUserByEmail, getUserById, deleteUser } from '../database/queries/user';
import { seedGrammarForUser } from '../database/queries/masterGrammar';
import { getCurrentUserId, setCurrentUserId } from '../session';

export function registerUserHandlers(): void {
  ipcMain.handle('user:getAll', () => {
    return getAllUsers();
  });

  // Creates a new user and seeds their master grammar list
  ipcMain.handle('user:create', (_event, data: InsertUser) => {
    const newUser = createUser(data);
    seedGrammarForUser(newUser.userId);
    return newUser;
  });

  ipcMain.handle('user:getCurrent', () => {
    const userId = getCurrentUserId();
    if (userId === null) return null;
    return getUserById(userId) ?? null;
  });

  ipcMain.handle('user:setCurrent', (_event, userId: number) => {
    setCurrentUserId(userId);
    return getUserById(userId) ?? null;
  });

  // Returns the user on success, null if email not found, or throws if password wrong
  ipcMain.handle('user:signIn', (_event, email: string, password: string) => {
    const found = getUserByEmail(email);
    if (!found) return null;
    if (found.password !== password) throw new Error('Incorrect password.');
    setCurrentUserId(found.userId);
    return found;
  });

  ipcMain.handle('user:delete', (_event, userId: number) => {
    if (getCurrentUserId() === userId) setCurrentUserId(null);
    deleteUser(userId);
  });
}
