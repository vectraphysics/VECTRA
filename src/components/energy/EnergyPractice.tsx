import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { energyFlashcards, energyQuestions } from '@/data/energyWorkPower';

const sections = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function EnergyPractice() {
  const [section, setSection] = useState('All');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const filtered = section === 'All' ? energyQuestions : energyQuestions.filter((question) => question.section === section);
  const question = filtered[Math.min(questionIndex, filtered.length - 1)];
  const answerKey = `${question.section}-${energyQuestions.indexOf(question)}`;
  const choice = selected[answerKey];
  const isCorrect = choice === question.answer;
  const answeredCount = Object.keys(selected).length;
  const score = Object.entries(selected).reduce((total, [key, answer]) => {
    const originalIndex = Number(key.split('-')[1]);
    return total + (energyQuestions[originalIndex]?.answer === answer ? 1 : 0);
  }, 0);
  const card = energyFlashcards[cardIndex];

  const changeSection = (value: string) => {
    setSection(value);
    setQuestionIndex(0);
  };
  const resetQuiz = () => {
    setSelected({});
    setQuestionIndex(0);
    setSection('All');
  };
  const moveCard = (direction: number) => {
    setCardIndex((current) => (current + direction + energyFlashcards.length) % energyFlashcards.length);
    setRevealed(false);
  };

  return (
    <div className="space-y-12">
      <section aria-labelledby="practice-heading">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Practice bank · {energyQuestions.length} questions</p><h3 id="practice-heading" className="mt-2 font-display text-2xl font-semibold">Check your understanding</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/50">Choose a chapter section, answer, then read the explanation. Questions include concepts, calculations, unit reasoning, and exam-style applications.</p></div>
          <div className="flex flex-wrap items-center gap-2"><span aria-live="polite" className="rounded-full border border-surface-border px-3 py-2 font-mono text-xs text-accent-ice">Score {score} / {answeredCount}</span><button type="button" onClick={resetQuiz} className="btn-ghost min-h-10 px-3 py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter practice questions by section">{sections.map((value) => <button type="button" key={value} aria-pressed={section === value} onClick={() => changeSection(value)} className={`min-h-10 rounded-full border px-3 font-mono text-xs transition-colors ${section === value ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice' : 'border-surface-border text-star-white/45 hover:border-surface-border-hover'}`}>{value === 'All' ? 'All sections' : `Section ${value}`}</button>)}</div>
        <article className="glass-panel p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-mono text-xs uppercase tracking-widest text-accent-cyan">Section {question.section} · {question.kind}</span><span className="font-mono text-xs text-star-white/40">Question {questionIndex + 1} of {filtered.length}</span></div>
          <h4 className="mt-4 font-display text-lg font-medium leading-7">{question.prompt}</h4>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">{question.choices.map((option, index) => <button type="button" key={option} aria-pressed={choice === index} onClick={() => setSelected((previous) => ({ ...previous, [answerKey]: index }))} className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 ${choice === index ? (isCorrect ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/40 bg-rose-400/10 text-rose-100') : 'border-surface-border bg-space-900/35 text-star-white/60 hover:border-surface-border-hover hover:text-star-white'}`}>{option}</button>)}</div>
          {choice !== undefined && <p role="status" className={`mt-4 flex items-start gap-2 text-sm leading-6 ${isCorrect ? 'text-emerald-200/85' : 'text-star-white/60'}`}>{isCorrect ? <Check className="mt-1 h-4 w-4 shrink-0" /> : <X className="mt-1 h-4 w-4 shrink-0 text-rose-300" />}{question.explanation}</p>}
          <div className="mt-6 flex justify-between border-t border-surface-border pt-4"><button type="button" onClick={() => setQuestionIndex((current) => Math.max(0, current - 1))} disabled={questionIndex === 0} className="btn-ghost min-h-10 px-3 py-2 text-xs disabled:opacity-35"><ChevronLeft className="h-4 w-4" />Previous</button><button type="button" onClick={() => setQuestionIndex((current) => Math.min(filtered.length - 1, current + 1))} disabled={questionIndex === filtered.length - 1} className="btn-primary min-h-10 px-4 py-2 text-xs disabled:opacity-35">Next question<ChevronRight className="h-4 w-4" /></button></div>
        </article>
      </section>

      <section aria-labelledby="flashcards-heading">
        <div className="mb-5"><p className="eyebrow">Active recall · {energyFlashcards.length} cards</p><h3 id="flashcards-heading" className="mt-2 font-display text-2xl font-semibold">Flashcards</h3><p className="mt-2 text-sm leading-6 text-star-white/50">Try to answer from memory before revealing the explanation. Use the buttons or keyboard focus to move through each card.</p></div>
        <div className="glass-panel p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4"><span className="font-mono text-xs uppercase tracking-widest text-accent-cyan">{revealed ? 'Answer' : 'Recall prompt'}</span><span className="font-mono text-xs text-star-white/45">Card {cardIndex + 1} of {energyFlashcards.length}</span></div>
          <button type="button" aria-expanded={revealed} onClick={() => setRevealed((value) => !value)} className="mt-4 flex min-h-44 w-full items-center justify-center rounded-xl border border-accent-cyan/15 bg-space-900/45 p-6 text-center transition-colors hover:border-accent-cyan/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 sm:min-h-52 sm:p-10"><span className="max-w-3xl font-display text-lg leading-8 text-star-white sm:text-xl">{revealed ? card.back : card.front}</span></button>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => moveCard(-1)} className="btn-ghost min-h-10 px-3 py-2 text-xs"><ChevronLeft className="h-4 w-4" />Previous</button><button type="button" onClick={() => setRevealed((value) => !value)} className="btn-primary min-h-10 px-4 py-2 text-xs">{revealed ? 'Show prompt' : 'Reveal answer'}</button><button type="button" onClick={() => moveCard(1)} className="btn-ghost min-h-10 px-3 py-2 text-xs">Next<ChevronRight className="h-4 w-4" /></button></div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-space-600" role="progressbar" aria-label="Flashcard position" aria-valuemin={1} aria-valuemax={energyFlashcards.length} aria-valuenow={cardIndex + 1}><div className="h-full rounded-full bg-accent-cyan transition-[width] duration-300" style={{ width: `${((cardIndex + 1) / energyFlashcards.length) * 100}%` }} /></div>
        </div>
      </section>
    </div>
  );
}
