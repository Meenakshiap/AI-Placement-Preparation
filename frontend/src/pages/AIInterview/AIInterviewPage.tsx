import React, { useState } from 'react';
import { Video, Mic, Sparkles, Award, Play, CheckCircle2, MessageSquare, Volume2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AIInterviewPage: React.FC = () => {
  const { user } = useAuth();
  const [sessionActive, setSessionActive] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Video className="w-4 h-4 text-amber-600" />
            <span>AI Face-to-Face Simulation Room</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">AI Mock Interview Studio</h1>
          <p className="text-sm text-ink-500 mt-1">
            Real-time interactive voice & video interview simulations with AI feedback on technical accuracy, clarity, and communication.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 panel p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center min-h-[420px] space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-amber-500 flex items-center justify-center shadow-soft">
            <Video className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-ink-900">
              Simulate {user?.targetCompany || 'Google'} {user?.targetRole || 'Technical Interview'}
            </h2>
            <p className="text-xs text-ink-500 leading-relaxed">
              The AI interviewer will ask follow-up questions tailored to your skill profile, listen to your responses via microphone or text, and score your technical depth and confidence.
            </p>
          </div>

          <button
            onClick={() => alert('Starting AI Face-to-Face Interview session... (Full interactive studio module unlocks in upcoming phase!)')}
            className="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition transform hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Mock Studio</span>
          </button>
        </div>

        <div className="panel p-6 rounded-3xl space-y-5">
          <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Evaluation Rubric</h3>
          <div className="space-y-3 text-xs">
            <div className="panel-muted p-3 rounded-xl space-y-1">
              <span className="font-semibold text-ink-800">1. Technical Accuracy (40%)</span>
              <p className="text-[11px] text-ink-500">Correctness of algorithms, data structures, and edge case coverage.</p>
            </div>
            <div className="panel-muted p-3 rounded-xl space-y-1">
              <span className="font-semibold text-ink-800">2. Communication & Clarity (30%)</span>
              <p className="text-[11px] text-ink-500">Structured problem breakdown and thinking aloud process.</p>
            </div>
            <div className="panel-muted p-3 rounded-xl space-y-1">
              <span className="font-semibold text-ink-800">3. Behavioral & STAR Method (30%)</span>
              <p className="text-[11px] text-ink-500">Amazon LP / Google Googliness culture and conflict resolution metrics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
