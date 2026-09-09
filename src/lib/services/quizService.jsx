import { supabase } from '../lib/supabase';

export const quizService = {
  // Get all quizzes
  async getQuizzes(userId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Save quiz result
  async saveQuiz(quizData) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select();
    
    if (error) throw error;
    return data[0];
  }
};