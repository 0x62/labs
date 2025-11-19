import React, { useState } from 'react';
import { CheckCircle, ChevronRight, BookOpen, HelpCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Step, ProjectileState, SolvedVariables } from '../types';
import { generateSteps } from '../utils/math';
import MathDisplay from './MathDisplay';

interface QuizCardProps {
  variableKey: string;
  label: string;
  correctValue: number;
  unit: string;
  inputs: ProjectileState;
  solvedData: SolvedVariables;
  hint?: string;
  extraParams?: { time?: number };
  onSolve: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  variableKey, 
  label, 
  correctValue, 
  unit, 
  inputs, 
  solvedData,
  hint,
  extraParams,
  onSolve
}) => {
  const [userGuess, setUserGuess] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  const checkAnswer = () => {
    const val = parseFloat(userGuess);
    if (isNaN(val)) return;
    
    // Allow 5% margin of error or 0.1 absolute for near-zero
    const margin = Math.max(Math.abs(correctValue * 0.05), 0.1);
    const isCorrect = Math.abs(val - correctValue) <= margin;
    
    if (isCorrect) {
      setStatus('correct');
      onSolve();
    } else {
      setStatus('incorrect');
    }
  };

  const toggleGuide = () => {
    if (!showSteps && steps.length === 0) {
      const generated = generateSteps(variableKey, inputs, solvedData, extraParams);
      setSteps(generated);
      setCurrentStep(0);
    }
    setShowSteps(!showSteps);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const revealAnswer = () => {
    setUserGuess(correctValue.toFixed(2));
    setStatus('correct');
    onSolve();
    setShowSteps(false);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      
      {/* Main Card Body */}
      <div className="p-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Context & Hints */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-lg text-slate-800">{label}</h4>
              {status === 'correct' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" /> Solved
                </span>
              )}
              {status === 'incorrect' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 mr-1" /> Try Again
                </span>
              )}
            </div>
            
            <div className="text-slate-600 text-sm leading-relaxed mb-4">
               {hint ? <MathDisplay latex={hint} /> : "Determine the value of this variable based on the known parameters."}
            </div>
          </div>

          <div>
             <button 
              onClick={toggleGuide}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {showSteps ? (
                <>Hide Breakdown <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>Show Step-by-Step Guide <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Input Area */}
        <div className="md:w-72 flex-shrink-0 flex flex-col justify-center p-4 bg-slate-50 rounded-lg border border-slate-100">
           <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
             Your Answer
           </label>
           <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  className={`block w-full pl-3 pr-12 py-2 sm:text-sm rounded-md focus:ring-2 focus:ring-offset-0 shadow-sm border outline-none transition-all
                    ${status === 'correct' 
                      ? 'bg-green-50 border-green-300 text-green-900 focus:ring-green-500' 
                      : status === 'incorrect' 
                        ? 'bg-white border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  placeholder="?"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  disabled={status === 'correct'}
                  onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 sm:text-sm">{unit}</span>
                </div>
              </div>
              <button 
                onClick={checkAnswer}
                disabled={status === 'correct'}
                className={`px-4 py-2 rounded-md text-sm font-semibold shadow-sm text-white transition-colors
                  ${status === 'correct' 
                    ? 'bg-green-600 opacity-50 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Check
              </button>
           </div>
           {status === 'incorrect' && (
             <p className="text-xs text-red-600 mt-2 ml-1">
               Incorrect. Try reviewing the steps or checking your units.
             </p>
           )}
        </div>

      </div>

      {/* Expandable Step Guide */}
      {showSteps && steps.length > 0 && (
        <div className="bg-indigo-50 border-t border-indigo-100 p-6 animate-in slide-in-from-top-2 duration-200">
          
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-800 tracking-wide uppercase flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" /> Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <div className="min-h-[120px] bg-white rounded-lg p-6 border border-indigo-100 shadow-sm mb-6">
              <p className="text-slate-800 text-base mb-4">
                <MathDisplay latex={steps[currentStep].explanation} />
              </p>
              {steps[currentStep].latex && (
                <div className="w-full overflow-x-auto py-2 flex justify-center">
                   <MathDisplay latex={steps[currentStep].latex!} block className="text-xl text-indigo-700" />
                </div>
              )}
            </div>
                
            <div className="flex justify-between items-center">
               <div className="flex gap-2">
                  <button 
                    onClick={revealAnswer}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 px-3 py-2 rounded hover:bg-indigo-100 transition-colors"
                  >
                    I give up, show answer
                  </button>
               </div>
               
               <div className="flex gap-3">
                 <button
                   onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                   disabled={currentStep === 0}
                   className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Previous
                 </button>
                 {currentStep < steps.length - 1 ? (
                   <button 
                     onClick={nextStep}
                     className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm"
                   >
                     Next Step <ChevronRight className="w-4 h-4 ml-1" />
                   </button>
                 ) : (
                    <span className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-2" /> Complete
                    </span>
                 )}
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default QuizCard;