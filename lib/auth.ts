'use client';

import { supabase } from './supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export type UserRole = 'developer' | 'admin' | 'agent' | 'customer' | null

export async function getUserRole(): Promise<UserRole> {
  const { data: { session } } = await supabase.auth.getSession()
  const role = session?.user?.app_metadata?.role as UserRole
  return role ?? null
}

export async function isAtLeast(minRole: 'customer' | 'agent' | 'admin' | 'developer'): Promise<boolean> {
  const hierarchy: UserRole[] = ['customer', 'agent', 'admin', 'developer']
  const role = await getUserRole()
  if (!role) return false
  return hierarchy.indexOf(role) >= hierarchy.indexOf(minRole)
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : '/',
    },
  })
  return { data, error }
}
