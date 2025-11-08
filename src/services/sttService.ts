import apiClient from './apiClient';

interface TranscribeResponse {
  success: boolean;
  text: string;
  message?: string;
}

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Let the Blob's real mime type be used for the request.
    // Using the actual blob.type avoids sending mismatched content-type
    // (e.g. marking webm as wav) which causes Azure to return empty results.
  const contentType = (audioBlob && audioBlob.type) || 'application/octet-stream';

  // Helpful debug output when testing in browser console
  console.debug('[sttService] transcribeAudio - contentType:', contentType, 'size:', audioBlob.size);

  const { data } = await apiClient.post<TranscribeResponse>(
      '/transcribe',
      audioBlob,
      {
        headers: {
          'Content-Type': contentType,
        },
      }
    );

    if (data.success) {
      const cleaned = data.text?.trim() ?? '';
      return cleaned;
    }

    const message = data.message?.toLowerCase() || '';
    if (message.includes('no speech') || message.includes('empty')) {
      return '';
    }

    throw new Error(data.message || 'Transcription failed.');
  } catch (error) {
    console.error("Error in transcription service:", error);
    throw new Error("Failed to transcribe audio.");
  }
};