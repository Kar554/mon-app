export interface Consumption {
  date: string;
  value: number;
}

export async function getConsumption(userId: string, type: "electricite" | "eau"): Promise<Consumption[]> {
  // Exemple simulé, à remplacer par la vraie API
  // URL possible : `https://api.soneb.bj/consommation?user=${userId}&type=${type}`
  if (type === "electricite") {
    return [
      { date: "01/09", value: 10 },
      { date: "02/09", value: 12 },
      { date: "03/09", value: 14 },
      { date: "04/09", value: 16 },
      { date: "05/09", value: 18 },
    ];
  } else {
    return [
      { date: "01/09", value: 7 },
      { date: "02/09", value: 7.75 },
      { date: "03/09", value: 8.5 },
      { date: "04/09", value: 9.25 },
      { date: "05/09", value: 10 },
    ];
  }
}
