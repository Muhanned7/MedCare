import React, { useState } from 'react';
import TranscriptReview from './components/TranscriptReview';
import CandidateList from './components/CandidateList';
import './index.css'

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [patientId, setPatientId] = useState("PAT-RAMAIAH");
  const [doctorId, setDoctorId] = useState("U-SHARMA");

  const selectedPatientName = {
    "PAT-RAMAIAH": "Mr. Ramaiah (68M, cardiac stent)",
    "PAT-AADHYA": "Aadhya (3F, penicillin allergy)",
  }[patientId] || "No patient selected";

  const handleDone = () => {
    setCandidates([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="max-w-5xl mx-auto mb-8 border-b border-slate-800 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-teal-400 tracking-tight">BRAHMO</h1>
            <p className="text-slate-400 text-sm">Voice → Knowledge Extraction → Conflict Detection</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Patient: <span className="text-slate-300">{selectedPatientName}</span></p>
            <p>Session: <span className="text-slate-300">{new Date().toLocaleString('en-IN')}</span></p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        <TranscriptReview
          patientId={patientId}
          setPatientId={setPatientId}
          doctorId={doctorId}
          setDoctorId={setDoctorId}
          setCandidates={setCandidates}
        />

        {candidates && candidates.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">Extracted Knowledge Candidates</h2>
            <CandidateList candidates={candidates} patientId={patientId} onDone={handleDone} />
          </div>
        )}
      </main>
    </div>
  );
}