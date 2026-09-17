'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

type Phase = 'idle' | 'tag' | 'mistake' | 'retag' | 'done';

const phases: { key: Phase; label: string; command?: string }[] = [
  { key: 'idle', label: '准备发版' },
  { key: 'tag', label: '打上标签', command: 'git tag v1.0.0' },
  { key: 'mistake', label: '发现版本号错了' },
  { key: 'retag', label: '删除重打', command: 'git tag -d v1.0.0 && git tag v1.1.0' },
  { key: 'done', label: '推送发版', command: 'git push origin v1.1.0' },
];

const descs: Record<Phase, string> = {
  idle: 'hotfix 提交 H 已经合入 main，发布前要给当前提交钉上版本门牌。',
  tag: 'git tag v1.0.0 把标签钉在当前提交上。分支会随新提交移动，标签钉住不动——这是 tag 和 branch 最本质的区别。',
  mistake: '版本号已经更新到 1.1.0，刚才却打成了 v1.0.0。标签不是不可撤销的：删掉重打就好。',
  retag: 'git tag -d 删掉错标签，再重新 git tag v1.1.0 钉在同一个提交上。标签始终指向它打上去的那个提交。',
  done: 'git push origin v1.1.0 把标签单独推到远程——git push 不会自动上传标签，发版时要记得单独推。',
};

export default function TagAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');

  const phaseIndex = phases.findIndex((item) => item.key === phase);
  const nextPhase = () => {
    const idx = phases.findIndex((item) => item.key === phase);
    if (idx < phases.length - 1) setPhase(phases[idx + 1].key);
  };
  const reset = () => setPhase('idle');

  const nodes: Node[] = [
    { id: 'A', label: 'A', x: 60, y: 100, color: '#3b82f6' },
    { id: 'B', label: 'B', x: 150, y: 100, color: '#3b82f6' },
    { id: 'H', label: 'H', x: 240, y: 100, color: '#ef4444' },
  ];

  const showTag = phase !== 'idle';
  const isMistake = phase === 'mistake';
  const tagText = phase === 'retag' || phase === 'done' ? 'v1.1.0' : 'v1.0.0';

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        给发布提交钉上版本标签
      </h3>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        打标签、发现版本号错了、删除重打、推送发版——顺着看一遍 tag 的完整生命周期。
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {phases.map((item, i) => (
          <button
            key={item.key}
            onClick={() => setPhase(item.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              phase === item.key
                ? 'bg-primary-500 text-white'
                : i <= phaseIndex
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300"
        >
          <span className="font-medium text-primary-600 dark:text-primary-400">
            [{phaseIndex + 1}/{phases.length}]
          </span>{' '}
          {descs[phase]}
          {phases[phaseIndex].command && (
            <code className="mt-2 block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {phases[phaseIndex].command}
            </code>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="relative h-52 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900">
        <svg className="absolute inset-0 h-full w-full">
          <motion.line
            x1={nodes[0].x}
            y1={nodes[0].y}
            x2={nodes[1].x}
            y2={nodes[1].y}
            stroke="#3b82f6"
            strokeWidth="3"
          />
          <motion.line
            x1={nodes[1].x}
            y1={nodes[1].y}
            x2={nodes[2].x}
            y2={nodes[2].y}
            stroke="#3b82f6"
            strokeWidth="3"
          />
          {showTag && (
            <motion.line
              x1={nodes[2].x}
              y1={nodes[2].y + 20}
              x2={nodes[2].x}
              y2={nodes[2].y + 42}
              stroke={isMistake ? '#f59e0b' : '#8b5cf6'}
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}
        </svg>

        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 250, delay: i * 0.06 }}
            className="absolute flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
            style={{ left: node.x - 20, top: node.y - 20, backgroundColor: node.color }}
          >
            {node.label}
          </motion.div>
        ))}

        <AnimatePresence>
          {showTag && (
            <motion.div
              key={`${phase}-${tagText}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className={`absolute rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-md ${
                isMistake ? 'bg-amber-500' : 'bg-primary-500'
              }`}
              style={{ left: nodes[2].x - 30, top: nodes[2].y + 44 }}
            >
              {isMistake ? '⚠ ' : ''}
              {tagText}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute left-2 top-2 text-xs font-medium text-blue-500">main</div>
        {phase === 'done' && (
          <div className="absolute right-2 top-2 text-xs font-medium text-primary-500">
            v1.1.0 已推送到远程 ✓
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        {phase !== 'done' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextPhase}
            className="rounded-lg bg-primary-500 px-5 py-2 font-semibold text-white transition-colors hover:bg-primary-600"
          >
            下一步 →
          </motion.button>
        )}
        {phase === 'done' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="rounded-lg bg-gray-200 px-5 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            重置
          </motion.button>
        )}
      </div>
    </div>
  );
}
