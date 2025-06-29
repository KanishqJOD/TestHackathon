import { openDB, DBSchema } from 'idb';

interface ChatHistoryDB extends DBSchema {
  chat: {
    key: number; // auto-incremented id
    value: {
      id?: number;
      user: string;
      agent: string;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

export async function getChatDB() {
  return openDB<ChatHistoryDB>('chat-history-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('chat')) {
        const store = db.createObjectStore('chat', { keyPath: 'id', autoIncrement: true });
        store.createIndex('by-timestamp', 'timestamp');
      }
    },
  });
}

export async function addChat(user: string, agent: string) {
  const db = await getChatDB();
  await db.add('chat', { user, agent, timestamp: Date.now() });
}

export async function getAllChats() {
  const db = await getChatDB();
  return db.getAll('chat');
}

export async function clearChats() {
  const db = await getChatDB();
  await db.clear('chat');
}