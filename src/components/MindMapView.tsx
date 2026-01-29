'use client';

import { useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface MindMapViewProps {
  summaryId: string;
}

const nodeTypes = {
  root: ({ data }: { data: { label: string } }) => (
    <div className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/30 border-2 border-white/20">
      {data.label}
    </div>
  ),
  heading: ({ data }: { data: { label: string; level?: number } }) => (
    <div
      className={`px-4 py-3 rounded-lg shadow-lg border-2 ${
        data.level === 2
          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold border-white/20 shadow-teal-500/30'
          : 'bg-gradient-to-r from-emerald-400 to-green-500 text-white font-medium border-white/20 shadow-emerald-500/30'
      }`}
    >
      {data.label}
    </div>
  ),
  topic: ({ data }: { data: { label: string } }) => (
    <div className="px-3 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm shadow-lg shadow-amber-500/30 border-2 border-white/20 font-medium">
      {data.label}
    </div>
  ),
};

export default function MindMapView({ summaryId }: Readonly<MindMapViewProps>) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMindMap = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/mindmap?summaryId=${summaryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch mind map');
        }

        const data = await response.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mind map');
        console.error('Error fetching mind map:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMindMap();
  }, [summaryId, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Generating mind map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 rounded-xl border-2 border-red-200 dark:border-red-800 flex items-center justify-center backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400 font-medium">No mind map data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-xl border-2 border-emerald-200/50 dark:border-emerald-800/50 overflow-hidden shadow-xl backdrop-blur-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'root') return '#10b981';
            if (node.type === 'heading') return '#14b8a6';
            if (node.type === 'topic') return '#f59e0b';
            return '#64748b';
          }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg"
        />
        <Panel position="top-left" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-emerald-200/50 dark:border-emerald-800/50 p-4">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-bold mb-3 text-base flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Legend
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm"></div>
                <span className="font-medium">Root</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 shadow-sm"></div>
                <span className="font-medium">Main Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-sm"></div>
                <span className="font-medium">Tags</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
