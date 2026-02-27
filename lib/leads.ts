import { supabase } from './supabase'
import { Lead, LeadStatus, MOCK_LEADS } from './data'

export async function getLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching leads:', error)
      return MOCK_LEADS
    }

    if (!data || data.length === 0) {
      // Return mock data as fallback if DB is empty
      return MOCK_LEADS
    }

    return data as Lead[]
  } catch (err) {
    console.error('Error fetching leads:', err)
    return MOCK_LEADS
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error fetching lead:', error)
      return MOCK_LEADS.find(l => l.id === id) || null
    }

    return data as Lead
  } catch (err) {
    console.error('Error fetching lead:', err)
    return MOCK_LEADS.find(l => l.id === id) || null
  }
}

export async function createLead(leadData: Omit<Lead, 'id' | 'created_at'>): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating lead:', error)
      return null
    }

    return data as Lead
  } catch (err) {
    console.error('Error creating lead:', err)
    return null
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Supabase error updating lead status:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error updating lead status:', err)
    return false
  }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Supabase error updating lead:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error updating lead:', err)
    return false
  }
}

export async function deleteLead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error deleting lead:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error deleting lead:', err)
    return false
  }
}
