/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="@clerk/types" />
/// <reference types="@clerk/nextjs" />

declare module '@clerk/nextjs/server' {
  export function currentUser(): Promise<any>;
}

declare module '@heroicons/react/24/outline' {
  export const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ExclamationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ListBulletIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Cog6ToothIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  export const ArchiveBoxIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module 'react' {
  export type FC<P = {}> = React.FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P): React.ReactElement | null;
  }

  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useRef<T>(initialValue: T): { current: T };
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export type FormEvent<T = Element> = React.FormEvent<T>;
  export type ChangeEvent<T = Element> = React.ChangeEvent<T>;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
} 