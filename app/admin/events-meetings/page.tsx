import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Users, Video, Clock, MapPin } from "lucide-react"

export default function EventsMeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events & Meetings</h1>
          <p className="text-muted-foreground">Manage organization events, meetings, and gatherings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Events Management</h2>
            </div>
            <p className="text-gray-500 mb-6">
              Create and manage organization events, conferences, team building activities, and more.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Manage attendees and registrations</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>Track event locations and venues</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Schedule and organize event timelines</span>
              </div>
            </div>
            <div className="mt-6">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/admin/events-meetings/events">Manage Events</Link>
              </Button>
            </div>
          </div>
          <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
            <img src="/diverse-group.png" alt="Events Management" className="h-full w-auto object-cover" />
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Meetings Management</h2>
            </div>
            <p className="text-gray-500 mb-6">
              Schedule and organize meetings, track attendance, and manage meeting minutes and action items.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-green-500" />
                <span>Schedule recurring or one-time meetings</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 text-green-500" />
                <span>Manage participants and invitations</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-green-500" />
                <span>Track meeting minutes and action items</span>
              </div>
            </div>
            <div className="mt-6">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin/events-meetings/meetings">Manage Meetings</Link>
              </Button>
            </div>
          </div>
          <div className="h-40 bg-gradient-to-r from-green-50 to-teal-50 flex items-center justify-center">
            <img src="/professional-teamwork.png" alt="Meetings Management" className="h-full w-auto object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}
