'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import type { DaySchedule, WeekSchedule } from '@/lib/horaires';

const DAY_KEYS: (keyof WeekSchedule)[] = [
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
];

const DAY_LABELS: Record<keyof WeekSchedule, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
};

const DEFAULT_SCHEDULE: DaySchedule = { open: '08:00', close: '20:00', closed: false };

interface HorairesEditorProps {
  value: WeekSchedule;
  onChange: (horaires: WeekSchedule) => void;
}

export default function HorairesEditor({ value, onChange }: HorairesEditorProps) {
  const updateDay = (day: keyof WeekSchedule, update: Partial<DaySchedule>) => {
    const current = value[day] || { ...DEFAULT_SCHEDULE };
    onChange({
      ...value,
      [day]: { ...current, ...update },
    });
  };

  const toggleClosed = (day: keyof WeekSchedule, closed: boolean) => {
    const current = value[day] || { ...DEFAULT_SCHEDULE };
    onChange({
      ...value,
      [day]: { ...current, closed, ...(closed ? {} : { open: current.open || '08:00', close: current.close || '20:00' }) },
    });
  };

  const copyFirstDayToAll = () => {
    const firstDay = value.lundi || DEFAULT_SCHEDULE;
    const newHoraires = { ...value };
    for (const day of DAY_KEYS) {
      newHoraires[day] = { ...firstDay };
    }
    onChange(newHoraires);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Horaires d&apos;ouverture</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={copyFirstDayToAll}
        >
          <Copy className="size-3 mr-1" />
          Copier lundi → tous
        </Button>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_1fr_1fr] gap-2 items-center px-1">
        <span className="text-xs font-medium text-muted-foreground">Jour</span>
        <span className="text-xs font-medium text-muted-foreground text-center">Fermé</span>
        <span className="text-xs font-medium text-muted-foreground">Ouverture</span>
        <span className="text-xs font-medium text-muted-foreground">Fermeture</span>
      </div>

      {/* Days */}
      {DAY_KEYS.map((day) => {
        const schedule = value[day] || DEFAULT_SCHEDULE;
        const isClosed = schedule.closed || false;

        return (
          <div
            key={day}
            className={`grid grid-cols-[1fr_80px_1fr_1fr] gap-2 items-center p-2 rounded-lg border transition-colors ${
              isClosed ? 'bg-muted/50 border-border/30' : 'bg-background border-border/60'
            }`}
          >
            <Label className="text-sm font-medium">{DAY_LABELS[day]}</Label>

            <div className="flex justify-center">
              <Switch
                checked={isClosed}
                onCheckedChange={(checked) => toggleClosed(day, checked)}
                className="data-[state=checked]:bg-muted-foreground"
              />
            </div>

            <Input
              type="time"
              value={isClosed ? '' : schedule.open}
              onChange={(e) => updateDay(day, { open: e.target.value })}
              disabled={isClosed}
              className="h-8 text-sm"
            />

            <Input
              type="time"
              value={isClosed ? '' : schedule.close}
              onChange={(e) => updateDay(day, { close: e.target.value })}
              disabled={isClosed}
              className="h-8 text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

export { DAY_KEYS, DAY_LABELS, DEFAULT_SCHEDULE };
