import { MessageCircle, Star, Zap, Trophy } from "lucide-react"

const ALLOCATIONS = [
    {
        id: 1,
        name: "Talk to Shreyas",
        weight: "1/10",
        icon: MessageCircle,
        label: "Active Campaign"
    },
    {
        id: 2,
        name: "Communication Quality",
        weight: "4/10",
        icon: Star,
        label: "Engagement Metric"
    },
    {
        id: 3,
        name: "Community Impact",
        weight: "3/10",
        icon: Zap,
        label: "Engagement Metric"
    },
    {
        id: 4,
        name: "Consistency",
        weight: "2/10",
        icon: Trophy,
        label: "Engagement Metric"
    }
]

export function PointsList() {
    return (
        <>
            {ALLOCATIONS.map((item) => (
                <div
                    key={item.id}
                    className="group relative border-sketchy p-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,32,96,0.2)] bg-reach-paper/90 backdrop-blur-sm m-2"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-reach-blue text-reach-paper border border-reach-blue">
                                <item.icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <h3 className="font-display text-lg uppercase tracking-tight text-reach-blue font-bold">{item.name}</h3>
                                <p className="font-mono text-[10px] opacity-60 uppercase tracking-widest">{item.label}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-display text-2xl text-reach-blue font-extrabold">{item.weight}</span>
                            <span className="font-mono text-[10px] ml-1 opacity-60">WGT</span>
                        </div>
                    </div>

                    {/* Corner accents with construction lines */}
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-reach-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-reach-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            ))}

            {/* Empty State / Placeholder for "More" */}
            <div className="border-2 border-dashed border-reach-blue/30 p-4 flex items-center justify-center opacity-50 bg-crosshatch-light m-2">
                <span className="font-mono text-xs uppercase text-reach-blue bg-reach-paper px-2">Total Weight: 10/10</span>
            </div>
        </>
    )
}
