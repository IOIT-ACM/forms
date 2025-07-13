import React, { useState, useEffect } from 'react';
import { FormSchema, Question, FormMessage } from '@/types';

// Type guard to check if the API response is a full form schema
function isFormSchema(response: any): response is FormSchema {
  return response && typeof response === 'object' && Array.isArray(response.questions);
}

const SlugPage: React.FC = () => {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const pageSlug = path.startsWith('/') ? path.substring(1) : path;
    setSlug(pageSlug);

    if (pageSlug) {
      setLoading(true);
      const apiUrl = `https://os.ioit.acm.org/form_builder/api/forms/public/${pageSlug}/schema/`;
      
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.detail || `API request failed with status ${response.status}`);
            });
          }
          return response.json();
        })
        .then((apiJson: FormSchema | FormMessage) => {
          if (isFormSchema(apiJson)) {
            setFormSchema(apiJson);
            setError(null);
          } else {
            setError((apiJson as FormMessage).message || 'An unexpected API response was received.');
            setFormSchema(null);
          }
        })
        .catch(err => {
          setError(err.message);
          setFormSchema(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('No slug found in the URL.');
      setLoading(false);
    }
  }, []);

  const renderQuestion = (question: Question) => (
    <div key={question.identifier} className="p-4 border border-gray-200 rounded-md mb-4 bg-gray-50">
      <label className="block text-lg font-medium text-gray-800">
        {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description_text && (
        <p className="text-sm text-gray-500 mt-1">{question.description_text}</p>
      )}
      <div className="mt-2">
        <p className="text-xs text-gray-400 font-mono">Type: {question.type}</p>
        {question.options && question.options.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold text-gray-600">Options:</p>
            <ul className="list-disc list-inside pl-2">
              {question.options.map((opt, index) => (
                <li key={index} className="text-sm text-gray-700">{opt.label}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-black mb-2">Form Preview</h1>
            <p className="text-md text-gray-500">
              Viewing schema for slug: <span className="font-mono bg-gray-200 p-1 rounded">{slug || '...'}</span>
            </p>
        </div>

        {loading && <p className="text-blue-500 text-center">Loading form schema from API...</p>}
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}
        
        {formSchema && !loading && (
          <article>
            <header className="mb-6 pb-4 border-b border-gray-300">
                <h2 className="text-4xl font-bold text-gray-900">{formSchema.title}</h2>
                {formSchema.description && (
                    <p className="mt-2 text-lg text-gray-600">{formSchema.description}</p>
                )}
            </header>
            <div>
                {formSchema.questions.map(renderQuestion)}
            </div>
            <footer className="mt-6 pt-4 border-t border-gray-300">
                {formSchema.confirmation_message && (
                    <p className="text-sm text-gray-500 italic">
                        <strong>Confirmation Message:</strong> {formSchema.confirmation_message}
                    </p>
                )}
            </footer>
          </article>
        )}
      </div>
  );
};

export default SlugPage;