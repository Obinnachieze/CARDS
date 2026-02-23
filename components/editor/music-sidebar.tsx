"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor } from "./editor-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Upload, Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

export const MusicIcon = Music;

export function MusicSidebar() {
    const { cards, activeCardId, setAudio, addElement } = useEditor();
    const activeCard = cards.find((c) => c.id === activeCardId);
    const currentAudio = activeCard?.audioSrc;

    const { data: session } = useSession();

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    const [lastAdded, setLastAdded] = useState<string | null>(null);

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
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordedBlob(null);
            setRecordedUrl(null);

            setRecordingTime(0);
            const interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please ensure permissions are granted.");
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
        const reader = new FileReader();
        reader.readAsDataURL(recordedBlob);
        reader.onloadend = () => {
            const base64data = reader.result as string;
            setAudio(activeCardId, base64data);
        };
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col p-4 gap-6">
                {/* 1. Active Music Section (PRIORITY) */}
                <div className="space-y-4">
                    {currentAudio ? (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 overflow-hidden text-purple-700 font-bold text-xs uppercase tracking-tight">
                                    <div className="p-1 px-2 bg-purple-500 text-white rounded text-[9px] animate-pulse">LIVE</div>
                                    <Music className="w-4 h-4 shrink-0" />
                                    <span className="truncate">Active Card Music</span>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-purple-400 hover:text-red-500 hover:bg-red-50"
                                    onClick={handleRemoveAudio}
                                    title="Remove Music"
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                            <audio
                                controls
                                className="w-full h-8"
                                src={currentAudio}
                                key={currentAudio}
                            />
                            <p className="text-[9px] text-purple-400 mt-2 italic font-medium">This song will play automatically when the card is opened.</p>
                        </div>
                    ) : (
                        <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-center gap-2 bg-gray-50/30">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <Music className="w-5 h-5 text-gray-300" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium italic leading-relaxed">No music attached yet.<br />Upload or record audio below.</p>
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-100" />


                {/* 3. Original Audio Section */}
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Original Audio</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Upload or Record voice</p>
                    </div>

                    {!isRecording && !recordedUrl && (
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-2xl cursor-pointer transition-all group">
                                <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload className="w-4 h-4 text-purple-500" />
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">Upload</span>
                                <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                            </label>
                            <button
                                onClick={startRecording}
                                className="flex flex-col items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 border border-dashed border-red-200 rounded-2xl transition-all group"
                            >
                                <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                    <Mic className="w-4 h-4 text-red-500" />
                                </div>
                                <span className="text-[11px] font-bold text-red-600">Record</span>
                            </button>
                        </div>
                    )}

                    {isRecording && (
                        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col items-center gap-4">
                            <div className="text-3xl font-mono font-bold text-red-500 tabular-nums">
                                {formatTime(recordingTime)}
                            </div>
                            <Button
                                onClick={stopRecording}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 font-bold shadow-lg shadow-red-200"
                            >
                                Stop Recording
                            </Button>
                        </div>
                    )}

                    {!isRecording && recordedUrl && (
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                            <audio controls src={recordedUrl} className="h-8 w-full" />
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setRecordedUrl(null); setRecordedBlob(null); }}
                                    className="flex-1 text-gray-500 hover:bg-gray-100 rounded-xl text-xs"
                                >
                                    Discard
                                </Button>
                                <Button
                                    onClick={saveRecording}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                                >
                                    Use Recording
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
    );
}
