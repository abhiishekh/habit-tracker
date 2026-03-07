import { TrendingUp } from "lucide-react";
import { Card } from "../ui/card";

export const Heatmap = ({ calendar }: { calendar: any }) => {
    if (!calendar) return null;

    const getIndigoShade = (count: number) => {
        if (count === 0) return "bg-slate-100 dark:bg-zinc-800/50";
        if (count < 3) return "bg-indigo-200 dark:bg-indigo-900/30";
        if (count < 6) return "bg-indigo-400 dark:bg-indigo-700/50";
        if (count < 10) return "bg-indigo-600 dark:bg-indigo-500";
        return "bg-indigo-800 dark:bg-indigo-400";
    };

    return (
        <Card className="p-6 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 mb-10 overflow-hidden rounded-3xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-500" />
                        {calendar.totalContributions} contributions in the last year
                    </h2>
                    <p className="text-sm text-slate-500">
                        Peak performance tracked daily
                    </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    <span>Less</span>
                    <div className="flex items-center gap-1 mx-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-zinc-800/50" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-200 dark:bg-indigo-900/30" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 dark:bg-indigo-700/50" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-800 dark:bg-indigo-400" />
                    </div>
                    <span>More</span>
                </div>
            </div>
            <div className="w-full overflow-x-auto overflow-y-hidden">
                <div className="flex gap-1 w-max pb-2">
                    {calendar.weeks.map((week: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                            {week.contributionDays.map((day: any, j: number) => (
                                <div
                                    key={j}
                                    className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm transition-colors duration-500 ${getIndigoShade(
                                        day.contributionCount
                                    )}`}
                                    title={`${day.contributionCount} contributions on ${day.date}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};