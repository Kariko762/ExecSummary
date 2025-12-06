import React, { useMemo, useState } from 'react';
import { X, Building2, Users, Mail, Phone, ChevronRight, ChevronDown } from 'lucide-react';

interface OrgNode {
  id: string;
  parentId: string | null;
  name: string;
  title?: string;
  department?: string;
  productRole?: string;
}

interface NodeMetric {
  nodeId: string;
  headcount?: number;
  leader?: string;
  leaderTitle?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  keyPeople?: Array<{ name: string; title: string; email?: string }>;
  isRolledUp?: boolean;
}

interface OrgIQDetailPanelProps {
  nodeId: string | null;
  coreData: OrgNode[];
  overlayMetrics: NodeMetric[];
  onClose: () => void;
}

const OrgIQDetailPanel: React.FC<OrgIQDetailPanelProps> = ({
  nodeId,
  coreData,
  overlayMetrics,
  onClose,
}) => {
  // Get current node data
  const currentNode = useMemo(() => 
    coreData.find(n => n.id === nodeId),
    [coreData, nodeId]
  );

  const currentMetric = useMemo(() => 
    overlayMetrics.find(m => m.nodeId === nodeId),
    [overlayMetrics, nodeId]
  );

  // Get all descendant nodes
  const descendants = useMemo(() => {
    if (!nodeId) return [];
    
    const childrenMap = new Map<string, string[]>();
    coreData.forEach(node => {
      if (node.parentId) {
        if (!childrenMap.has(node.parentId)) {
          childrenMap.set(node.parentId, []);
        }
        childrenMap.get(node.parentId)!.push(node.id);
      }
    });

    const getAllDescendants = (id: string): string[] => {
      const children = childrenMap.get(id) || [];
      return children.concat(children.flatMap(getAllDescendants));
    };

    const descendantIds = getAllDescendants(nodeId);
    return coreData.filter(n => descendantIds.includes(n.id));
  }, [coreData, nodeId]);

  // Group people by product (including current node and descendants)
  const peopleByProduct = useMemo(() => {
    const products: Array<{
      productName: string;
      productId: string;
      leader: { name: string; title: string; email?: string; phone?: string } | null;
      teamMembers: Array<{ name: string; title: string; email?: string }>;
    }> = [];

    // Add current node
    if (currentNode && currentMetric) {
      products.push({
        productName: currentNode.name,
        productId: currentNode.id,
        leader: currentMetric.leader ? {
          name: currentMetric.leader,
          title: currentMetric.leaderTitle || 'Leader',
          email: currentMetric.leaderEmail,
          phone: currentMetric.leaderPhone
        } : null,
        teamMembers: currentMetric.keyPeople || []
      });
    }

    // Add descendants
    descendants.forEach(descNode => {
      const metric = overlayMetrics.find(m => m.nodeId === descNode.id);
      if (metric && (metric.leader || (metric.keyPeople && metric.keyPeople.length > 0))) {
        products.push({
          productName: descNode.name,
          productId: descNode.id,
          leader: metric.leader ? {
            name: metric.leader,
            title: metric.leaderTitle || 'Leader',
            email: metric.leaderEmail,
            phone: metric.leaderPhone
          } : null,
          teamMembers: metric.keyPeople || []
        });
      }
    });

    return products;
  }, [currentNode, currentMetric, descendants, overlayMetrics]);

  // Track which product sections are expanded
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set(peopleByProduct.map(p => p.productId)));

  // Toggle product expansion
  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  if (!nodeId || !currentNode) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-50 animate-slide-in-right overflow-y-auto border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white p-6 shadow-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start space-x-3">
          <Building2 className="w-8 h-8 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-1">{currentNode.name}</h2>
            <p className="text-white/80 text-sm">{currentNode.productRole || currentNode.title || 'Product'}</p>
            {currentNode.department && (
              <p className="text-white/60 text-xs mt-1">{currentNode.department}</p>
            )}
          </div>
        </div>

        {/* Aggregate Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-white/80 text-xs mb-1">Total Team</div>
            <div className="text-2xl font-bold">{currentMetric?.headcount || 0}</div>
            {currentMetric?.isRolledUp && (
              <div className="text-white/60 text-xs mt-1">Includes sub-products</div>
            )}
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-white/80 text-xs mb-1">Products</div>
            <div className="text-2xl font-bold">1 + {descendants.length}</div>
            <div className="text-white/60 text-xs mt-1">
              {descendants.length} sub-product{descendants.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {peopleByProduct.length > 0 ? (
          peopleByProduct.map((product) => {
            const isExpanded = expandedProducts.has(product.productId);
            const totalPeople = (product.leader ? 1 : 0) + product.teamMembers.length;

            return (
              <div key={product.productId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Product Header - Collapsible */}
                <button
                  onClick={() => toggleProduct(product.productId)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-fis-gray to-fis-gray/50 dark:from-fis-eggplant/20 dark:to-fis-raspberry/20 hover:from-fis-gray/80 hover:to-fis-gray/60 dark:hover:from-fis-eggplant/30 dark:hover:to-fis-raspberry/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{product.productName}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
                        {product.leader && ' • Manager assigned'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Product Table - Expandable */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Manager/Leader Row (if exists) */}
                        {product.leader && (
                          <tr className="bg-fis-gray/50 dark:bg-fis-eggplant/10">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-fis-eggplant text-white dark:bg-fis-raspberry dark:text-white">
                                  MANAGER
                                </span>
                                {product.leader.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {product.leader.title}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {product.leader.email ? (
                                <a
                                  href={`mailto:${product.leader.email}`}
                                  className="text-fis-eggplant dark:text-fis-raspberry hover:underline"
                                >
                                  {product.leader.email}
                                </a>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600">—</span>
                              )}
                            </td>
                          </tr>
                        )}

                        {/* Team Members */}
                        {product.teamMembers.map((member, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {member.title}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {member.email ? (
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-fis-eggplant dark:text-fis-raspberry hover:underline"
                                >
                                  {member.email}
                                </a>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600">—</span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {/* No team members */}
                        {!product.leader && product.teamMembers.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                              No team members assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No team data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgIQDetailPanel;
