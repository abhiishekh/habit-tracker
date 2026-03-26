"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trees, Leaf, Wind } from 'lucide-react';

interface TreeData {
  id: string;
  x: number;
  y: number;
  scale: number;
  health: 'healthy' | 'weak';
  createdAt: number;
}

interface FlyingLeaf {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
}

export const ForestView = ({ tasks = [] }: { tasks?: any[] }) => {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [flyingLeaves, setFlyingLeaves] = useState<FlyingLeaf[]>([]);
  const forestRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tasks) return;
    
    const completedTasks = tasks.filter(t => t.completed).slice(-50);
    const generatedTrees = completedTasks.map((t) => {
      let hash = 0;
      for (let i = 0; i < t.id.length; i++) hash = Math.imul(31, hash) + t.id.charCodeAt(i) | 0;
      const idSeed = Math.abs(hash);
      
      return {
        id: t.id,
        x: (idSeed % 80) + 10,
        y: ((idSeed * 13) % 60) + 20,
        scale: ((idSeed * 7) % 50) / 100 + 0.8,
        health: 'healthy',
        createdAt: new Date(t.completedAt || t.createdAt).getTime(),
      } as TreeData;
    });
    
    setTrees(generatedTrees);
  }, [tasks]);

  useEffect(() => {
    const handleLeafFly = (e: any) => {
      const { startX, startY, isOnTime } = e.detail;
      
      if (!forestRef.current) return;
      const forestRect = forestRef.current.getBoundingClientRect();
      
      const leafId = Math.random().toString(36).substr(2, 9);
      const targetX = Math.random() * 80 + 10;
      const targetY = Math.random() * 60 + 20;

      const newLeaf: FlyingLeaf = {
        id: leafId,
        startX: startX,
        startY: startY,
        targetX: forestRect.left + (targetX / 100) * forestRect.width,
        targetY: forestRect.top + (targetY / 100) * forestRect.height,
        color: isOnTime ? '#10b981' : '#b45309',
      };

      setFlyingLeaves(prev => [...prev, newLeaf]);

      // Animation only, the tree is added via tasks array update
      setTimeout(() => {
        setFlyingLeaves(prev => prev.filter(l => l.id !== leafId));
      }, 1000); // Duration of leaf animation
    };

    window.addEventListener('todo:leaf-fly', handleLeafFly);
    return () => window.removeEventListener('todo:leaf-fly', handleLeafFly);
  }, []);

  return (
    <div className="relative w-full overflow-hidden ">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Trees size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Your Progress Forest</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Every completion grows your legacy.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
             <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Trees</span>
                <span className="text-xl font-black text-emerald-500">{trees.length}</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-100 dark:bg-zinc-800" />
             <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Health</span>
                <span className="text-xl font-black text-indigo-500">
                  {trees.length > 0 
                    ? Math.round((trees.filter(t => t.health === 'healthy').length / trees.length) * 100) 
                    : 0}%
                </span>
             </div>
          </div>
        </div>

        <div 
          ref={forestRef}
          className="relative aspect-[21/9] w-full rounded-xl lg:rounded-2xl bg-gradient-to-b from-sky-50 to-emerald-50/50 dark:from-zinc-950 dark:to-emerald-950/20 border-2 border-slate-200 dark:border-zinc-800 shadow-inner overflow-hidden"
        >
          {/* Environment details */}
          {/* <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10"><Wind className="animate-bounce" size={40} /></div>
            <div className="absolute bottom-20 right-20"><Wind className="animate-pulse" size={30} /></div>
          </div> */}

          <div className="absolute bottom-0 w-full h-1/4 bg-emerald-600/10 dark:bg-emerald-500/5 blur-3xl rounded-full" />

          {/* Trees */}
          <AnimatePresence>
            {trees.map((tree) => (
              <motion.div
                key={tree.id}
                initial={{ scale: 0, y: 20, opacity: 0 }}
                animate={{ scale: tree.scale, y: 0, opacity: 1 }}
                style={{ 
                  left: `${tree.x}%`, 
                  top: `${tree.y}%`,
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)'
                }}
                className="cursor-help"
              >
                <div className="relative group">
                  <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {tree.health === 'healthy' ? (
                      <>
                        <path d="M20 5L35 30H25L38 50H2L15 50L5 30H15L20 5Z" fill="#10B981" />
                        <path d="M18 50H22V60H18V50Z" fill="#78350F" />
                      </>
                    ) : (
                      <>
                        <path d="M20 5L35 30H25L38 50H2L15 50L5 30H15L20 5Z" fill="#B45309" opacity="0.6" />
                        <path d="M18 50H22V60H18V50Z" fill="#451A03" />
                        <path d="M12 25L8 28" stroke="#451A03" strokeWidth="2" />
                        <path d="M28 35L32 32" stroke="#451A03" strokeWidth="2" />
                      </>
                    )}
                  </svg>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {tree.health === 'healthy' ? 'Lush Victory' : 'Time-lost Wither'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Flying Leaves */}
          <AnimatePresence>
            {flyingLeaves.map((leaf) => (
              <motion.div
                key={leaf.id}
                initial={{ 
                  x: leaf.startX - (forestRef.current?.getBoundingClientRect().left || 0), 
                  y: leaf.startY - (forestRef.current?.getBoundingClientRect().top || 0),
                  scale: 0.5,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  x: leaf.targetX - (forestRef.current?.getBoundingClientRect().left || 0), 
                  y: leaf.targetY - (forestRef.current?.getBoundingClientRect().top || 0),
                  scale: 1,
                  rotate: 360,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ position: 'absolute' }}
                className="z-[100]"
              >
                <Leaf size={24} fill={leaf.color} color={leaf.color} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
