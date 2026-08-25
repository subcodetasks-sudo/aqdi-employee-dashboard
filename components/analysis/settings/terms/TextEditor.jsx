'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useState } from 'react';

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        size =>
          ({ chain }) =>
            chain().setMark('textStyle', { fontSize: size }).run(),

      unsetFontSize:
        () =>
          ({ chain }) =>
            chain().setMark('textStyle', { fontSize: null }).run(),
    };
  },
});

const ToolbarButton = ({ onClick, isActive, disabled, title, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`min-w-[36px] h-9 px-2 rounded text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-main text-white' : 'hover:bg-gray-200 text-gray-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-8 bg-gray-300 mx-1" />;

function Toolbar({ editor }) {
  const [color, setColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('أدخل الرابط:', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-gray-50">
      <ToolbarButton
        title="تراجع"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        ↶
      </ToolbarButton>
      <ToolbarButton
        title="إعادة"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        ↷
      </ToolbarButton>

      <ToolbarDivider />

      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: Number(value) }).run();
          }
        }}
        value={
          editor.isActive('heading', { level: 1 }) ? '1'
          : editor.isActive('heading', { level: 2 }) ? '2'
          : editor.isActive('heading', { level: 3 }) ? '3'
          : editor.isActive('heading', { level: 4 }) ? '4'
          : editor.isActive('heading', { level: 5 }) ? '5'
          : editor.isActive('heading', { level: 6 }) ? '6'
          : 'paragraph'
        }
        className="h-9 border rounded px-2 text-sm bg-white min-w-[120px] dark:bg-[#0F1C16] dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
      >
        <option value="paragraph">فقرة</option>
        <option value="1">عنوان 1</option>
        <option value="2">عنوان 2</option>
        <option value="3">عنوان 3</option>
        <option value="4">عنوان 4</option>
        <option value="5">عنوان 5</option>
        <option value="6">عنوان 6</option>
      </select>

      <select
        onChange={(e) => {
          const size = e.target.value;
          if (size === 'default') {
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize(size).run();
          }
        }}
        className="h-9 border rounded px-2 text-sm bg-white min-w-[100px] dark:bg-[#0F1C16] dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
      >
        <option value="default">حجم الخط</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="28px">28px</option>
        <option value="32px">32px</option>
      </select>

      <ToolbarDivider />

      <ToolbarButton title="عريض" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton title="مائل" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton title="تحته خط" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton title="يتوسطه خط" isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton title="كود" isActive={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        {'</>'}
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton title="محاذاة لليمين" isActive={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        ≡R
      </ToolbarButton>
      <ToolbarButton title="محاذاة للوسط" isActive={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        ≡C
      </ToolbarButton>
      <ToolbarButton title="محاذاة لليسار" isActive={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        ≡L
      </ToolbarButton>
      <ToolbarButton title="ضبط" isActive={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
        ≡J
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton title="قائمة نقطية" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •≡
      </ToolbarButton>
      <ToolbarButton title="قائمة مرقمة" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1≡
      </ToolbarButton>
      <ToolbarButton title="اقتباس" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        "
      </ToolbarButton>
      <ToolbarButton title="كتلة كود" isActive={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {'{ }'}
      </ToolbarButton>
      <ToolbarButton title="خط فاصل" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ―
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton title="رابط" isActive={editor.isActive('link')} onClick={setLink}>
        🔗
      </ToolbarButton>
      <ToolbarButton
        title="إزالة الرابط"
        disabled={!editor.isActive('link')}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        ⛓️✕
      </ToolbarButton>
      <ToolbarButton title="صورة" onClick={addImage}>
        🖼️
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="تمييز"
        isActive={editor.isActive('highlight')}
        onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()}
      >
        🖍️
      </ToolbarButton>
      <input
        type="color"
        title="لون التمييز"
        value={highlightColor}
        onChange={(e) => {
          setHighlightColor(e.target.value);
          if (editor.isActive('highlight')) {
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
          }
        }}
        className="w-9 h-9 rounded border cursor-pointer bg-white"
      />

      <input
        type="color"
        title="لون النص"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          editor.chain().focus().setColor(e.target.value).run();
        }}
        className="w-9 h-9 rounded border cursor-pointer bg-white"
      />

      <ToolbarButton
        title="إزالة التنسيق"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      >
        ✕
      </ToolbarButton>
    </div>
  );
}

export default function TextEditor({
  initialContent = '',
  onChange,
  dir = 'rtl',
  placeholder = 'اكتب هنا...',
}) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontSize,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-main underline',
        },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],

    content: initialContent,

    editorProps: {
      attributes: {
        dir,
        class: 'min-h-[300px] p-4 outline-none prose prose-sm max-w-none',
      },
    },

    onUpdate: ({ editor: currentEditor }) => {
      onChange?.({
        html: currentEditor.getHTML(),
        text: currentEditor.getText(),
      });
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="border-t px-4 py-2 text-xs text-gray-400 text-left" dir="ltr">
        {editor.storage.characterCount.characters()} characters
      </div>
    </div>
  );
}
