"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Task } from "@/lib/types";
import { fetchTasks } from "@/lib/api";
import { computeLayout } from "@/lib/graph-layout";
import TaskNode from "./TaskNode";

const nodeTypes = { taskNode: TaskNode };

interface DependencyGraphProps {
  workspaceId: string;
  selectedTaskId: string | null;
  onSelectTask: (id: string | null) => void;
}

export default function DependencyGraph({
  workspaceId,
  selectedTaskId,
  onSelectTask,
}: DependencyGraphProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    setLoading(true);
    fetchTasks(workspaceId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    if (tasks.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const layout = computeLayout(tasks);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [tasks, setNodes, setEdges]);

  // Sync selection from table
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === selectedTaskId,
      }))
    );
  }, [selectedTaskId, setNodes]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelectTask(node.id === selectedTaskId ? null : node.id);
    },
    [onSelectTask, selectedTaskId]
  );

  const miniMapNodeColor = useMemo(
    () => (node: { data: Record<string, unknown> }) => {
      const status = (node.data as unknown as Task).status;
      if (status === "completed") return "#4ade80";
      if (status === "in_progress") return "#60a5fa";
      return "#fbbf24";
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Loading graph...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        No tasks to visualize
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={3}
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(0,0,0,0.1)"
          className="!bg-zinc-100 dark:!bg-zinc-800"
        />
      </ReactFlow>
    </div>
  );
}
