import { supabase } from '../lib/supabase';

export const userService = {
  // Get user stats
  async getStats(userId) {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user stats
  async updateStats(userId, updates) {
    const { data, error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get achievements
  async getAchievements(userId) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
};