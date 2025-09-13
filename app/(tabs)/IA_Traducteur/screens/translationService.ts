// app/(tabs)/IA_Traducteur/screens/translationService.ts
function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

import fonDictionary from './fonDictionary.json';

export async function translateText(text: string, source: string, target: string): Promise<string> {
  if (target === 'fon') {
    const key = normalize(text);
    return fonDictionary[key] || '[Traduction non trouvée]';
  }
  try {
    const response = await fetch('https://translate.argosopentech.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: 'text',
      }),
    });
    const data = await response.json();
    if (data.translatedText) {
      return data.translatedText;
    } else if (data.error) {
      return `[Erreur de traduction] ${data.error}`;
    } else {
      return '[Erreur de traduction inconnue]';
    }
  } catch (error) {
    return '[Erreur de traduction]';
  }
}
