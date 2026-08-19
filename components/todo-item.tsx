"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import {
  CATEGORY_META,
  DEFAULT_PRIORITY,
  PRIORITY_META,
  type Todo,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraft(todo.text);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    onEdit(todo.id, draft);
  }

  function cancel() {
    setEditing(false);
    setDraft(todo.text);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    // IME 조합 중(한글 등)에 확정용으로 누른 Enter는 무시한다.
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  }

  const priority = PRIORITY_META[todo.priority] ?? PRIORITY_META[DEFAULT_PRIORITY];
  const category = todo.category ? CATEGORY_META[todo.category] : undefined;

  return (
    <li className="flex flex-col gap-2 rounded-md border border-border px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          aria-label={todo.completed ? "완료 취소" : "완료로 표시"}
        />

        {editing ? (
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            className="h-7 flex-1"
            aria-label="할 일 편집"
          />
        ) : (
          <span
            onDoubleClick={startEditing}
            className={cn(
              "min-w-0 flex-1 cursor-pointer break-words",
              todo.completed && "text-muted-foreground line-through"
            )}
          >
            {todo.text}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
        {todo.dueDate && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {todo.dueDate}
          </span>
        )}

        {category && (
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[0.625rem] font-medium leading-none",
              category.badgeClass
            )}
          >
            {category.label}
          </span>
        )}

        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[0.625rem] font-medium leading-none",
            priority.badgeClass
          )}
        >
          {priority.label}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(todo.id)}
          aria-label="삭제"
        >
          <XIcon />
        </Button>
      </div>
    </li>
  );
}
