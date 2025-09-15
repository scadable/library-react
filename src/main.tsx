import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { HelloWorld } from './components/HelloWorld';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <HelloWorld />
        </React.StrictMode>
    );
}
