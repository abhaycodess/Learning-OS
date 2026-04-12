import { ChevronRight } from 'lucide-react'

const ContinueLearningCarousel = ({ courses = [] }) => {
  const defaultCourses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      progress: 65,
      instructor: 'Sarah Chen',
      lessons: 12,
    },
    {
      id: 2,
      title: 'System Design Fundamentals',
      progress: 42,
      instructor: 'Alex Kumar',
      lessons: 8,
    },
    {
      id: 3,
      title: 'Database Optimization',
      progress: 88,
      instructor: 'Mike Johnson',
      lessons: 15,
    },
  ]

  const items = courses.length ? courses : defaultCourses

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-xl font-medium text-stone-900">Continue Learning</h3>
        <button className="flex items-center gap-1 text-sm text-primary hover:text-primary-light">
          View all <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent]">
        {items.map((course, index) => (
          <div
            key={course.id}
            className="animate-fade-up flex-shrink-0 card-hover w-72 overflow-hidden rounded-xl border border-stone-200 bg-white transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Course image placeholder */}
            <div className="h-40 bg-gradient-to-br from-stone-100 to-stone-200" />

            <div className="p-4">
              <h4 className="font-heading text-base font-medium text-stone-900">{course.title}</h4>
              <p className="mt-1 text-xs text-stone-500">{course.instructor}</p>

              {/* Progress bar */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-stone-600">{course.progress}% Complete</p>

              {/* Lesson count */}
              <p className="mt-3 text-xs font-medium text-stone-600">{course.lessons} lessons</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContinueLearningCarousel
