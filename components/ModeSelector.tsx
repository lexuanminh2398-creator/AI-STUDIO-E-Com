import React from 'react';
import { Mode } from '../types';

interface ModeSelectorProps {
  selectedMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  const modes = [
    { value: Mode.Model, label: 'Model Background' },
    { value: Mode.Flatlay, label: 'Flatlay Background' },
    { value: Mode.TryOn, label: 'Virtual Try-On' },
    { value: Mode.AIEdit, label: 'AI Edit' },
    { value: Mode.Render3D, label: '3D Render' },
    { value: Mode.ConvertToWebP, label: 'Convert to WebP' },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-300">Select Mode</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onModeChange(mode.value)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
              ${selectedMode === mode.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;