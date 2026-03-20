import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { RaceScheduleType, RaceType } from '@/types/race.type';
import RaceCard from './RaceCard';
import { Calendar, ThermometerSun } from 'lucide-react';

type Props = {
  date: string;
  year: string;
  races: Record<string, RaceType>;
  raceSchedule: RaceScheduleType[];
  addRaceSchedule: (race: RaceScheduleType) => void;
  deleteRaceSchedule: (name: string, year: string) => void;
};

export default function RaceDateCard({
  date,
  year,
  races,
  raceSchedule,
  addRaceSchedule,
  deleteRaceSchedule,
}: Props) {
  const filtered = Object.entries(races).filter(
    ([, data]) => data.date === date,
  );
  const selectedRaces = raceSchedule.filter(
    race => race.date === date && race.year === year,
  );

  return (
    <Dialog>
      <DialogTrigger
        disabled={filtered.length === 0}
        className={`
            group relative min-h-22 rounded-xl border text-sm font-medium transition-all duration-200
            ${
              filtered.length === 0
                ? 'border-muted-foreground/20 text-muted-foreground/40 cursor-not-allowed bg-muted/30'
                : selectedRaces.length > 0
                  ? 'border-primary bg-primary/10 text-foreground shadow-sm cursor-pointer'
                  : 'border-border hover:border-primary/40 hover:bg-primary/5 text-foreground cursor-pointer'
            }
          `}
      >
        <div className='flex flex-col items-center justify-center h-full p-2 gap-0.5 overflow-hidden w-full'>
          {['Early Jul', 'Late Jul', 'Early Aug', 'Late Aug'].includes(date) &&
            !year.includes('Junior Year') && (
              <ThermometerSun
                className='absolute right-2 top-2 shrink-0'
                size={16}
              />
            )}
          <span className='text-sm font-semibold text-center leading-tight'>
            {date}
          </span>
          {filtered.length > 0 && (
            <>
              {selectedRaces.length > 0 ? (
                selectedRaces.map((r, i) => (
                  <div
                    key={r.name + i}
                    className='flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 w-full px-1'
                  >
                    <span className='text-[11px] leading-tight text-center wrap-break-word min-w-0'>
                      {r.name}
                    </span>
                    <div className='flex items-center gap-0.5 shrink-0'>
                      {races[r.name]?.grade === 'G1' && (
                        <Badge className='text-[9px] px-1 py-0 h-3.5 bg-yellow-500 text-yellow-950 hover:bg-yellow-500'>
                          G1
                        </Badge>
                      )}
                      {races[r.name]?.grade === 'G2' && (
                        <Badge className='text-[9px] px-1 py-0 h-3.5 bg-slate-400 text-slate-950 hover:bg-slate-400'>
                          G2
                        </Badge>
                      )}
                      {races[r.name]?.grade === 'G3' && (
                        <Badge className='text-[9px] px-1 py-0 h-3.5 bg-amber-700 text-amber-100 hover:bg-amber-700'>
                          G3
                        </Badge>
                      )}
                      {races[r.name] && (
                        <span className='text-[9px] text-muted-foreground whitespace-nowrap'>
                          {races[r.name].terrain} {races[r.name].distance.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className='text-[11px] text-center leading-tight'>
                  {filtered.length} Race{filtered.length > 1 ? 's' : ''}{' '}
                  Available
                </span>
              )}
              {selectedRaces.length > 0 && (
                <Badge className='mt-0.5 text-[10px] px-1.5 py-0 h-4'>
                  Selected
                </Badge>
              )}
            </>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Calendar className='w-5 h-5' />
            {date} - {year}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>Race date card dialog</DialogDescription>

        <div className='grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pb-4'>
          {filtered.map(([title, race]) => (
            <RaceCard
              key={title}
              title={title}
              race={race}
              year={year}
              isSelected={selectedRaces.some(r => r.name === title)}
              onSelect={() =>
                addRaceSchedule({ name: title, year, date: race.date })
              }
              onDeselect={() => deleteRaceSchedule(title, year)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
