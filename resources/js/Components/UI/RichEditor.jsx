import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import {
    Bold, Italic, List, ListOrdered, Heading2, Heading3,
    Link as LinkIcon, Image as ImageIcon, Code, Quote,
    RotateCcw, RotateCw, Minus,
} from 'lucide-react';
import { useCallback } from 'react';

function ToolbarButton({ onClick, active, title, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded transition-colors ${
                active
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {children}
        </button>
    );
}

export default function RichEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Write article content here...' }),
            Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg' } }),
            Link.configure({ openOnClick: false }),
            CharacterCount,
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-4 py-3',
            },
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('URL:');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('Image URL:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <Bold size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <Italic size={14} />
                </ToolbarButton>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <Heading2 size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    <Heading3 size={14} />
                </ToolbarButton>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                    <List size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
                    <ListOrdered size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                    <Quote size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
                    <Code size={14} />
                </ToolbarButton>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Add link">
                    <LinkIcon size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={addImage} title="Add image">
                    <ImageIcon size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                    <Minus size={14} />
                </ToolbarButton>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <RotateCcw size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <RotateCw size={14} />
                </ToolbarButton>

                <span className="ml-auto text-xs text-gray-400">
                    {editor.storage.characterCount.words()} words
                </span>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
