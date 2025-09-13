export interface Advice {
  id: string;
  text: string;
  category?: string; // facultatif
}

const BASE_URL = "https://tonserveur.com/api";

export async function getAdvices(): Promise<Advice[]> {
  try {
    const response = await fetch(`${BASE_URL}/advices`);
    if (!response.ok) throw new Error(`Erreur API conseils: ${response.status}`);
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      text: item.text,
      category: item.category,
    }));
  } catch (error) {
    console.error("Erreur récupération conseils:", error);
    return [];
  }
}
