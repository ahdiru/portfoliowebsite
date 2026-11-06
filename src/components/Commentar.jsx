import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MessageCircle, UserCircle2, Loader2, AlertCircle, Send, ImagePlus, X, Pin } from 'lucide-react';
import AOS from "aos";
import "aos/dist/aos.css";
import { supabase } from '../supabase';

const Comment = memo(({ comment, formatDate, isPinned = false }) => (
    <div 
        className={`px-4 pt-4 pb-3 rounded-xl border transition-all ${
            isPinned 
                ? 'bg-[#EDE7DA] border-[#C8B48A] shadow-xs' 
                : 'bg-[#F5F0E6] border-[#D8CFBE] hover:border-[#7F8C6A]'
        }`}
    >
        {isPinned && (
            <div className="flex items-center gap-1.5 mb-2 text-[#1E3B2F]">
                <Pin className="w-3.5 h-3.5 text-[#7F8C6A]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Pinned Comment</span>
            </div>
        )}
        <div className="flex items-start gap-3">
            {comment.profile_image ? (
                <img
                    src={comment.profile_image}
                    alt={`${comment.user_name}'s profile`}
                    className="w-10 h-10 rounded-full object-cover border border-[#D8CFBE] flex-shrink-0"
                    loading="lazy"
                />
            ) : (
                <div className="p-2 rounded-full bg-[#EDE7DA] text-[#1E3B2F]">
                    <UserCircle2 className="w-5 h-5 text-[#1E3B2F]" />
                </div>
            )}
            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-[#1E3B2F] truncate">
                            {comment.user_name}
                        </h4>
                        {isPinned && (
                            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#1E3B2F] text-[#F5F0E6] rounded-full">
                                Admin
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] font-mono text-[#5A6650] whitespace-nowrap">
                        {formatDate(comment.created_at)}
                    </span>
                </div>
                <p className="text-[#1E3B2F] text-sm break-words leading-relaxed font-normal">
                    {comment.content}
                </p>
            </div>
        </div>
    </div>
));

const CommentForm = memo(({ onSubmit, isSubmitting }) => {
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB.');
                if (e.target) e.target.value = '';
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                if (e.target) e.target.value = '';
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleTextareaChange = useCallback((e) => {
        setNewComment(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!newComment.trim() || !userName.trim()) return;
        
        onSubmit({ newComment, userName, imageFile });
        setNewComment('');
        setUserName('');
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }, [newComment, userName, imageFile, onSubmit]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <label className="block text-xs font-mono font-medium text-[#1E3B2F]">
                    Name <span className="text-[#B4442E]">*</span>
                </label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={25}
                    placeholder="Your name"
                    className="w-full p-3 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-[#1E3B2F] placeholder-[#5A6650]/60 focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all text-sm"
                    required
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-mono font-medium text-[#1E3B2F]">
                    Message <span className="text-[#B4442E]">*</span>
                </label>
                <textarea
                    ref={textareaRef}
                    value={newComment}
                    maxLength={300}
                    onChange={handleTextareaChange}
                    placeholder="Write a message or feedback..."
                    className="w-full p-3 rounded-xl bg-[#F5F0E6] border border-[#D8CFBE] text-[#1E3B2F] placeholder-[#5A6650]/60 focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-all resize-none min-h-[90px] text-sm"
                    required
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-mono font-medium text-[#5A6650]">
                    Profile Photo (optional)
                </label>
                <div className="flex items-center gap-3 p-3 bg-[#F5F0E6] border border-[#D8CFBE] rounded-xl">
                    {imagePreview ? (
                        <div className="flex items-center gap-3">
                            <img
                                src={imagePreview}
                                alt="Profile preview"
                                className="w-12 h-12 rounded-full object-cover border border-[#D8CFBE]"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDE7DA] text-[#B4442E] hover:bg-[#B4442E] hover:text-white transition-all text-xs font-mono"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Remove</span>
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#EDE7DA] text-[#1E3B2F] hover:bg-[#D8CFBE] transition-all border border-dashed border-[#D8CFBE] text-xs font-mono"
                            >
                                <ImagePlus className="w-4 h-4 text-[#7F8C6A]" />
                                <span>Attach Photo (Max 5MB)</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1E3B2F] text-[#F5F0E6] hover:bg-[#2A5241] rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Posting...</span>
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 text-[#C8B48A]" />
                        <span>Post Comment</span>
                    </>
                )}
            </button>
        </form>
    );
});

const Komentar = () => {
    const [comments, setComments] = useState([]);
    const [pinnedComment, setPinnedComment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        AOS.init({ once: false, duration: 800 });
    }, []);

    useEffect(() => {
        const fetchPinnedComment = async () => {
            try {
                const { data, error } = await supabase
                    .from('portfolio_comments')
                    .select('*')
                    .eq('is_pinned', true)
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching pinned comment:', error);
                    return;
                }
                if (data) {
                    setPinnedComment(data);
                }
            } catch (err) {
                console.error('Error fetching pinned comment:', err);
            }
        };

        fetchPinnedComment();
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase
                .from('portfolio_comments')
                .select('*')
                .eq('is_pinned', false)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Error fetching comments:', error);
                return;
            }
            setComments(data || []);
        };

        fetchComments();

        const subscription = supabase
            .channel('portfolio_comments')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'portfolio_comments', filter: 'is_pinned=eq.false' }, 
                () => { fetchComments(); }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const uploadImage = useCallback(async (imageFile) => {
        if (!imageFile) return null;
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }, []);

    const handleCommentSubmit = useCallback(async ({ newComment, userName, imageFile }) => {
        setError('');
        setIsSubmitting(true);
        
        try {
            const profileImageUrl = await uploadImage(imageFile);
            const { error } = await supabase
                .from('portfolio_comments')
                .insert([
                    {
                        content: newComment,
                        user_name: userName,
                        profile_image: profileImageUrl,
                        is_pinned: false,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
        } catch (err) {
            setError('Failed to post comment. Please try again.');
            console.error('Error adding comment: ', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [uploadImage]);

    const formatDate = useCallback((timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }, []);

    const totalComments = comments.length + (pinnedComment ? 1 : 0);

    return (
        <div className="w-full bg-[#FFFFFF] border border-[#D8CFBE] rounded-2xl shadow-xs">
            <div className="p-6 border-b border-[#D8CFBE]">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#EDE7DA] text-[#1E3B2F]">
                        <MessageCircle className="w-5 h-5 text-[#1E3B2F]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1E3B2F] font-mono">
                        Guestbook & Comments <span className="text-[#7F8C6A]">({totalComments})</span>
                    </h3>
                </div>
            </div>
            <div className="p-6 space-y-6">
                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-[#B4442E] bg-[#EDE7DA] border border-[#B4442E]/30 rounded-xl">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                
                <div>
                    <CommentForm onSubmit={handleCommentSubmit} isSubmitting={isSubmitting} />
                </div>

                <div className="space-y-3 h-[320px] overflow-y-auto overflow-x-hidden custom-scrollbar pt-1 pr-1">
                    {pinnedComment && (
                        <div>
                            <Comment 
                                comment={pinnedComment} 
                                formatDate={formatDate}
                                isPinned={true}
                            />
                        </div>
                    )}
                    
                    {comments.length === 0 && !pinnedComment ? (
                        <div className="text-center py-8">
                            <UserCircle2 className="w-10 h-10 text-[#7F8C6A] mx-auto mb-2 opacity-50" />
                            <p className="text-[#5A6650] text-sm">No comments yet. Start the conversation!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <Comment 
                                key={comment.id} 
                                comment={comment} 
                                formatDate={formatDate}
                                isPinned={false}
                            />
                        ))
                    )}
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #D8CFBE;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #7F8C6A;
                }
            `}</style>
        </div>
    );
};

export default Komentar;
