import dagre from "@dagrejs/dagre";
import type { Task } from "./types";
import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 70;

export function computeLayout(tasks: Task[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 80 });

  for (const task of tasks) {
    g.setNode(task.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  const edges: Edge[] = [];
  for (const task of tasks) {
    for (const blockedId of task.blocks) {
      const edgeId = `e-${task.id}-${blockedId}`;
      g.setEdge(task.id, blockedId);
      edges.push({
        id: edgeId,
        source: task.id,
        target: blockedId,
        animated: true,
      });
    }
    for (const blockerId of task.blockedBy) {
      const edgeId = `e-${blockerId}-${task.id}`;
      if (!edges.find((e) => e.id === edgeId)) {
        g.setEdge(blockerId, task.id);
        edges.push({
          id: edgeId,
          source: blockerId,
          target: task.id,
          animated: true,
        });
      }
    }
  }

  dagre.layout(g);

  const nodes: Node[] = tasks.map((task) => {
    const pos = g.node(task.id);
    return {
      id: task.id,
      type: "taskNode",
      position: {
        x: (pos?.x ?? 0) - NODE_WIDTH / 2,
        y: (pos?.y ?? 0) - NODE_HEIGHT / 2,
      },
      data: task as unknown as Record<string, unknown>,
    };
  });

  return { nodes, edges };
}
