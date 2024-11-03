'use client';

import { useRef } from 'react';
import { cn, withProps } from '@udecode/cn';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  someNode,
} from '@udecode/plate-common';
import {
  ParagraphPlugin,
  Plate,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { HeadingPlugin, TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { TodoListPlugin } from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin } from '@udecode/plate-media/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { SelectOnBackspacePlugin } from '@udecode/plate-select';
import {
  BlockMenuPlugin,
  BlockSelectionPlugin,
} from '@udecode/plate-selection/react';
import {
  SlashInputPlugin,
  SlashPlugin,
} from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { autoformatRules } from '@/lib/plate/autoformat-rules';
import { BlockquoteElement } from '@/components/plate-ui/blockquote-element';
import { CodeBlockElement } from '@/components/plate-ui/code-block-element';
import { CodeLeaf } from '@/components/plate-ui/code-leaf';
import { CodeLineElement } from '@/components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/components/plate-ui/code-syntax-leaf';
import { CommentLeaf } from '@/components/plate-ui/comment-leaf';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import {
  CursorOverlay,
  DragOverCursorPlugin,
  SelectionOverlayPlugin,
} from '@/components/plate-ui/cursor-overlay';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { HeadingElement } from '@/components/plate-ui/heading-element';
import { HighlightLeaf } from '@/components/plate-ui/highlight-leaf';
import { HrElement } from '@/components/plate-ui/hr-element';
import { ImageElement } from '@/components/plate-ui/image-element';
import { TodoLi, TodoMarker } from '@/components/plate-ui/indent-todo-marker';
import { KbdLeaf } from '@/components/plate-ui/kbd-leaf';
import { LinkElement } from '@/components/plate-ui/link-element';
import { LinkFloatingToolbar } from '@/components/plate-ui/link-floating-toolbar';
import { ParagraphElement } from '@/components/plate-ui/paragraph-element';
import { withPlaceholders } from '@/components/plate-ui/placeholder';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/components/plate-ui/table-cell-element';
import { TableElement } from '@/components/plate-ui/table-element';
import { TableRowElement } from '@/components/plate-ui/table-row-element';
import { TodoListElement } from '@/components/plate-ui/todo-list-element';
import { withDraggables } from '@/components/plate-ui/with-draggables';

import { BlockContextMenu } from './plate-ui/block-context-menu';
import { ColumnElement } from './plate-ui/column-element';
import { ColumnGroupElement } from './plate-ui/column-group-element';
import { DateElement } from './plate-ui/date-element';
import { SlashInputElement } from './plate-ui/slash-input-element';
import { TocElement } from './plate-ui/toc-element';
import { ToggleElement } from './plate-ui/toggle-element';

export default function PlateEditor({
  initialValue,
  setValue,
}: {
  initialValue: any;
  setValue: (value: any) => void;
}) {
  const containerRef = useRef(null);

  const editor = useMyEditor(initialValue);

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        editor={editor}
        onChange={({ value }) => {
          setValue(value);
        }}
      >
        <div
          id="scroll_container"
          ref={containerRef}
          className={cn(
            'relative',
            '[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4'
          )}
        >
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <Editor autoFocus focusRing={false} variant="demo" size="md" />

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>

          <CommentsPopover />

          <CursorOverlay containerRef={containerRef} />
        </div>
      </Plate>
    </DndProvider>
  );
}

