import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/RealAuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TrophyIcon,
  FireIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  iconSolid: React.ElementType;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
    description: 'Overview and quick actions',
  },
  {
    name: 'Roster',
    href: '/roster',
    icon: UserGroupIcon,
    iconSolid: UserGroupIconSolid,
    description: 'Manage your Pokemon teams',
  },
  {
    name: 'Shop',
    href: '/shop',
    icon: ShoppingBagIcon,
    iconSolid: ShoppingBagIconSolid,
    description: 'Buy Pokemon packs and items',
  },
  {
    name: 'Team Builder',
    href: '/team-builder',
    icon: UserGroupIcon,
    iconSolid: UserGroupIconSolid,
    description: 'Form tactical teams for battle',
  },
  {
    name: 'Battle',
    href: '/battle',
    icon: TrophyIcon,
    iconSolid: TrophyIconSolid,
    description: 'Combat Pokemon simulation',
  },
  {
    name: 'Arena',
    href: '/arena',
    icon: TrophyIcon,
    iconSolid: TrophyIconSolid,
    description: 'PvP battles and rankings',
  },
  {
    name: 'Tournaments',
    href: '/tournaments',
    icon: ArrowPathIcon,
    iconSolid: ArrowPathIcon,
    description: 'Competitive tournaments',
  },
  {
    name: 'Survival',
    href: '/survival',
    icon: FireIcon,
    iconSolid: FireIconSolid,
    description: 'Endless wave challenges',
  },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-800 to-purple-900 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-6">
        <div className="flex items-center w-full">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">⚡</span>
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-bold leading-tight">
              Pokemon
            </h1>
            <p className="text-indigo-200 text-sm">
              Tactics Arena
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 mb-6">
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.email?.split('@')[0] || 'Trainer'}
              </p>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-yellow-300">
                  {'1,000'} ₽
                </span>
                <span className="text-purple-300">
                  {'50'} 💎
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={clsx(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                )}
              />
              <div className="flex-1">
                <span>{item.name}</span>
                {!isActive && (
                  <p className="text-xs text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </p>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-white/10">
        <NavLink
          to="/settings"
          className="group flex items-center px-3 py-2 text-sm font-medium text-indigo-200 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
        >
          <Cog6ToothIcon className="mr-3 h-5 w-5 text-indigo-300 group-hover:text-white" />
          Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;