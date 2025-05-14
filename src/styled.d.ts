// src/styled.d.ts
import 'styled-components';
import { AppTheme } from './styles/theme'; // Import your theme type

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends AppTheme {}
}