export const useMyEditor = (initialValue: any) => {
  return usePlateEditor({
    plugins: [
      // Nodes
      HeadingPlugin,
      TocPlugin,
      BlockquotePlugin,
      CodeBlockPlugin,
      CodeLinePlugin,
      CodeSyntaxPlugin,
      HorizontalRulePlugin,
      LinkPlugin.configure({
        render: { afterEditable: () => <LinkFloatingToolbar /> },
      }),
      ImagePlugin,
      CaptionPlugin.configure({
        options: { plugins: [ImagePlugin] },
      }),
      TablePlugin,
      TableRowPlugin,
      TableCellPlugin,
      TableCellHeaderPlugin,
      TodoListPlugin,
      ColumnPlugin,
      ColumnItemPlugin,

      // Marks
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      SubscriptPlugin,
      SuperscriptPlugin,
      FontColorPlugin,
      FontBackgroundColorPlugin,
      FontSizePlugin,
      HighlightPlugin,
      KbdPlugin,

      // Block Style
      DatePlugin,
      TogglePlugin,
      AlignPlugin.configure({
        inject: {
          targetPlugins: [ParagraphPlugin.key, ...HEADING_LEVELS],
        },
      }),
      IndentPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            ...HEADING_LEVELS,
          ],
        },
      }),
      IndentListPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            BlockquotePlugin.key,
            CodeBlockPlugin.key,
            ...HEADING_LEVELS,
          ],
        },
        options: {
          listStyleTypes: {
            todo: {
              liComponent: TodoLi,
              markerComponent: TodoMarker,
              type: 'todo',
            },
          },
        },
      }),
      LineHeightPlugin.configure({
        inject: {
          nodeProps: {
            defaultNodeValue: 1.5,
            validNodeValues: [1, 1.2, 1.5, 2, 3],
          },
          targetPlugins: [ParagraphPlugin.key, ...HEADING_LEVELS],
        },
      }),

      // Functionality
      SlashPlugin,
      AutoformatPlugin.configure({
        options: {
          rules: autoformatRules,
          enableUndoOnDelete: true,
        },
      }),
      BlockSelectionPlugin.configure({
        options: {
          areaOptions: {
            behaviour: {
              scrolling: {
                startScrollMargins: { x: 0, y: 0 },
              },
            },
            boundaries: '#scroll_container',
            container: '#scroll_container',
            selectables: '#scroll_container .slate-selectable',
            selectionAreaClass: 'slate-selection-area',
          },
          enableContextMenu: true,
        },
      }),
      BlockMenuPlugin.configure({
        render: { aboveEditable: BlockContextMenu },
      }),
      DndPlugin.configure({
        options: { enableScroller: true },
      }),
      EmojiPlugin,
      ExitBreakPlugin.configure({
        options: {
          rules: [
            {
              hotkey: 'mod+enter',
            },
            {
              hotkey: 'mod+shift+enter',
              before: true,
            },
            {
              hotkey: 'enter',
              query: {
                start: true,
                end: true,
                allow: HEADING_LEVELS,
              },
              relative: true,
              level: 1,
            },
          ],
        },
      }),
      NodeIdPlugin,
      ResetNodePlugin.configure({
        options: {
          rules: [
            {
              types: [BlockquotePlugin.key, TodoListPlugin.key],
              defaultType: ParagraphPlugin.key,
              hotkey: 'Enter',
              predicate: isBlockAboveEmpty,
            },
            {
              types: [BlockquotePlugin.key, TodoListPlugin.key],
              defaultType: ParagraphPlugin.key,
              hotkey: 'Backspace',
              predicate: isSelectionAtBlockStart,
            },
            {
              types: [CodeBlockPlugin.key],
              defaultType: ParagraphPlugin.key,
              onReset: unwrapCodeBlock,
              hotkey: 'Enter',
              predicate: isCodeBlockEmpty,
            },
            {
              types: [CodeBlockPlugin.key],
              defaultType: ParagraphPlugin.key,
              onReset: unwrapCodeBlock,
              hotkey: 'Backspace',
              predicate: isSelectionAtCodeBlockStart,
            },
          ],
        },
      }),
      SelectOnBackspacePlugin.configure({
        options: {
          query: {
            allow: [ImagePlugin.key, HorizontalRulePlugin.key],
          },
        },
      }),
      SoftBreakPlugin.configure({
        options: {
          rules: [
            { hotkey: 'shift+enter' },
            {
              hotkey: 'enter',
              query: {
                allow: [
                  CodeBlockPlugin.key,
                  BlockquotePlugin.key,
                  TableCellPlugin.key,
                  TableCellHeaderPlugin.key,
                ],
              },
            },
          ],
        },
      }),
      TabbablePlugin.configure(({ editor }) => ({
        options: {
          query: () => {
            if (isSelectionAtBlockStart(editor)) return false;

            return !someNode(editor, {
              match: (n) => {
                return !!(
                  n.type &&
                  ([
                    TablePlugin.key,
                    TodoListPlugin.key,
                    CodeBlockPlugin.key,
                  ].includes(n.type as string) ||
                    n.listStyleType)
                );
              },
            });
          },
        },
      })),
      TrailingBlockPlugin.configure({
        options: { type: ParagraphPlugin.key },
      }),
      SelectionOverlayPlugin,
      DragOverCursorPlugin,
      // Collaboration
      CommentsPlugin.configure({
        options: {
          myUserId: '1',
        },
      }),

      // Deserialization
      DocxPlugin,
      MarkdownPlugin,
      JuicePlugin,
    ],
    override: {
      components: withDraggables(
        withPlaceholders({
          [DatePlugin.key]: DateElement,
          [SlashInputPlugin.key]: SlashInputElement,
          [TogglePlugin.key]: ToggleElement,
          [BlockquotePlugin.key]: BlockquoteElement,
          [CodeBlockPlugin.key]: CodeBlockElement,
          [CodeLinePlugin.key]: CodeLineElement,
          [TocPlugin.key]: TocElement,
          [ColumnItemPlugin.key]: ColumnElement,
          [ColumnPlugin.key]: ColumnGroupElement,
          [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
          [HorizontalRulePlugin.key]: HrElement,
          [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: 'h1' }),
          [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: 'h2' }),
          [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: 'h3' }),
          [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: 'h4' }),
          [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: 'h5' }),
          [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: 'h6' }),
          [ImagePlugin.key]: ImageElement,
          [LinkPlugin.key]: LinkElement,
          [ParagraphPlugin.key]: ParagraphElement,
          [TablePlugin.key]: TableElement,
          [TableRowPlugin.key]: TableRowElement,
          [TableCellPlugin.key]: TableCellElement,
          [TableCellHeaderPlugin.key]: TableCellHeaderElement,
          [TodoListPlugin.key]: TodoListElement,
          [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
          [CodePlugin.key]: CodeLeaf,
          [HighlightPlugin.key]: HighlightLeaf,
          [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
          [KbdPlugin.key]: KbdLeaf,
          [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
          [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
          [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
          [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
          [CommentsPlugin.key]: CommentLeaf,
        })
      ),
    },
    value: initialValue,
  });
};
