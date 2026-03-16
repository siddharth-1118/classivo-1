export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface GoscrapeRow {
  regNumber: string;
  token: string; // encoded token (utils.Encode(cookie))
  user?: Json; // encrypted JSON in DB, decrypted at read
  timetable?: Json; // plaintext JSON string in DB per Go; treat as parsed JSON in app
  attendance?: Json; // encrypted JSON in DB, decrypted at read
  marks?: Json; // encrypted JSON in DB, decrypted at read
  ophour?: string | null; // optional string fetched separately
  lastUpdated?: number; // epoch ms
}

export interface GocalRow {
  id?: string | number;
  date: string;
  month: string;
  day: string;
  order: string;
  event: string;
  created_at?: number;
}

type GocalInsert = Omit<GocalRow, "id"> & { id?: string | number };

export type Database = {
  public: {
    Tables: {
      gocal: {
        Row: GocalRow;
        Insert: GocalInsert;
        Update: Partial<GocalInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
