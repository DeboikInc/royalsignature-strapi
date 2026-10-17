// components/FAQItem.jsx
'use client';

import { RiAddLine, RiSubtractLine } from "react-icons/ri";
import { useState } from "react";

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left"
      >
        <h3 className="text-lg font-medium text-gray-800">{question}</h3>
        {isOpen ? (
          <RiSubtractLine className="w-6 h-6 text-accent" />
        ) : (
          <RiAddLine className="w-6 h-6 text-accent" />
        )}
      </button>
      <div className={`px-6 pb-6 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="text-gray-600">
          {Array.isArray(answer[0]) ? (
            <>
              <p className="mb-4">{answer[0]}</p>
              <ul className="list-disc pl-5 space-y-2">
                {answer[1].map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
              {answer[2] && <p className="mt-4 text-sm text-gray-500">{answer[2]}</p>}
            </>
          ) : typeof answer[0] === 'object' ? (
            <div className="space-y-4">
              {answer.map((step, k) => (
                <div key={k}>
                  <h4 className="font-medium text-gray-700 mb-1">{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4">{answer[0]}</p>
              <ul className="list-disc pl-5 space-y-2">
                {answer[1].map((item, l) => (
                  <li key={l}>{item}</li>
                ))}
              </ul>
              {answer[2] && <p className="mt-4">{answer[2]}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
