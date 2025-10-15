// imageUtils.js
import { supabase } from '/utils/supabaseClient'; // or your supabase config file

export const fetchImageUrls = async (postId) => {
  try {
    const { data, error } = await supabase
      .storage
      .from('your-bucket-name')
      .list(`posts/${postId}`); // adjust the path as needed

    if (error) throw error;
    
    return data.map(file => {
      const { publicURL } = supabase
        .storage
        .from('your-bucket-name')
        .getPublicUrl(`posts/${postId}/${file.name}`);
      return publicURL;
    });
  } catch (error) {
    console.error('Error fetching image URLs:', error);
    return [];
  }
};