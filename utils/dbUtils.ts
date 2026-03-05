
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Item } from '../types';

// Hardcoded Supabase Credentials
const SUPABASE_URL = 'https://vnnsbqrhkvqkjebdgkvf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubnNicXJoa3Zxa2plYmRna3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQzMTgsImV4cCI6MjA4NTk3MDMxOH0.8PamO6DIUaZE2sVee8aCJ-oR9QrpmxK90SVZo8bft9Y';

const DB_NAME = 'ai_marketplace_local';
const DB_VERSION = 4; 
const STORE_NAME = 'items';

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject('Error opening local database');
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Fetches all items from Supabase, prioritizing the 'additional_images' column
 * for the carousel feature.
 */
export const getAllItems = async (): Promise<Item[]> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Supabase Fetch Error: ${error.message}`);
    
    const mappedData = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      imageUrl: row.imageurl || row.imageUrl,
      // Prioritize additional_images from Supabase column
      imageUrls: Array.isArray(row.additional_images) ? row.additional_images : [],
      isSelected: row.isselected !== undefined ? row.isselected : true 
    }));
    
    // Update local cache with fresh data from cloud
    const db = await initIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    mappedData.forEach(item => store.put(item));
    
    return mappedData as Item[];
  } catch (err: any) {
    console.warn("Cloud fetch failed, falling back to local storage", err);
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching local items');
    });
  }
};

/**
 * Saves or updates an item in Supabase, specifically syncing the imageUrls array
 * to the 'additional_images' column.
 */
export const saveItem = async (item: Item): Promise<void> => {
  // 1. Sync locally first for instant UI response and persistence
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(item);
  } catch (localErr) {
    console.warn("Local storage sync failed", localErr);
  }

  // 2. Sync to Cloud (Supabase)
  try {
    const payload = {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      imageurl: item.imageUrl,
      isselected: item.isSelected,
      // Map imageUrls array to the Supabase JSONB/Array column
      additional_images: item.imageUrls || [] 
    };

    const { error } = await supabase
      .from('items')
      .upsert(payload, { onConflict: 'id' });
    
    if (error) {
      console.error("Cloud Sync Error:", error.message);
      // If the specific column is missing, we log it clearly for the user
      if (error.message.includes('additional_images')) {
        console.error("CRITICAL: The 'additional_images' column does not exist in your Supabase 'items' table.");
      }
      throw new Error(`Sync failed: ${error.message}`);
    }
  } catch (err: any) {
    console.error("Database persistence exception:", err);
    throw err;
  }
};

export const deleteItemFromDB = async (id: string): Promise<void> => {
  const { error } = await supabase.from('items').delete().eq('id', id);
  
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
  } catch (e) {
    console.warn("Local delete failed");
  }

  if (error) throw new Error(`Cloud delete failed: ${error.message}`);
};
