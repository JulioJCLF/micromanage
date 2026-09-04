import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// We keep the same object structure so we don't have to rewrite all the UI components.
export const supabaseMock = {
  projects: {
    async list(tenantId) {
      if (!tenantId) return { data: [], error: null };
      const { data, error } = await supabase.from('projects').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
      return { data, error };
    },
    async get(id) {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      return { data, error };
    },
    async create(projectData) {
      const { data, error } = await supabase.from('projects').insert([projectData]).select().single();
      return { data, error };
    },
    async update(id, updates) {
      const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
      return { data, error };
    },
    async delete(id) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      return { error };
    }
  },

  columns: {
    async list(projectId) {
      const { data, error } = await supabase.from('columns').select('*').eq('project_id', projectId).order('order', { ascending: true });
      return { data, error };
    },
    async create(columnData) {
      const { data, error } = await supabase.from('columns').insert([columnData]).select().single();
      return { data, error };
    }
  },
  
  cards: {
    async list(projectId) {
      const { data, error } = await supabase.from('cards').select('*').eq('project_id', projectId).order('order', { ascending: true });
      return { data, error };
    },
    async listAll(tenantId) {
      if (!tenantId) return { data: [], error: null };
      const { data: projects } = await supabase.from('projects').select('id').eq('tenant_id', tenantId);
      if (!projects || projects.length === 0) return { data: [], error: null };
      
      const projectIds = projects.map(p => p.id);
      const { data, error } = await supabase.from('cards').select('*').in('project_id', projectIds).order('created_at', { ascending: false });
      return { data, error };
    },
    async create(cardData) {
      const { data, error } = await supabase.from('cards').insert([cardData]).select().single();
      return { data, error };
    },
    async update(id, updates) {
      const { data, error } = await supabase.from('cards').update(updates).eq('id', id).select().single();
      return { data, error };
    }
  },

  notes: {
    async list(projectId) {
      const { data, error } = await supabase.from('notes').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return { data, error };
    },
    async create(noteData) {
      const { data, error } = await supabase.from('notes').insert([noteData]).select().single();
      return { data, error };
    },
    async update(id, updates) {
      const { data, error } = await supabase.from('notes').update(updates).eq('id', id).select().single();
      return { data, error };
    }
  },

  links: {
    async list(projectId) {
      const { data, error } = await supabase.from('links').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return { data, error };
    },
    async create(linkData) {
      const { data, error } = await supabase.from('links').insert([linkData]).select().single();
      return { data, error };
    },
    async delete(id) {
      const { error } = await supabase.from('links').delete().eq('id', id);
      return { error };
    }
  },

  catalog: {
    async list(tenantId) {
      if (!tenantId) return { data: [], error: null };
      const { data, error } = await supabase.from('catalog').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
      return { data, error };
    },
    async create(partData) {
      const { data, error } = await supabase.from('catalog').insert([partData]).select().single();
      return { data, error };
    },
    async update(id, updates) {
      const { data, error } = await supabase.from('catalog').update(updates).eq('id', id).select().single();
      return { data, error };
    },
    async delete(id) {
      const { error } = await supabase.from('catalog').delete().eq('id', id);
      return { error };
    }
  }
};
