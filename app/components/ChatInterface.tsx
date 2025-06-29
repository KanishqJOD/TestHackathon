'use client';

import { useState, useRef, useEffect } from 'react';
import { InputType } from '@/lib/types';

// Add these type definitions at the top of the file
interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

type SpeechRecognitionEvent = {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = {
  error: string;
  message: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<{
    type: string;
    content: string;
    timestamp?: string;
    transcription?: string;
  }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
          setTranscription(transcript);
          console.log('Live transcription:', transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
        };
      }
    }
  }, []);

  // Function to start voice recording
  const startRecording = async () => {
    try {
      console.log('Starting voice recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunksRef.current = [];
      setTranscription('');

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        console.log('Speech recognition started');
      }

      // Log audio settings
      console.log('Audio Recording Settings:', {
        mimeType: recorder.mimeType,
        audioBitsPerSecond: recorder.audioBitsPerSecond,
        state: recorder.state
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          console.log('Recorded audio chunk:', {
            size: e.data.size + ' bytes',
            type: e.data.type,
            timestamp: getFormattedTimestamp(),
            currentTranscription: transcription
          });
        }
      };

      recorder.onstop = async () => {
        // Stop speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped');
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('Recording stopped. Final audio:', {
          totalSize: audioBlob.size + ' bytes',
          duration: recordingDuration + ' seconds',
          timestamp: getFormattedTimestamp(),
          finalTranscription: transcription
        });

        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          console.log('Audio processed:', {
            base64Length: base64Data.length,
            timestamp: getFormattedTimestamp()
          });
          await sendMessage(
            'audio',
            `Voice message: "${transcription}"`,
            base64Data,
            transcription
          );
        };
        reader.readAsDataURL(audioBlob);

        // Clear the audio data
        audioChunksRef.current = [];
      };

      // Start recording and duration timer
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone. Please check your permissions.');
    }
  };

  // Function to stop voice recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      console.log('Stopping recording...');
      mediaRecorder.stop();
      audioStream?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setAudioStream(null);
      setMediaRecorder(null);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Function to speak text response
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      console.log('Speaking response:', { text, timestamp: getFormattedTimestamp() });
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (type: InputType, content: string, base64Data?: string, transcription?: string) => {
    try {
      setIsLoading(true);
      const timestamp = getFormattedTimestamp();
      console.log('Sending message:', { 
        type, 
        content, 
        hasBase64: !!base64Data,
        timestamp,
        base64Length: base64Data?.length,
        transcription
      });

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: content, base64Data })
      });

      const data = await response.json();
      console.log('Received response:', {
        ...data,
        timestamp: getFormattedTimestamp()
      });
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add messages to chat with timestamps and transcription
      setMessages(prev => [...prev, 
        { type, content, timestamp, transcription },
        { type: 'response', content: data.response, timestamp: getFormattedTimestamp() }
      ]);

      // Speak the response if it's a voice message
      if (type === 'audio') {
        speakResponse(data.response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setInputText('');
      setTranscription('');
    }
  };

  // Function to format timestamp
  const getFormattedTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage('text', inputText);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLoading) return;

    const type: InputType = file.type.startsWith('image/') ? 'image' : 'audio';
    console.log('Processing file:', { type, fileName: file.name, fileSize: file.size });
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        await sendMessage(
          type,
          `Process this ${type}: ${file.name}`,
          base64Data
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.type === 'response'
                ? 'bg-blue-100 dark:bg-blue-900 ml-4 text-black dark:text-white'
                : 'bg-gray-100 dark:bg-gray-700 mr-4 text-black dark:text-white'
            }`}
          >
            <p>{msg.content}</p>
            {msg.transcription && (
              <p className="text-sm italic text-gray-600 dark:text-gray-300 mt-1">
                Transcription: {msg.transcription}
              </p>
            )}
            {msg.timestamp && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {msg.timestamp}
              </p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {isRecording && transcription && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Live transcription: {transcription}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                     bg-white dark:bg-gray-700 
                     text-black dark:text-white 
                     placeholder-gray-400 dark:placeholder-gray-300"
            disabled={isLoading || isRecording}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                      disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading || isRecording}
          >
            Send
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 
                      disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading || isRecording}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            disabled={isLoading}
          >
            {isRecording ? (
              <>
                Stop Recording ({recordingDuration}s)
              </>
            ) : (
              'Record Voice'
            )}
          </button>
        </form>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
} 