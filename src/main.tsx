import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { studyTaskRepository } from './services/taskRepository';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('The study dashboard root element is missing.');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <TaskProvider storage={studyTaskRepository}>
        <App />
      </TaskProvider>
    </ThemeProvider>
  </StrictMode>,
);
