import { useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';

const questions = [
  { prompt: 'A student walks 10 m east, then 10 m west. Which pair is correct?', choices: ['Distance 0 m; displacement 20 m', 'Distance 20 m; displacement 0 m', 'Distance 10 m; displacement 10 m'], answer: 1, reason: 'Path lengths add to 20 m, but the final position is the starting position, so net displacement is zero.' },
  { prompt: 'A velocity–time graph slopes downward. What does its gradient represent?', choices: ['Position', 'Acceleration', 'Distance'], answer: 1, reason: 'The gradient is change in velocity divided by change in time: acceleration.' },
  { prompt: 'With upward defined as positive near Earth, what is g?', choices: ['+9.81 m/s²', '0 m/s²', '−9.81 m/s²'], answer: 2, reason: 'Gravity points downward, opposite the chosen positive direction.' },
  { prompt: 'When may you use v_f = vᵢ + at?', choices: ['Whenever an object moves', 'When acceleration is constant over the interval', 'Only when the object starts from rest'], answer: 1, reason: 'The constant-acceleration equations assume acceleration remains constant during the interval.' },
  { prompt: 'The signed area under a velocity–time graph gives…', choices: ['Displacement', 'Acceleration', 'Average speed'], answer: 0, reason: 'Velocity multiplied by time has units of metres, and the sign records direction: displacement.' },
];

export function KinematicsCheckpoint() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
  const reset = () => setAnswers({});
  return (
    <section id="checkpoint" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Check your understanding</p><h2 className="mt-3 font-display text-section text-star-white">Five quick checkpoints</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-star-white/50">Choose an answer for each question. Feedback explains the physics so you can learn from every choice.</p></div>
        <div className="flex items-center gap-3"><span className="rounded-full border border-surface-border px-3 py-1.5 font-mono text-xs text-accent-ice" aria-live="polite">Score {score} / {Object.keys(answers).length}</span><button type="button" onClick={reset} className="btn-ghost min-h-10 px-3 py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div>
      </div>
      <div className="space-y-3">
        {questions.map((question, index) => {
          const selected = answers[index];
          const answered = selected !== undefined;
          const correct = selected === question.answer;
          return <fieldset key={question.prompt} className="glass-panel p-5 sm:p-6">
            <legend className="sr-only">Checkpoint {index + 1}</legend>
            <p className="font-display text-base font-medium leading-6 text-star-white"><span className="mr-2 font-mono text-xs text-accent-cyan">{String(index + 1).padStart(2, '0')}</span>{question.prompt}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {question.choices.map((choice, choiceIndex) => <button key={choice} type="button" aria-pressed={selected === choiceIndex} onClick={() => setAnswers((previous) => ({ ...previous, [index]: choiceIndex }))} className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 ${selected === choiceIndex ? (correct ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/40 bg-rose-400/10 text-rose-100') : 'border-surface-border bg-space-900/35 text-star-white/60 hover:border-surface-border-hover hover:text-star-white'}`}>{choice}</button>)}
            </div>
            {answered && <p className={`mt-3 flex items-start gap-2 text-sm leading-6 ${correct ? 'text-emerald-200/80' : 'text-star-white/55'}`}><span className="mt-0.5">{correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-rose-300" />}</span>{question.reason}</p>}
          </fieldset>;
        })}
      </div>
    </section>
  );
}
