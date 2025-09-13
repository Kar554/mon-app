export interface Hint {
  id: string;
  title: string;
  value: string;
}

const BASE_URL = "https://tonserveur.com/api";

export async function getHints(): Promise<Hint[]> {
  try {
    const response = await fetch(`${BASE_URL}/hints`);
    if (!response.ok) throw new Error(`Erreur API indices: ${response.status}`);
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      value: item.value,
    }));
  } catch (error) {
    console.error("Erreur récupération indices:", error);
    return [];
  }
}
