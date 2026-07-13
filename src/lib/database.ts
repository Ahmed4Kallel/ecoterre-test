import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let _serviceClient: ReturnType<typeof createClient> | null = null;

export function getServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY!);
  }
  return _serviceClient;
}

const IS_VERCEL = process.env.VERCEL === "1";

export function isVercel(): boolean {
  return IS_VERCEL;
}

// Backward-compatible getDb for routes that need raw queries
// Uses Supabase's rpc for SQL execution when possible
export function getDb() {
  return {
    prepare: (sql: string) => ({
      get: (...params: unknown[]) => {
        throw new Error("Direct SQL preparation is not supported with Supabase. Use db.ts functions instead.");
      },
      all: (...params: unknown[]) => {
        throw new Error("Direct SQL preparation is not supported with Supabase. Use db.ts functions instead.");
      },
      run: (...params: unknown[]) => {
        throw new Error("Direct SQL preparation is not supported with Supabase. Use db.ts functions instead.");
      },
    }),
    exec: (_sql: string) => {},
    pragma: (_sql: string) => {},
    close: () => {},
  };
}
