export function FallbackChart() {
  return (
    <div className="h-[300px] w-full">
      <div className="animate-pulse flex flex-col space-y-3">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="flex space-x-2">
            <div className="h-3 bg-primary/20 rounded w-12"></div>
            <div className="h-3 bg-blue-200 rounded w-12"></div>
          </div>
        </div>
        <div className="h-[250px] bg-gray-100 rounded-lg relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-200 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-300"></div>
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-300"></div>

          {/* Simulated chart lines */}
          <div
            className="absolute bottom-[20%] left-0 right-0 h-[2px] bg-primary/20 rounded-full"
            style={{ clipPath: "polygon(0% 0%, 20% 50%, 40% 30%, 60% 70%, 80% 50%, 100% 80%)" }}
          ></div>
          <div
            className="absolute bottom-[10%] left-0 right-0 h-[2px] bg-blue-200 rounded-full"
            style={{ clipPath: "polygon(0% 30%, 20% 20%, 40% 60%, 60% 40%, 80% 70%, 100% 60%)" }}
          ></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  )
}
