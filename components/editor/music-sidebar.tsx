"use client";

import { useState } from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Upload, Play, Pause, X, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

const presetAudios = [
    { title: "Happy Birthday", src: "/music/happy-birthday.mp3", category: "Celebration" }, // Placeholder paths
    { title: "Romantic Piano", src: "/music/romantic.mp3", category: "Love" },
    { title: "Upbeat Pop", src: "/music/upbeat.mp3", category: "Fun" },
    { title: "Holiday Bells", src: "/music/bells.mp3", category: "Holidays" },
];

export const MusicIcon = Music;

// Note: In a real app, these would need to be actual files in public/music or hosted URLs.
// For now, we'll allow users to input a URL or simulate selection.
export function MusicSidebar() {
    const { cards, activeCardId, setAudio } = useEditor();
    const activeCard = cards.find((c) => c.id === activeCardId);
    const currentAudio = activeCard?.audioSrc;

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    const handleRemoveAudio = () => {
        if (activeCardId) {
            setAudio(activeCardId, undefined);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeCardId) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                setAudio(activeCardId, base64data);
            };
            reader.readAsDataURL(file);
        }
    };

    // Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setRecordedChunks([]);
                setRecordedBlob(blob);
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordedBlob(null);
            setRecordedUrl(null);

            // Timer
            setRecordingTime(0);
            const interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please ensure specific permissions are granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerInterval) clearInterval(timerInterval);
        }
    };

    const saveRecording = () => {
        if (!recordedBlob || !activeCardId) return;

        // Convert Blob to Base64 for storage/persistence
        const reader = new FileReader();
        reader.readAsDataURL(recordedBlob);
        reader.onloadend = () => {
            const base64data = reader.result as string;
            setAudio(activeCardId, base64data);
            // Clear recording state after saving? Or keep it? Let's keep it for now.
        };
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col p-3">
            {currentAudio && (
                <div className="mb-3 p-2 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Music className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="text-sm truncate text-purple-700">Audio Track</span>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={handleRemoveAudio}
                            title="Remove Audio"
                        >
                            <X size={14} />
                        </Button>
                    </div>
                    <audio controls className="w-full mt-2 h-8" src={currentAudio} />
                </div>
            )}

            {/* Upload & Record Row */}
            {!isRecording && !recordedUrl && (
                <div className="grid grid-cols-2 gap-2">
                    <label htmlFor="audio-upload" className="flex flex-col items-center justify-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-purple-500" />
                        <span className="text-xs font-semibold text-gray-700">Upload</span>
                        <span className="text-[10px] text-gray-400">MP3, WAV</span>
                        <input
                            id="audio-upload"
                            type="file"
                            className="hidden"
                            accept="audio/*,video/mp4"
                            onChange={handleFileUpload}
                        />
                    </label>
                    <button
                        onClick={startRecording}
                        className="flex flex-col items-center justify-center gap-1 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                    >
                        <Mic className="w-5 h-5 text-red-500" />
                        <span className="text-xs font-semibold text-gray-700">Record</span>
                        <span className="text-[10px] text-gray-400">Voice message</span>
                    </button>
                </div>
            )}

            {/* Recording in progress */}
            {isRecording && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col items-center gap-3">
                    <div className="text-2xl font-mono font-bold text-red-500">
                        {formatTime(recordingTime)}
                    </div>
                    <div className="flex items-center justify-center gap-1 h-6">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-red-400 rounded-full animate-pulse"
                                style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                    <Button
                        onClick={stopRecording}
                        variant="outline"
                        className="h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 w-full"
                    >
                        <div className="w-3 h-3 bg-red-600 rounded-sm" />
                        Stop
                    </Button>
                </div>
            )}

            {/* Recorded result */}
            {!isRecording && recordedUrl && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <audio controls src={recordedUrl!} className="h-8 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (recordedUrl) URL.revokeObjectURL(recordedUrl);
                                setRecordedUrl(null);
                                setRecordedBlob(null);
                            }}
                            className="text-xs h-8"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={saveRecording}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 font-semibold"
                        >
                            Attach to Card
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
