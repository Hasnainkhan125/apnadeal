import { supabase } from '../lib/supabase';

export const summaryService = {
  // Get all summaries
  async getSummaries(userId) {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Save summary
  async saveSummary(summaryData) {
    const { data, error } = await supabase
      .from('summaries')
      .insert([summaryData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete summary
  async deleteSummary(id) {
    const { error } = await supabase
      .from('summaries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};