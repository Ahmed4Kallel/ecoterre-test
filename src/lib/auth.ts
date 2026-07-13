import "server-only";
import { cookies } from "next/headers";
import { hashSync, compareSync } from "bcryptjs";
import { createHash } from "crypto";
import { findBy, findAll } from "./db";
import type { User } from "./types";

const BCRYPT_ROUNDS = 10;
const isProduction = process.env.NODE_ENV === "production";
const SESSION_COOKIE = isProduction ? "__Host-ecoterre_session" : "ecoterre_session";

export function hashPassword(password: string): string {
  return hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

function sessionHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [userId, storedHash] = token.split(".");
  const user = await findBy<User>("users", "id", userId);
  if (!user) return null;
  const expected = sessionHash(user.id + user.password);
  if (storedHash !== expected) return null;
  return user;
}

export async function setSession(user: User, rememberMe = false): Promise<void> {
  const cookieStore = await cookies();
  const hash = sessionHash(user.id + user.password);
  cookieStore.set(SESSION_COOKIE, `${user.id}.${hash}`, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function requireAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function requireAuthor(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "author" || user?.role === "editor";
}

export async function getAllUsers(): Promise<User[]> {
  return findAll<User>("users");
}

export async function getCurrentUser(): Promise<User | null> {
  return getSession();
}
