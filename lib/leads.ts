import { supabase } from './supabase'
import { Lead, LeadStatus, Document, MOCK_LEADS, MOCK_DOCUMENTS } from './data'

export async function getLeads(): Promise<Lead[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('agent_id', user?.id ?? 'agent1')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching leads:', error)
      return MOCK_LEADS
    }

    if (!data || data.length === 0) {
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

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating lead:', error)
      return null
    }

    return data as Lead
  } catch (err) {
    console.error('Error updating lead:', err)
    return null
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

export async function getDocuments(leadId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('lead_id', leadId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching documents:', error)
      return MOCK_DOCUMENTS.filter(d => d.lead_id === leadId)
    }

    if (!data || data.length === 0) {
      return MOCK_DOCUMENTS.filter(d => d.lead_id === leadId)
    }

    return data as Document[]
  } catch (err) {
    console.error('Error fetching documents:', err)
    return MOCK_DOCUMENTS.filter(d => d.lead_id === leadId)
  }
}

export async function addDocument(doc: Omit<Document, 'id' | 'uploaded_at'>): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([{ ...doc, uploaded_at: new Date().toISOString() }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error adding document:', error)
      return null
    }

    return data as Document
  } catch (err) {
    console.error('Error adding document:', err)
    return null
  }
}

export async function getLeadsByEmail(email: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as Lead[]) || [];
  } catch { return []; }
}

export async function getLeadsByPhone(phone: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as Lead[]) || [];
  } catch { return []; }
}
