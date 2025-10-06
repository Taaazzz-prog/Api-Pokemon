declare module '@heroicons/react/24/outline' {
  import { ComponentType, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
    titleId?: string;
  }
  
  export const PauseIcon: ComponentType<IconProps>;
  export const PlayIcon: ComponentType<IconProps>;
  export const StopIcon: ComponentType<IconProps>;
  export const UsersIcon: ComponentType<IconProps>;
  export const CalendarIcon: ComponentType<IconProps>;
  export const ClockIcon: ComponentType<IconProps>;
  export const GiftIcon: ComponentType<IconProps>;
  export const TrophyIcon: ComponentType<IconProps>;
  export const StarIcon: ComponentType<IconProps>;
  export const EyeSlashIcon: ComponentType<IconProps>;
  export const EyeIcon: ComponentType<IconProps>;
  export const UserIcon: ComponentType<IconProps>;
  export const EnvelopeIcon: ComponentType<IconProps>;
}

declare module '@heroicons/react/24/solid' {
  import { ComponentType, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
    titleId?: string;
  }
  
  export const StarIcon: ComponentType<IconProps>;
  export const TrophyIcon: ComponentType<IconProps>;
}