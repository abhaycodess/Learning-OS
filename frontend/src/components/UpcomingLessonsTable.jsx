import { Calendar, Clock } from 'lucide-react'

const UpcomingLessonsTable = ({ lessons = [] }) => {
  const defaultLessons = [
    {
      id: 1,
      title: 'React Hooks Deep Dive',
      subject: 'React',
      dueDate: '2024-04-15',
      time: '2:00 PM',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Database Indexing Strategies',
      subject: 'Database',
      dueDate: '2024-04-16',
      time: '10:00 AM',
      status: 'pending',
    },
    {
      id: 3,
      title: 'API Security Best Practices',
      subject: 'Backend',
      dueDate: '2024-04-17',
      time: '3:30 PM',
      status: 'in-progress',
    },
    {
      id: 4,
      title: 'Testing Frameworks Comparison',
      subject: 'Testing',
      dueDate: '2024-04-18',
      time: '11:00 AM',
      status: 'pending',
    },
  ]

  const items = lessons.length ? lessons : defaultLessons

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
  }

  const subjectColors = {
    React: 'bg-blue-100 text-blue-700',
    Database: 'bg-pink-100 text-pink-700',
    Backend: 'bg-purple-100 text-purple-700',
    Testing: 'bg-green-100 text-green-700',
  }

  return (
    <div>
      <h3 className="mb-4 font-heading text-xl font-medium text-stone-900">Upcoming Lessons</h3>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Lesson
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((lesson, index) => (
              <tr
                key={lesson.id}
                className="animate-fade-up border-b border-stone-100 transition-colors hover:bg-stone-50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-stone-900">{lesson.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                      <Clock size={14} />
                      {lesson.time}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block rounded-lg px-2 py-1 text-xs font-medium ${
                      subjectColors[lesson.subject] || 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {lesson.subject}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-stone-600">
                    <Calendar size={14} />
                    {new Date(lesson.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block rounded-lg border px-2 py-1 text-xs font-medium ${
                      statusColors[lesson.status] || statusColors.pending
                    }`}
                  >
                    {lesson.status === 'in-progress' ? 'In Progress' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UpcomingLessonsTable
