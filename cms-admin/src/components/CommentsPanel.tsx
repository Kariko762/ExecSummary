import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  contentId: string;
  contentType: string;
  author: string;
  text: string;
  timestamp: number;
  edited?: boolean;
  editedAt?: number;
}

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string | null;
  contentType: string | null;
  contentTitle?: string;
  onCommentChange?: () => void;
}

const API_URL = 'http://localhost:3001/api';

export default function CommentsPanel({ isOpen, onClose, contentId, contentType, contentTitle, onCommentChange }: CommentsPanelProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments when content changes
  useEffect(() => {
    if (contentId && contentType && isOpen) {
      fetchComments();
    }
  }, [contentId, contentType, isOpen]);

  const fetchComments = async () => {
    if (!contentId || !contentType) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/comments/${contentType}/${contentId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !contentId || !contentType) {
      console.log('Cannot add comment:', { newCommentText: newCommentText.trim(), contentId, contentType });
      return;
    }

    console.log('Adding comment...', { contentId, contentType, text: newCommentText.trim() });

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          author: user?.username || 'Anonymous',
          text: newCommentText.trim()
        })
      });

      console.log('Response:', response.status, response.ok);

      if (response.ok) {
        const newComment = await response.json();
        console.log('Comment added:', newComment);
        setNewCommentText('');
        fetchComments();
        onCommentChange?.();
      } else {
        const error = await response.text();
        console.error('Failed to add comment:', response.status, error);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText.trim() })
      });

      if (response.ok) {
        setEditingId(null);
        setEditText('');
        fetchComments();
        onCommentChange?.();
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeleteConfirmId(null);
        fetchComments();
        onCommentChange?.();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[450px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-fis-eggplant to-fis-raspberry">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-roobert-bold text-white">Comments</h2>
                    {contentTitle && (
                      <p className="text-xs text-white/80 truncate max-w-[280px]">{contentTitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {!contentId ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm">Select content to view comments</p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fis-eggplant"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs mt-1">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="glass rounded-lg p-4 hover:glass-strong transition-all"
                  >
                    {/* Comment Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatTimestamp(comment.timestamp)}
                          {comment.edited && ' (edited)'}
                        </span>
                      </div>
                      {comment.author === (user?.username || 'Anonymous') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditText(comment.text);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(comment.id)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment Body */}
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, () => handleEditComment(comment.id))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditText('');
                            }}
                            className="px-3 py-1 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-3 py-1 text-xs rounded-lg bg-fis-eggplant text-white hover:bg-fis-eggplant/80 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* New Comment Input */}
            {contentId && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, handleAddComment)}
                    placeholder="Add a comment... (Shift+Enter for new line)"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newCommentText.trim()}
                    className="self-end p-3 rounded-lg bg-fis-eggplant text-white hover:bg-fis-eggplant/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send comment (Enter)"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center"
                onClick={() => setDeleteConfirmId(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md mx-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-roobert-bold text-lg text-gray-900 dark:text-white mb-1">
                        Delete Comment?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This action cannot be undone. The comment will be permanently removed.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-roobert-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteComment(deleteConfirmId)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-roobert-medium"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
