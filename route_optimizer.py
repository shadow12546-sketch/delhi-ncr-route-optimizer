from collections import defaultdict
import heapq

class Graph:
    def __init__(self):
        self.graph = defaultdict(list)

    def add_edge(self, u, v, time):
        self.graph[u].append((v, time))
        self.graph[v].append((u, time))


def dijkstra(graph, risk, source, dest, penalty=20):
    pq = [(0, source)]
    dist = {node: float('inf') for node in graph.graph}
    parent = {}

    dist[source] = 0

    while pq:
        curr_cost, node = heapq.heappop(pq)

        for neighbor, time in graph.graph[node]:
            risk_val = risk.get(neighbor, 0.2)
            new_cost = curr_cost + time + (risk_val * penalty)

            if new_cost < dist.get(neighbor, float('inf')):
                dist[neighbor] = new_cost
                parent[neighbor] = node
                heapq.heappush(pq, (new_cost, neighbor))

    path = []
    node = dest

    if node not in parent and node != source:
        return [], float('inf')

    while node in parent:
        path.append(node)
        node = parent[node]

    path.append(source)
    path.reverse()

    return path, dist[dest]


def compare_routes(graph, risk, source, dest, penalty):
    normal_path, normal_cost = dijkstra(graph, {}, source, dest, 0)
    opt_path, opt_cost = dijkstra(graph, risk, source, dest, penalty)

    return {
        "normal_path": normal_path,
        "optimized_path": opt_path,
        "normal_cost": normal_cost,
        "optimized_cost": opt_cost
    }


def calculate_total_risk(route, risk):
    return sum([risk.get(node, 0.2) for node in route])


def predict_delay(route, risk):
    delay = 0
    for node in route:
        r = risk.get(node, 0.2)
        delay += int((r ** 2) * 15)
    return delay