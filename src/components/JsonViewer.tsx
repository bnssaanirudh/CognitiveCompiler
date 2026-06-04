"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function JsonViewer({ data }: { data: any }) {
  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      theme="vs-dark"
      value={JSON.stringify(data, null, 2)}
      options={{ 
        readOnly: true, 
        minimap: { enabled: false }, 
        fontSize: 13,
        scrollBeyondLastLine: false,
        padding: { top: 16 }
      }}
    />
  );
}
