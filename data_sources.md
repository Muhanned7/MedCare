# Data Sources — BRAHMO Seed Knowledge Nodes

This document records the clinical basis and source rationale for
every seed knowledge node loaded into the BRAHMO knowledge graph.
All nodes are fictionalised for a simulated hospital (Supra Multi-Specialty)
but are grounded in real, publicly documented clinical guidelines.

---

## Node: N-G01 — Warfarin-NSAID Interaction

**Type:** CONSTRAINT  
**Importance:** 0.98

**Clinical basis:**  
NSAIDs inhibit platelet aggregation and damage the gastric mucosa,
significantly increasing the risk of gastrointestinal bleeding in
patients on anticoagulation therapy. This interaction is one of the
most well-documented drug-drug interactions in clinical pharmacology.

**Sources:**
- British National Formulary (BNF) — Warfarin interactions section.
  [bnf.nice.org.uk](https://bnf.nice.org.uk)
- NHS Medicines Information: "Interactions with anticoagulants"
- NICE Clinical Guideline CG180 — Atrial fibrillation: management
  (recommends avoiding NSAIDs in anticoagulated patients)
- Holbrook AM et al. (2005). "Systematic overview of warfarin and
  its drug and food interactions." *Archives of Internal Medicine.*

---

## Node: N-G02 — Penicillin Allergy Cross-Reactivity

**Type:** CONSTRAINT  
**Importance:** 0.95

**Clinical basis:**  
Documented penicillin allergy, particularly anaphylaxis, requires
avoidance of all penicillin-class antibiotics. Azithromycin is a
standard macrolide alternative for common infections with no
cross-reactivity to beta-lactams.

**Sources:**
- NICE guideline NG15 — Antimicrobial stewardship: systems and processes
- WHO Model Formulary 2008 — Antibiotic alternatives for penicillin-allergic patients
- Joint Task Force on Practice Parameters; American Academy of Allergy,
  Asthma and Immunology et al. (2010). "Drug allergy: an updated practice
  parameter." *Annals of Allergy, Asthma & Immunology.*

---

## Node: N-G03 — Verbal Orders Without Documentation

**Type:** ANTI_PATTERN  
**Importance:** 0.90

**Clinical basis:**  
Undocumented verbal medication orders are a leading cause of medication
errors in hospital settings. Major accreditation bodies mandate written
or electronic confirmation within a defined timeframe.

**Sources:**
- The Joint Commission (TJC) National Patient Safety Goal NPSG.02.03.01
  — Verbal orders must be documented within 1 hour
- WHO Patient Safety — "Communication during patient handovers"
- Institute for Safe Medication Practices (ISMP) — Verbal order guidance

---

## Node: N-O01 — Paracetamol First-Line Post-TKR

**Type:** DECISION  
**Importance:** 0.88

**Clinical basis:**  
Paracetamol (acetaminophen) is the recommended first-line analgesic
post total knee replacement (TKR) due to its safety profile, especially
in patients where NSAIDs are contraindicated. Tramadol is an accepted
escalation step for moderate-severe pain (VAS > 6).

**Sources:**
- NICE guideline NG157 — Perioperative care in adults (2020)
- PROSPECT Guidelines — Procedure-specific postoperative pain management
  for total knee arthroplasty. [esraeurope.org/prospect](https://esraeurope.org/prospect)
- Knee Society Clinical Practice Guidelines for TKA pain management (2016)

---

## Node: N-O02 — DVT Prophylaxis Protocol

**Type:** CONSTRAINT  
**Importance:** 0.93

**Clinical basis:**  
Venous thromboembolism (VTE) is a major risk following orthopaedic
surgery. Enoxaparin (low molecular weight heparin) started 12 hours
post-op is a standard prophylaxis protocol endorsed by major guidelines.

**Sources:**
- NICE guideline NG89 — Venous thromboembolism in over 16s (2019)
- American Academy of Orthopaedic Surgeons (AAOS) — VTE Prophylaxis
  in Total Joint Arthroplasty Clinical Practice Guideline (2022)
- British Orthopaedic Association (BOA) — Standards for Orthopaedic
  Trauma: VTE Prophylaxis

---

## Node: N-O03 — Never Discharge TKR Under 48 Hours

**Type:** ANTI_PATTERN  
**Importance:** 0.91

**Clinical basis:**  
Early discharge following TKR has been associated with higher readmission
rates and complications including DVT. Minimum 48-hour observation is
recommended for monitoring haemodynamic stability and initiating
physiotherapy.

**Sources:**
- NHS Getting It Right First Time (GIRFT) — Orthopaedic programme report
- NICE guideline NG157 — Perioperative care recommendations
- Fictionalised organisational anti-pattern based on real clinical
  incident reporting patterns documented in NHS Never Events literature

---

## Node: N-045 — Ramaiah: Absolute NSAID Contraindication

**Type:** CONSTRAINT  
**Importance:** 0.99

**Clinical basis:**  
Patient-specific node. Ramaiah has a drug-eluting cardiac stent (2022)
and is on dual antiplatelet therapy (Clopidogrel + Warfarin). NSAIDs
are absolutely contraindicated in this combination due to:
1. Risk of stent thrombosis (antiplatelet inhibition)
2. Severe GI bleed risk (NSAID + anticoagulant combination)
3. 8 prior documented refusals indicating established clinical pattern

**Sources:**
- ESC/EACTS Guidelines on Myocardial Revascularization (2018) —
  antiplatelet therapy and NSAID contraindication post-stenting
- BNF — Ibuprofen: contraindications in anticoagulated patients
- Fictionalised patient record for simulation purposes

---

## Node: N-046 — Ramaiah: Medication Profile

**Type:** FACT  
**Importance:** 0.85

**Clinical basis:**  
Standard medication reconciliation record. All medications listed
(Warfarin, Clopidogrel, Paracetamol, Atorvastatin) are real drugs
with documented indications for a cardiac stent + AF patient profile.

**Sources:**
- BNF — Drug monographs for all listed medications
- Fictionalised patient record for simulation purposes

---

## Node: N-047 — Ramaiah: Pain Management Strategy

**Type:** DECISION  
**Importance:** 0.82

**Clinical basis:**  
Topical Diclofenac gel has significantly lower systemic absorption than
oral NSAIDs and is considered acceptable in some anticoagulated patients
at the discretion of the treating physician. Intra-articular injection
is a standard escalation for refractory osteoarthritis pain.

**Sources:**
- NICE — Osteoarthritis: care and management (CG177, 2014)
- Altman RD et al. (2009). "Diclofenac sodium gel in patients with
  primary hand osteoarthritis." *Journal of Rheumatology.*
- Fictionalised patient decision record

---

## Node: N-089 — Ramaiah: Behavioural Note — NSAID Requests

**Type:** FACT  
**Importance:** 0.72

**Clinical basis:**  
Repeated patient requests for contraindicated medications despite
documented refusals is a recognised clinical challenge, particularly
in chronic pain patients. Family involvement in medication requests
is a documented pattern in elderly patient care.

**Sources:**
- NHS Patient Safety — Medication request patterns in chronic disease
- Fictionalised behavioural observation based on common clinical
  presentation patterns in osteoarthritis management literature

---

## Node: N-060 — Aadhya: Penicillin Allergy

**Type:** CONSTRAINT  
**Importance:** 0.99

**Clinical basis:**  
Anaphylaxis to penicillin at 18 months constitutes a confirmed severe
allergy. Absolute contraindication to all penicillin-class antibiotics
(amoxicillin, ampicillin, flucloxacillin). Azithromycin is the
standard alternative for paediatric ear infections.

**Sources:**
- NICE guideline CG69 — Respiratory tract infections (2008, updated 2014)
- British Society for Allergy and Clinical Immunology (BSACI) —
  Penicillin allergy guidelines
- BNF for Children — Azithromycin dosing (10mg/kg)
- Fictionalised paediatric patient record for simulation purposes

---

## Node: N-061 — Aadhya: Infection History

**Type:** FACT  
**Importance:** 0.75

**Clinical basis:**  
Recurrent otitis media (4+ episodes per year) in a child under 5 is
a clinical indicator for ENT referral and possible grommets consideration.
Maternal requests for inappropriate antibiotics despite allergy
documentation reflect real-world ANTI_PATTERN behaviour.

**Sources:**
- NICE guideline NG91 — Otitis media (acute): antimicrobial prescribing (2018)
- SIGN guideline 66 — Diagnosis and management of childhood otitis media
- Fictionalised patient history for simulation purposes

---

## Node: N-M01 — Sepsis Protocol v3

**Type:** DECISION  
**Importance:** 0.95

**Clinical basis:**  
The Sepsis-3 bundle (cultures, lactate, fluids, vasopressors) is the
international standard for sepsis management, endorsed by Surviving
Sepsis Campaign guidelines.

**Sources:**
- Surviving Sepsis Campaign: International Guidelines for Management
  of Sepsis and Septic Shock (2021). *Critical Care Medicine.*
- NHS England Sepsis Guidance (2017)
- Singer M et al. (2016). "The Third International Consensus Definitions
  for Sepsis and Septic Shock (Sepsis-3)." *JAMA.*

---

## Node: N-M02 — Diabetic Fasting Protocol

**Type:** CONSTRAINT  
**Importance:** 0.90

**Clinical basis:**  
Diabetic patients on sulphonylureas (Glimepiride) are at high
hypoglycaemia risk when fasting. Dose adjustment and blood glucose
monitoring are standard practice during fasting periods or pre-procedure.

**Sources:**
- JBDS-IP (Joint British Diabetes Societies for Inpatient Care) —
  Management of Adults with Diabetes undergoing Surgery and Elective
  Procedures (2016)
- NHS Diabetes — Guidance on medication adjustment during fasting
- Diabetes UK — Managing diabetes during Ramadan (fasting guidance)

---

## Nodes: N-D01, N-D02 — General Medical Facts

**Type:** FACT  
**Importance:** 0.30-0.35

**Clinical basis:**  
General textbook definitions of osteoarthritis and Tramadol's mechanism
of action. Included as low-importance FACT nodes to test that the
system correctly scores general knowledge at low confidence and does
not re-extract it from transcripts.

**Sources:**
- Kumar & Clark's Clinical Medicine (10th ed.) — Osteoarthritis chapter
- BNF — Tramadol monograph: mechanism of action

---

## Nodes: N-070, N-071 — Orthopaedic Operational Nodes

**Type:** DECISION / FACT  
**Importance:** 0.72-0.80

**Clinical basis:**  
Pain escalation ladders (Paracetamol → Tramadol → Morphine) reflect
WHO analgesic ladder principles applied to post-surgical orthopaedic
care. Implant brand preferences are fictionalised organisational
decisions for simulation purposes.

**Sources:**
- WHO Pain Ladder — [who.int](https://www.who.int/cancer/palliative/painladder)
- PROSPECT Guidelines — Post-TKR analgesia recommendations
- Fictionalised implant preference for simulation purposes

---

## Nodes: N-072, N-073 — Hospital-Wide Safety Constraints

**Type:** CONSTRAINT  
**Importance:** 0.85-0.88

**Clinical basis:**  
Fall risk assessment on admission (Morse Fall Scale) and 72-hour
antibiotic de-escalation are standard inpatient safety protocols
mandated by NHS and international accreditation bodies.

**Sources:**
- NICE guideline CG161 — Falls in older people: assessing risk and
  prevention (2013)
- Morse JM (1997). *Preventing Patient Falls.* Sage Publications.
- NICE guideline NG15 — Antimicrobial stewardship (2015)
- Public Health England — Start Smart, Then Focus: Antimicrobial
  Stewardship Toolkit (2015)

---

## Disclaimer

All patient names (Ramaiah, Aadhya), patient IDs, and clinical histories
in this dataset are **entirely fictionalised** and created solely for
the purpose of this assessment simulation. Any resemblance to real
patients is coincidental. Clinical rules and drug interactions are
based on real published guidelines as cited above, but this system
is **not intended for real clinical use**.