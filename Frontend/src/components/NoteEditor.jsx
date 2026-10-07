import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const NoteEditor = ({ value, onChange, placeholder = 'Write detailed notes, explanations, code snippets...' }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          [{ color: [] }, { background: [] }],
          ['link', 'clean'],
        ],
      },
    });

    quillRef.current = quill;

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    quill.on('text-change', () => {
      if (!isUpdatingRef.current) {
        const html = containerRef.current.querySelector('.ql-editor').innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);
      }
    });
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const editorHTML = containerRef.current.querySelector('.ql-editor').innerHTML;
      if (value !== editorHTML && value !== '<p><br></p>') {
        isUpdatingRef.current = true;
        quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden shadow-inner">
      <div ref={containerRef} className="min-h-[350px] text-slate-100" />
    </div>
  );
};

export default NoteEditor;