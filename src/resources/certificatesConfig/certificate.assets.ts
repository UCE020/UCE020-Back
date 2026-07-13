import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.join(__dirname, 'assets');

const logoAssinaeBuffer = fs.readFileSync(path.join(ASSETS_DIR, 'logo-assinae.png'));
const logoUefsBuffer    = fs.readFileSync(path.join(ASSETS_DIR, 'logo-uefs.png'));

export const LOGO_ASSINAE_SRC = { data: logoAssinaeBuffer, format: 'png' } as const;
export const LOGO_UEFS_SRC    = { data: logoUefsBuffer,    format: 'png' } as const;