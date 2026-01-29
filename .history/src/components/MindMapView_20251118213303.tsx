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
    <div className="px-6 py-4 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg">
      {data.label}
    </div>
  ),
  heading: ({ data }: { data: { label: string; level?: number } }) => (
    <div
      className={`px-4 py-3 rounded-lg shadow-md ${
        data.level === 2
          ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white font-semibold'
          : 'bg-linear-to-r from-green-500 to-emerald-500 text-white'
      }`}
    >
      {data.label}
    </div>
  ),
  topic: ({ data }: { data: { label: string } }) => (
    <div className="px-3 py-2 rounded-full bg-linear-to-r from-orange-400 to-red-400 text-white text-sm shadow-md">
      {data.label}
    </div>
  ),
};

export default function MindMapView({ summaryId }: Readonly<MindMapViewProps>) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchMindMap();
  }, [summaryId, fetchMindMap]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating mind map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-center">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No mind map data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            if (node.type === 'root') return '#a855f7';
            if (node.type === 'heading') return '#3b82f6';
            if (node.type === 'topic') return '#f97316';
            return '#6b7280';
          }}
          className="bg-white dark:bg-gray-800"
        />
        <Panel position="top-left" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-2">Legend:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Root</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Main Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Tags</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
