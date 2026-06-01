import React, { useState, useRef } from 'react';

const PATIENTS = [
  { id: "PAT-RAMAIAH", name: "Mr. Ramaiah (68M, cardiac stent, dual antiplatelet)" },
  { id: "PAT-AADHYA",  name: "Aadhya (3F, penicillin allergy, recurrent ear infections)" },
];

const DOCTORS = [
  { id: "U-SHARMA", name: "Dr. Sharma (HOD, Gen Practice)" },
  { id: "U-VIKRAM", name: "Dr. Vikram (HOD, Orthopaedics)" },
  { id: "U-PRIYA",  name: "Nurse Priya (Viewer, Ortho)" },
];

export default function TranscriptReview({ setCandidates, patientId, setPatientId, doctorId, setDoctorId }) {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(""); // accumulates final text across restarts

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API not supported. Please use Chrome and paste transcript manually.");
      return;
    }

    finalTranscriptRef.current = transcript; // preserve existing text
    setRecording(true);
    setInterimText("");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + " ";
          setTranscript(finalTranscriptRef.current.trim());
          setInterimText("");
        } else {
          interim += result[0].transcript;
          setInterimText(interim);
        }
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      if (e.error === 'no-speech') return; // ignore no-speech, keep listening
      if (e.error === 'network') {
        setInterimText("⚠️ Network error — check internet connection.");
        return;
      }
      setRecording(false);
      setInterimText(`⚠️ Error: ${e.error}`);
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be recording
      if (recognitionRef.current?._active) {
        try { recognition.start(); } catch (_) {}
      } else {
        setRecording(false);
        setInterimText("");
      }
    };

    recognition.start();
    recognition._active = true;
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current._active = false;
      recognitionRef.current.stop();
    }
    setRecording(false);
    setInterimText("");
  };

  const handleExtract = async () => {
    if (!transcript.trim()) {
      alert("Please record or paste a transcript first.");
      return;
    }
    if (!patientId) {
      alert("Please select a patient first.");
      return;
    }

    setLoading(true);
    setCandidates([]);

    try {
      const response = await fetch('http://localhost:8000/api/pipeline/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, reviewed_text: transcript }),
      });
      const data = await response.json();
      console.log("Extraction result:", data);
      setCandidates(data);
    } catch (error) {
      console.error("Pipeline failure:", error);
      alert("Extraction failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = PATIENTS.find(p => p.id === patientId);
  const selectedDoctor = DOCTORS.find(d => d.id === doctorId);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-5">

      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-slate-200">
          Stage 1 & 2: Voice Input + Transcript Review
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          Human-In-The-Loop #1 — Review transcript for accuracy before extraction.
          Medical terms may be transcribed incorrectly.
        </p>
      </div>

      {/* Patient + Doctor Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Patient</label>
          <select
            value={patientId}
            onChange={e => { setPatientId(e.target.value); setCandidates([]); }}
            className="w-full bg-slate-900 text-slate-100 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">— Select patient —</option>
            {PATIENTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedPatient && (
            <p className="text-teal-500 text-xs mt-1">ID: {patientId}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Doctor / Staff</label>
          <select
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">— Select doctor —</option>
            {DOCTORS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {selectedDoctor && (
            <p className="text-teal-500 text-xs mt-1">ID: {doctorId}</p>
          )}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {!recording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            🎤 Record Voice Note
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 bg-red-900 border-2 border-red-400 text-red-200 font-medium px-4 py-2 rounded-lg text-sm cursor-pointer animate-pulse"
          >
            ⏹ Stop Recording
          </button>
        )}

        <button
          onClick={() => { setTranscript(""); setInterimText(""); finalTranscriptRef.current = ""; }}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-3 py-2 rounded-lg transition cursor-pointer"
        >
          🗑 Clear
        </button>

        <span className="text-slate-500 text-xs">or paste transcript below</span>
      </div>

      {/* Live interim display */}
      {(recording || interimText) && (
        <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs font-mono">
          <span className="text-red-400 font-bold">● LIVE  </span>
          <span className="text-slate-300">
            {interimText || "Listening... speak now"}
          </span>
        </div>
      )}

      {/* Transcript Textarea */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">
          TRANSCRIPT — review and correct before extraction:
        </label>
        <textarea
          className="w-full h-32 bg-slate-950 text-slate-100 border border-slate-700 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
          placeholder="Record voice above, or paste transcript here..."
          value={transcript}
          onChange={e => {
            setTranscript(e.target.value);
            finalTranscriptRef.current = e.target.value;
          }}
        />
        <p className="text-slate-500 text-xs mt-1">
          ⚠️ Review for accuracy — wrong medical terms create wrong knowledge nodes.
        </p>
      </div>

      {/* Quick Test Transcripts */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Quick test transcripts:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setTranscript("Ramaiah gari ki molli noppi undi, Ibuprofen adugutunnaru, stent valla ivvaledu, Paracetamol continue cheyandi, Tramadol try cheddham, dizziness monitor cheyali."); setPatientId("PAT-RAMAIAH"); }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded transition cursor-pointer"
          >
            📋 Ramaiah Telugu-English
          </button>
          <button
            onClick={() => { setTranscript("Ramaiah visited today. Complained of increased knee swelling. Blood pressure 145/90. Adding physiotherapy twice a week. Tramadol causing mild nausea, dose reduced to 25mg."); setPatientId("PAT-RAMAIAH"); }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded transition cursor-pointer"
          >
            📋 Ramaiah English
          </button>
          <button
            onClick={() => { setTranscript("Aadhya ear infection again. Mother requesting amoxicillin. Refused — penicillin allergy documented. Prescribed azithromycin 10mg/kg for 3 days."); setPatientId("PAT-AADHYA"); }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded transition cursor-pointer"
          >
            📋 Aadhya (surprise test)
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
        <span className="text-amber-400 text-xs">
          ⚠️ Action transforms reviewed transcript into formal graph objects.
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => { setTranscript(""); setCandidates([]); finalTranscriptRef.current = ""; }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            ❌ Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={loading || !transcript.trim() || !patientId}
            className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Extracting..." : "✅ Confirm & Extract Knowledge"}
          </button>
        </div>
      </div>
    </div>
  );
}