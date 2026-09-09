import { supabase } from '../lib/supabase';

export const flashcardService = {
  // Get all flashcards
  async getFlashcards(userId) {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Add flashcard
  async addFlashcard(cardData) {
    const { data, error } = await supabase
      .from('flashcards')
      .insert([cardData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Update flashcard review
  async updateReview(id, updates) {
    const { data, error } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Delete flashcard
  async deleteFlashcard(id) {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};