import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/app/Field";
import { useQuoteStore } from "@/services/coffee/store";

/**
 * Editable list of "공통 안내" lines shown at the bottom of the
 * quote. Auto-generated lines (care cycle reminder, shipping note,
 * bean inclusion) are appended at render time and not editable here.
 */
export function NotesPanel() {
  const notes = useQuoteStore((s) => s.commonNotes);
  const updateNote = useQuoteStore((s) => s.updateNote);
  const removeNote = useQuoteStore((s) => s.removeNote);
  const addNote = useQuoteStore((s) => s.addNote);
  const resetNotes = useQuoteStore((s) => s.resetNotes);

  return (
    <FieldGroup
      title="공통 안내"
      description="견적서 하단에 인쇄되는 안내문입니다. 자유롭게 수정/추가/삭제할 수 있어요."
    >
      <div className="space-y-2 rounded-md border border-border bg-card p-2.5">
        {notes.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            안내문이 비어 있습니다. 아래 “추가”로 새 줄을 만들어주세요.
          </p>
        )}
        {notes.map((note, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <textarea
              value={note}
              onChange={(e) => updateNote(i, e.target.value)}
              rows={Math.min(4, Math.max(1, note.split("\n").length))}
              className="flex-1 resize-none rounded-md border border-input bg-background px-2.5 py-1.5 text-xs leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="안내 문구를 입력하세요"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeNote(i)}
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => addNote()}
          className="gap-1.5"
        >
          <Plus className="h-3 w-3" />
          줄 추가
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={resetNotes}
          className="gap-1.5"
        >
          <RotateCcw className="h-3 w-3" />
          기본값 복원
        </Button>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground/80">
        ※ 케어주기·택배비·원두 포함 여부 같은 컨텍스트 안내는 견적서에 자동으로 추가됩니다.
      </p>
    </FieldGroup>
  );
}
