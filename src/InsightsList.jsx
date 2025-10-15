import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function InsightsList() {
  const [insights, setInsights] = useState([]);

  useEffect(() => { fetchInsights(); }, []);

  async function fetchInsights() {
    let { data, error } = await supabase
      .from("market_insights")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setInsights(data);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {insights.map((insight) => (
        <div key={insight.id} className="bg-white rounded-lg shadow p-4">
          {insight.image_url && <img src={insight.image_url} alt="" className="rounded mb-3 w-full h-40 object-cover"/>}
          <h3 className="text-lg font-bold">{insight.title}</h3>
          <p className="text-sm text-gray-500">{insight.category} • {new Date(insight.created_at).toLocaleDateString()}</p>
          <div className="mt-2 text-gray-700 prose" dangerouslySetInnerHTML={{ __html: insight.body }} />
        </div>
      ))}
    </div>
  );
}
