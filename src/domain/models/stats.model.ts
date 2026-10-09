export interface StatItem {
  id: string;
  title: string;
  value: string;
  note: string;
  isDemo: boolean;
  icon: string;
}

export interface ModuleInfo {
  id: string;
  path: string;
  title: string;
  icon: string;
  description: string;
  actionText: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarInitial: string;
  event: string;
}
