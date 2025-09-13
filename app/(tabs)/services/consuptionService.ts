import axios from "axios";

export interface Consumption {
  date: string;
  value: number;
}

// Exemple fonction pour récupérer consommation électricité
export async function getElectricityConsumption(userId: string): Promise<Consumption[]> {
  try {
    const response = await axios.get(`https://api.sbee.bj/consumption/${userId}`);
    return response.data; // attendu : [{ date: "2025-09-01", value: 10 }, ...]
  } catch (error) {
    console.error("Erreur récupération électricité :", error);
    return [];
  }
}

// Exemple fonction pour récupérer consommation eau
export async function getWaterConsumption(userId: string): Promise<Consumption[]> {
  try {
    const response = await axios.get(`https://api.soneb.bj/consumption/${userId}`);
    return response.data; // attendu : [{ date: "2025-09-01", value: 7 }, ...]
  } catch (error) {
    console.error("Erreur récupération eau :", error);
    return [];
  }
}
