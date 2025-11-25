import React from 'react';

interface ColorPaletteProps {
  color: string;
  onColorChange: (color: string) => void;
}

const predefinedColors = [
  '#f5f5dc', // Beige
  '#FFFFFF', // White
  '#000000', // Black
  '#f0f0f0', // Light Grey
  '#a0a0a0', // Medium Grey
  '#e0bbe4', // Light Lavender
  '#957dad', // Medium Purple
  '#ffd3b5', // Light Peach
  '#ffaaa5', // Coral
  '#ff8b94', // Salmon
];

const ColorPalette: React.FC<ColorPaletteProps> = ({ color, onColorChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-300">Background Color</h3>
      <div className="flex items-center space-x-4 mb-3">
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-10 h-10 border-none rounded-md overflow-hidden cursor-pointer"
          title="Custom Color Picker"
        />
        <span className="text-gray-300 font-medium">{color.toUpperCase()}</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {predefinedColors.map((c) => (
          <button
            key={c}
            style={{ backgroundColor: c }}
            onClick={() => onColorChange(c)}
            className={`w-full h-8 rounded-md border-2 transition-all duration-150 ease-in-out
              ${color.toLowerCase() === c.toLowerCase() ? 'border-blue-500 scale-105' : 'border-gray-500 hover:scale-105'}`}
            title={c}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;