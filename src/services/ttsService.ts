import apiClient from './apiClient';

/**
 * Sends text to the backend to be converted into speech.
 * @param text The text for Nyra to speak.
 * @returns An audio blob that can be played by the browser.
 */
export const getSpeechAudio = async (text: string): Promise<Blob> => {
  try {
    const response = await apiClient.post(
      '/speak',
      { text },
      { responseType: 'blob' } // This is critical - it tells axios to expect a file
    );
    return response.data;
  } catch (error) {
    console.error("Error in speech synthesis service:", error);
    throw new Error("Failed to generate speech.");
  }
};