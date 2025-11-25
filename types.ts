export enum Mode {
  Model = 'model',
  Flatlay = 'flatlay',
  TryOn = 'tryOn',
  AIEdit = 'aiEdit',
  Render3D = 'render3D',
  ConvertToWebP = 'convertToWebP',
}

export interface ImageFile {
  name: string;
  dataURL: string;
  mimeType: string;
}
