import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Users, 
  AlertTriangle, 
  Calendar, 
  X, 
  ChevronRight,
  Search
} from 'lucide-react';

interface Template {
  name: string;
  content: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  templates: Template[];
}

const TEMPLATE_CATEGORIES: Category[] = [
  {
    id: 'shift',
    name: 'Shift Management',
    icon: ClipboardList,
    color: 'var(--clinical-blue)',
    templates: [
      {
        name: 'Shift Handoff Report',
        description: 'Standardized handover protocol for shift changes',
        content: `# Shift Handoff Report
**Unit:** [UNIT NAME]
**Date:** [DATE]
**Shift:** [Day/Night]
**Charge Nurse:** [NAME]

## 1. Census & Acuity
* **Total Census:** [NUMBER]
* **Admissions:** [NUMBER] | **Discharges:** [NUMBER] | **Transfers:** [NUMBER]
* **High Acuity Patients:** [ROOM NUMBERS/NAMES]
* **1:1 Observations:** [ROOM NUMBERS]

## 2. Staffing Status
* **RNs on duty:** [NUMBER]
* **CNAs/Techs:** [NUMBER]
* **Sick calls/Absences:** [NAMES]
* **Float staff:** [NAMES]

## 3. Safety & Incidents
- [ ] Patient Falls: [DETAILS/NONE]
- [ ] Medication Errors: [DETAILS/NONE]
- [ ] Behavioral Issues: [DETAILS/NONE]
- [ ] Skin Issues (Pressure Injuries): [DETAILS/NONE]

## 4. Environment & Equipment
- [ ] Crash Cart Check Completed
- [ ] Glucometer QC Completed
- [ ] Broken Equipment: [DETAILS]

## 5. Pending Tasks / Follow-ups
- [ ] [TASK 1]
- [ ] [TASK 2]
- [ ] [TASK 3]
`
      },
      {
        name: 'Daily Unit Checklist',
        description: 'Routine safety and operational checks',
        content: `# Daily Unit Checklist
**Date:** [DATE]
**Unit:** [UNIT NAME]
**Time:** [TIME]

## Safety Checks
- [ ] **Fire Exits:** Clear and unobstructed
- [ ] **Hallways:** Clear of clutter/equipment
- [ ] **Crash Cart:** Locked and seal intact (Exp: [DATE])
- [ ] **O2 Tanks:** Full and available
- [ ] **Suction Equipment:** Functioning in all empty rooms

## Environmental
- [ ] **Fridge Temperatures:** Checked and logged
- [ ] **Medication Room:** Clean, no loose meds
- [ ] **Clean Utility:** Organized
- [ ] **Soiled Utility:** No overflowing bins

## Staffing & Huddles
- [ ] **Staff Huddle Completed:** [TIME]
- [ ] **Breaks Assigned:** [YES/NO]
- [ ] **Patient Boards Updated:** [YES/NO]

**Notes/Deficiencies:**
> [ENTER NOTES HERE]
`
      }
    ]
  },
  {
    id: 'staff',
    name: 'Staff Management',
    icon: Users,
    color: 'var(--status-success)',
    templates: [
      {
        name: 'Staff Performance Review',
        description: 'Quarterly or annual performance evaluation draft',
        content: `# Staff Performance Review
**Employee Name:** [STAFF NAME]
**Position:** [TITLE]
**Date:** [DATE]
**Review Period:** [START DATE] - [END DATE]

## 1. Clinical Competence
* **Strengths:**
  * [STRENGTH 1]
  * [STRENGTH 2]
* **Areas for Improvement:**
  * [AREA 1]

## 2. Professionalism & Teamwork
* **Attendance/Punctuality:** [COMMENTS]
* **Communication Skills:** [COMMENTS]
* **Team Collaboration:** [COMMENTS]

## 3. Goals
### Previous Goals Status
- [ ] Goal 1: [STATUS]
- [ ] Goal 2: [STATUS]

### New Goals for Next Period
1. [GOAL 1]
2. [GOAL 2]

## 4. Employee Comments
> [EMPLOYEE FEEDBACK SUMMARY]

**Manager Signature:** ____________________
**Employee Signature:** ____________________
`
      },
      {
        name: 'Coaching Note',
        description: 'Documentation for informal coaching or feedback',
        content: `# Staff Coaching Note
**Employee:** [NAME]
**Date:** [DATE]
**Topic:** [TOPIC]

## Observation / Situation
[DESCRIBE WHAT WAS OBSERVED OR THE SITUATION THAT OCCURRED]

## Discussion
* **Expectation:** [WHAT IS THE EXPECTED BEHAVIOR/PROTOCOL]
* **Employee Perspective:** [SUMMARY OF EMPLOYEE RESPONSE]
* **Action Plan:** [AGREED NEXT STEPS]

## Follow-up
- [ ] Follow-up scheduled for: [DATE]
`
      }
    ]
  },
  {
    id: 'incident',
    name: 'Incident & Compliance',
    icon: AlertTriangle,
    color: 'var(--alert-orange)',
    templates: [
      {
        name: 'Incident Report Draft',
        description: 'Internal documentation of an event',
        content: `# Incident Report Draft
**Date of Incident:** [DATE]
**Time:** [TIME]
**Location:** [LOCATION]
**Persons Involved:** [NAMES/ROLES]

## Description of Event
[FACTUAL DESCRIPTION OF WHAT HAPPENED. DO NOT INCLUDE OPINIONS.]

## Immediate Actions Taken
- [ ] Patient assessed by: [NAME]
- [ ] Physician notified: [NAME] at [TIME]
- [ ] Family notified: [NAME] at [TIME]
- [ ] Supervisor notified

## Outcome/Patient Status
[CURRENT STATUS OF PATIENT/AFFECTED PARTY]

## Witness Statements
* **Witness 1:** [SUMMARY]
* **Witness 2:** [SUMMARY]
`
      },
      {
        name: 'Safety Compliance Checklist',
        description: 'Joint Commission readiness check',
        content: `# Safety Compliance Checklist
**Unit:** [UNIT NAME]
**Date:** [DATE]
**Auditor:** [NAME]

## Infection Control
- [ ] Hand hygiene observed (entry/exit)
- [ ] PPE available and worn correctly
- [ ] No food/drink in patient care areas
- [ ] Disinfectant wipes available and closed

## Medication Safety
- [ ] Med room locked
- [ ] No expired medications found
- [ ] Multi-dose vials dated (28 days)
- [ ] Patient meds labeled correctly

## Environment of Care
- [ ] Ceiling tiles intact
- [ ] No stained tiles
- [ ] Fire extinguishers current (checked monthly)
- [ ] Hallways clear (48 inches wide min)

## Documentation
- [ ] Pain assessments completed/documented
- [ ] Restraint orders current (if applicable)
- [ ] Critical labs reported within 1 hr

**Correction Plan:**
- [ ] [ACTION ITEM 1]
`
      }
    ]
  },
  {
    id: 'meetings',
    name: 'Meetings',
    icon: Calendar,
    color: 'var(--clinical-teal)',
    templates: [
      {
        name: 'Huddle Notes',
        description: 'Start-of-shift safety huddle record',
        content: `# Safety Huddle Notes
**Date:** [DATE]
**Shift:** [SHIFT]
**Leader:** [NAME]

## Safety First
* **Safety Successes (Last 24h):** [DETAILS]
* **Safety Concerns (Look out for):**
  - [ ] Fall risks: [ROOMS]
  - [ ] Confused/Aggressive patients: [ROOMS]
  - [ ] New equipment/procedures

## Unit Updates
* **Census:** [NUMBER]
* **Staffing:** [ADEQUATE/SHORT]
* **Announcements:**
  * [ANNOUNCEMENT 1]

## Shout-outs / Recognition
* [NAME] for [REASON]

## Questions/Concerns
* [QUESTION]
`
      },
      {
        name: 'Staff Meeting Agenda',
        description: 'Monthly staff meeting agenda template',
        content: `# Staff Meeting Agenda
**Date:** [DATE]
**Time:** [TIME]
**Location:** [LOCATION/VIRTUAL]

## 1. Call to Order & Welcome
- [ ] Attendance Sheet

## 2. Quality & Safety Data
* Falls Data: [Review]
* Infection Rates (CLABSI/CAUTI): [Review]
* Medication Errors: [Review]

## 3. Operations Updates
* New Policies/Protocols
* Equipment Updates
* Staffing/Scheduling Updates

## 4. Education / In-service
* **Topic:** [TOPIC NAME]
* **Presenter:** [NAME]

## 5. Open Forum / Round Table
* [Staff Concerns/Questions]

## 6. Action Items
- [ ] [ACTION 1] - Assigned to: [NAME] - Due: [DATE]
- [ ] [ACTION 2] - Assigned to: [NAME] - Due: [DATE]
`
      }
    ]
  }
];

