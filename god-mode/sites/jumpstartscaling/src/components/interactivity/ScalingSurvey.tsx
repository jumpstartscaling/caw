import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitLead } from '../../lib/api';
import './ScalingSurvey.css';

interface SurveyState {
  industry: string;
  revenue: string;
  team: string;
  bottleneck: string;
  name: string;
  email: string;
  phone: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
  page_url?: string;
  [key: string]: string | undefined;
}

const ScalingSurvey = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyState>({
    industry: '',
    revenue: '',
    team: '',
    bottleneck: '',
    name: '',
    email: '',
    phone: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: ''
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs for focus management
  const formRef = useRef<HTMLDivElement>(null);
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Capture UTMs on Load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
      const val = params.get(key);
      if (val) utms[key] = val;
    });
    utms.page_url = window.location.href;

    if (Object.keys(utms).length > 0) {
      setAnswers(prev => ({ ...prev, ...utms }));
    }
  }, []);

  // Auto-focus first error
  useEffect(() => {
    const errorKeys = Object.keys(errors).filter(k => errors[k]);
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      const input = formRef.current?.querySelector(`[name="${firstError}"]`) as HTMLInputElement;
      input?.focus();
    }
  }, [errors]);

  const questions = [
    {
      key: 'industry',
      question: "What type of business are you scaling?",
      type: 'grid',
      options: [
        { label: "E-Commerce", icon: "🛍️" },
        { label: "B2B / SaaS", icon: "💻" },
        { label: "Service Agency", icon: "🤝" },
        { label: "Local Business", icon: "📍" }
      ]
    },
    {
      key: 'revenue',
      question: "What is your current monthly revenue?",
      type: 'grid',
      options: [
        { label: "< $10k/mo", icon: "🌱" },
        { label: "$10k - $50k", icon: "🚀" },
        { label: "$50k - $200k", icon: "🏢" },
        { label: "$200k+", icon: "🦄" }
      ]
    },
    {
      key: 'team',
      question: "What does your marketing team look like?",
      type: 'grid',
      options: [
        { label: "Just Me (Founder)", icon: "👤" },
        { label: "Freelancers", icon: "🎨" },
        { label: "Small In-House", icon: "👥" },
        { label: "Full Department", icon: "🏢" }
      ]
    },
    {
      key: 'bottleneck',
      question: "What is your biggest blocker right now?",
      type: 'grid',
      options: [
        { label: "Lead Quality", icon: "📉" },
        { label: "Ad Performance", icon: "💸" },
        { label: "Tech / CRM", icon: "⚙️" },
        { label: "Sales Process", icon: "📞" }
      ]
    },
    {
      key: 'contact',
      question: "Where should we send your Growth Audit?",
      type: 'input'
    }
  ];

  const handleOptionClick = (val: string) => {
    setAnswers({ ...answers, [questions[step].key]: val });
    nextStep();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: value });
    // Clear field error and submit error when user types
    const next = { ...errors, [name]: null };
    if (errors._submit) next._submit = null;
    setErrors(next);
  };

  const validateStep = () => {
    // Only needed for contact step
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    if (questions[step].key === 'contact') {
      if (!answers.name || answers.name.length < 2) {
        newErrors.name = "Full name is required";
        isValid = false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!answers.email || !emailRegex.test(answers.email)) {
        newErrors.email = "Please enter a valid business email";
        isValid = false;
      }
      if (!answers.phone || answers.phone.length < 10) {
        newErrors.phone = "Valid phone number required";
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      if (validateStep()) submitForm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      nextStep();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, _submit: null }));
    try {
      const submissionData = {
        ...answers,
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        formType: 'audit_survey'
      };

      // 1. Save to leads via godmode API (primary — must succeed)
      await submitLead(submissionData);

      // 2. Local backup (optional, for resilience)
      try {
        const existingLeads = JSON.parse(localStorage.getItem('jumpstart_leads') || '[]');
        existingLeads.push(submissionData);
        localStorage.setItem('jumpstart_leads', JSON.stringify(existingLeads));
      } catch (_) {}

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);

    } catch (e) {
      console.error('Submission failed:', e);
      setIsSubmitting(false);
      setErrors({ _submit: 'Something went wrong. Please try again or email us directly.' });
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="survey-container success-state"
        role="alert"
        aria-live="assertive"
      >
        <div className="success-icon-wrapper">
          <div className="success-icon" aria-hidden="true">✨</div>
        </div>
        <h3>Audit Request Received</h3>
        <p>Thanks <span className="text-gold">{answers.name.split(' ')[0]}</span>. Check your inbox specifically for an email from <strong>Chris</strong>.</p>
        <div className="success-actions">
          <p className="highlight-text">I am reviewing your answers and will call you at <strong>{answers.phone}</strong> shortly.</p>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[step];
  const progress = ((step + 1) / questions.length) * 100;
  const isContactStep = currentQ.type === 'input';
  const hasErrors = Object.values(errors).some(e => e !== null);

  return (
    <div className="survey-container" ref={formRef}>

      {/* Live Region for Screen Readers */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Step {step + 1} of {questions.length}: {questions[step].question}
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <div role="alert" aria-live="assertive" className="sr-only">
          Please fix the following errors: {Object.values(errors).filter(e => e).join(', ')}
        </div>
      )}

      <div className="progress-bar" aria-hidden="true">
        <motion.div
          className="fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="question-area">
        <div className="header-row">
          <span className="step-count">0{step + 1} / 0{questions.length}</span>
          {step > 0 && (
            <button className="back-btn" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="step-content"
          >
            <h2>{currentQ.question}</h2>

            {isContactStep ? (
              <form className="input-area" onKeyDown={handleKeyDown} onSubmit={(e) => { e.preventDefault(); if (validateStep()) submitForm(); }}>
                <div className={`form-group ${errors.name ? 'error' : ''}`}>
                  <label htmlFor="survey-name">Full Name <span className="sr-only">(Required)</span></label>
                  <input
                    id="survey-name"
                    type="text" name="name" placeholder="John Doe"
                    value={answers.name} onChange={handleInput}
                    autoComplete="name"
                    autoFocus
                    required
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <div id="name-error" className="error-msg" role="alert" ref={el => errorRefs.current.name = el}>
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className={`form-group ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="survey-email">Work Email <span className="sr-only">(Required)</span></label>
                  <input
                    id="survey-email"
                    type="email" name="email" placeholder="name@company.com"
                    value={answers.email} onChange={handleInput}
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <div id="email-error" className="error-msg" role="alert" ref={el => errorRefs.current.email = el}>
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                  <label htmlFor="survey-phone">Mobile Phone <span className="sr-only">(Required)</span></label>
                  <input
                    id="survey-phone"
                    type="tel" name="phone" placeholder="(555) 123-4567"
                    value={answers.phone} onChange={handleInput}
                    autoComplete="tel"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  <small className="privacy-note">🔒 Data sent securely. No spam.</small>
                  {errors.phone && (
                    <div id="phone-error" className="error-msg" role="alert" ref={el => errorRefs.current.phone = el}>
                      {errors.phone}
                    </div>
                  )}
                </div>

                {errors._submit && (
                  <div className="error-msg" role="alert">
                    {errors._submit}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading-spinner" aria-live="polite">Processing...</span>
                  ) : (
                    "Get My Free Audit →"
                  )}
                </button>
              </form>
            ) : (
              <div className="options-grid" role="radiogroup" aria-label={currentQ.question}>
                {currentQ.options?.map((opt, i) => (
                  <button
                    key={i}
                    className="option-card"
                    onClick={() => handleOptionClick(opt.label)}
                    role="radio"
                    aria-checked={answers[currentQ.key] === opt.label}
                  >
                    <span className="opt-icon" aria-hidden="true">{opt.icon}</span>
                    <span className="opt-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScalingSurvey;