import { supabase } from "/utils/supabaseClient";

export class MarketDataService {
  // Get all market data
  async getMarketData() {
    const { data, error } = await supabase
      .from("market_data")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Insert new market data with images
  async insertMarketData({ category, value, images = [] }) {
    if (!category || value === undefined || value === null) {
      throw new Error("Category and value are required");
    }

    const { data, error } = await supabase
      .from("market_data")
      .insert([{ category, value, images }])
      .select();

    if (error) throw error;
    return data?.[0];
  }

  // Update existing market data
  async updateMarketData(id, { category, value, images }) {
    if (!id) throw new Error("ID is required for update");
    
    const updates = {};
    if (category !== undefined) updates.category = category;
    if (value !== undefined) updates.value = value;
    if (images !== undefined) updates.images = images;

    const { data, error } = await supabase
      .from("market_data")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  // Delete market data
  async deleteMarketData(id) {
    if (!id) throw new Error("ID is required for delete");
    
    const { error } = await supabase
      .from("market_data")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return true;
  }

  // Upload images to storage
  async uploadImages(files) {
    const uploadedUrls = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `market/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);
        
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  }
}
