import { Priority } from '../types';
import { PRIORITY_COLORS } from './constants';
import type { Ticket } from '../types';
import { supabase } from "@/lib/supabaseClient";
 

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
    if (!tickets.length) {
        return (
            <div className="text-center text-slate-400 py-20">
                No issues found
            </div>
        );
    }
    function StatusBadge({ status }: { status: string }) {
        const map: Record<string, string> = {
            TODO: 'bg-slate-200 text-slate-700',
            ACKNOWLEDGED: 'bg-blue-100 text-blue-700',
            IN_REVIEW: 'bg-purple-100 text-purple-700',
            DONE: 'bg-green-100 text-green-700',
        };

        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${map[status]}`}>
                {status.replace('_', ' ')}
            </span>
        );
    }

    function PriorityDot({ priority }: { priority: Priority }) {
        return (
            <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${PRIORITY_COLORS[priority]}`}
                title={priority}
            />
        );
    }



    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-slate-50 text-slate-600">
                        <th className="text-left px-4 py-3">Key</th>
                        <th className="text-left px-4 py-3">Summary</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Priority</th>
                        <th className="text-left px-4 py-3">Date</th>
                        <th className="text-left px-4 py-3">Created</th>
                    </tr>
                </thead>

                <tbody>
                    {tickets.map(ticket => (
                        <tr
                            key={ticket.id}
                            className="border-b hover:bg-slate-50 transition"
                        >
                            <td className="px-4 py-3 text-blue-600 font-medium">
                                NR-{ticket.id.slice(0, 4)}
                            </td>

                            <td className="px-4 py-3">
                                {ticket.title}
                            </td>

                            <td className="px-4 py-3">
                                <StatusBadge status={ticket.status} />
                            </td>

                            <td className="px-4 py-3">
                                <PriorityDot priority={ticket.priority} />
                            </td>


                            <td className="px-4 py-3 text-slate-500">
                                {new Date(ticket.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