interface NurseTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string, suggestedName: string) => void;
}

export function NurseTemplates({ isOpen, onClose, onSelectTemplate }: NurseTemplatesProps) {
  const [activeCategory, setActiveCategory] = useState<string>('shift');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategory = TEMPLATE_CATEGORIES.find(c => c.id === activeCategory);

  const filteredTemplates = currentCategory?.templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="settings-overlay" onClick={onClose} style={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.4)' }}>
      <div 
        className="settings-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '900px', 
          height: '600px', 
          maxWidth: '90vw', 
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="settings-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClipboardList size={24} style={{ color: 'var(--clinical-blue)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Template Library</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 32px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-sidebar)',
                  fontSize: '13px',
                  width: '200px',
                  outline: 'none'
                }}
              />
            </div>
            <button className="settings-close-btn" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        <div className="settings-body" style={{ display: 'flex', flexDirection: 'row', height: 'calc(100% - 73px)' }}>
          {/* Sidebar - Categories */}
          <div className="settings-tabs" style={{ width: '240px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-sidebar)', padding: '12px' }}>
            {TEMPLATE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isActive ? 'white' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px',
                    fontWeight: isActive ? 600 : 400,
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? category.color : 'currentColor' }} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content - Template List */}
          <div className="settings-content" style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-main)' }}>
            {currentCategory && (
              <div className="fade-in">
                <h3 className="settings-section-title" style={{ 
                  marginBottom: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: currentCategory.color
                }}>
                  <currentCategory.icon size={20} />
                  {currentCategory.name}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {filteredTemplates?.map((template, index) => (
                    <div 
                      key={index}
                      className="template-card"
                      onClick={() => onSelectTemplate(template.content, template.name)}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = currentCategory.color;
                        e.currentTarget.style.boxShadow = `0 8px 20px -6px ${currentCategory.color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Color accent bar on left */}
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: currentCategory.color
                      }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{template.name}</h4>
                        </div>
                      </div>
                      
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        color: 'var(--text-secondary)', 
                        lineHeight: '1.5',
                        flex: 1,
                        paddingLeft: '8px'
                      }}>
                        {template.description}
                      </p>

                      <div style={{ 
                        marginTop: '4px', 
                        paddingTop: '12px', 
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        color: currentCategory.color,
                        fontSize: '12px',
                        fontWeight: 600,
                        alignItems: 'center',
                        gap: '4px',
                        paddingLeft: '8px'
                      }}>
                        Use Template <ChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                  {filteredTemplates?.length === 0 && (
                     <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                       No templates found matching "{searchTerm}"
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NurseTemplates;
