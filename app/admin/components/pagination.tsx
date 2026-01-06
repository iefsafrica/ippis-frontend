// "use client"

// import { Button } from "@/components/ui/button"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// interface PaginationProps {
//   currentPage: number
//   totalPages: number
//   onPageChange: (page: number) => void
// }

// export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
//   // Generate page numbers to display
//   const getPageNumbers = () => {
//     const pages = []
//     const maxPagesToShow = 5

//     if (totalPages <= maxPagesToShow) {
//       // If total pages is less than max to show, display all pages
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i)
//       }
//     } else {
//       // Always include first page
//       pages.push(1)

//       // Calculate start and end of page range
//       let start = Math.max(2, currentPage - 1)
//       let end = Math.min(totalPages - 1, currentPage + 1)

//       // Adjust if at the beginning
//       if (currentPage <= 2) {
//         end = 4
//       }

//       // Adjust if at the end
//       if (currentPage >= totalPages - 1) {
//         start = totalPages - 3
//       }

//       // Add ellipsis if needed
//       if (start > 2) {
//         pages.push("...")
//       }

//       // Add page numbers
//       for (let i = start; i <= end; i++) {
//         pages.push(i)
//       }

//       // Add ellipsis if needed
//       if (end < totalPages - 1) {
//         pages.push("...")
//       }

//       // Always include last page
//       pages.push(totalPages)
//     }

//     return pages
//   }

//   const pageNumbers = getPageNumbers()

//   return (
//     <div className="flex items-center space-x-2">
//       <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
//         <ChevronLeft className="h-4 w-4" />
//         <span className="sr-only">Previous page</span>
//       </Button>

//       {pageNumbers.map((page, index) =>
//         page === "..." ? (
//           <span key={`ellipsis-${index}`} className="px-2">
//             ...
//           </span>
//         ) : (
//           <Button
//             key={`page-${page}`}
//             variant={currentPage === page ? "default" : "outline"}
//             size="icon"
//             onClick={() => onPageChange(Number(page))}
//             className={currentPage === page ? "bg-green-700 hover:bg-green-800" : ""}
//           >
//             {page}
//           </Button>
//         ),
//       )}

//       <Button
//         variant="outline"
//         size="icon"
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//       >
//         <ChevronRight className="h-4 w-4" />
//         <span className="sr-only">Next page</span>
//       </Button>
//     </div>
//   )
// }



"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        start = 2
        end = 4
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 3
        end = totalPages - 1
      }

      pages.push(1)

      if (start > 2) {
        pages.push("...")
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push("...")
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <span className="px-2 text-gray-400">...</span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="h-8 w-8"
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}