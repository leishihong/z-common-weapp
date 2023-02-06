import { ReactNode } from 'react';

export interface NavigationBarProps {
  title?: String;
  renderCenter?: ReactNode;
  renderLeft?: ReactNode;
  renderRight?: ReactNode;
  back?: boolean;
  home?: boolean;
  color?: string;
  background?: string;
  backgroundColorTop?: string;
  searchBar?: boolean;
  searchText?: string;
  iconTheme?: 'white' | 'black';
  extClass?: string;
  delta?: number;
  loading?: false;
  animated?: boolean;
  isImmersive?: boolean;
  logo?: boolean;
  zIndex?: string;
  onBack?: () => void;
  onHome?: () => void;
  onSearch?: () => void;
  onGoTop?: () => void;
}
