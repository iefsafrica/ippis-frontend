"use client"

import { useState, useEffect } from "react"
import { PromotionContent } from "./promotion-content"
import { useToast } from "@/hooks/use-toast"

// Mock data for promotions
const mockPromotions = [
  {
    id: "prom-001",
    employee: "John Doe",
    employeeId: "EMP-001",
    company: "Ministry of Finance",
    promotionTitle: "Senior Accountant",
    date: "2023-05-15",
    previousPosition: "Accountant",
    details: "Promoted based on outstanding performance and completion of required certifications.",
  },
  {
    id: "prom-002",
    employee: "Jane Smith",
    employeeId: "EMP-002",
    company: "Ministry of Education",
    promotionTitle: "Principal",
    date: "2023-06-22",
    previousPosition: "Vice Principal",
    details: "Promoted after 5 years of excellent service and leadership.",
  },
  {
    id: "prom-003",
    employee: "Michael Johnson",
    employeeId: "EMP-003",
    company: "Ministry of Health",
    promotionTitle: "Senior Medical Officer",
    date: "2023-07-10",
    previousPosition: "Medical Officer",
    details: "Promoted based on additional qualifications and exemplary service.",
  },
  {
    id: "prom-004",
    employee: "Sarah Williams",
    employeeId: "EMP-004",
    company: "Ministry of Works",
    promotionTitle: "Chief Engineer",
    date: "2023-08-05",
    previousPosition: "Senior Engineer",
    details: "Promoted after successful completion of major infrastructure projects.",
  },
  {
    id: "prom-005",
    employee: "David Brown",
    employeeId: "EMP-005",
    company: "Ministry of Justice",
    promotionTitle: "Senior Legal Counsel",
    date: "2023-09-18",
    previousPosition: "Legal Counsel",
    details: "Promoted based on case success rate and years of service.",
  },
  {
    id: "prom-006",
    employee: "Elizabeth Taylor",
    employeeId: "EMP-006",
    company: "Ministry of Agriculture",
    promotionTitle: "Director of Research",
    date: "2023-10-30",
    previousPosition: "Research Coordinator",
    details: "Promoted after leading successful agricultural research initiatives.",
  },
  {
    id: "prom-007",
    employee: "Robert Wilson",
    employeeId: "EMP-007",
    company: "Ministry of Defense",
    promotionTitle: "Colonel",
    date: "2023-11-15",
    previousPosition: "Lieutenant Colonel",
    details: "Promoted based on leadership excellence and years of service.",
  },
  {
    id: "prom-008",
    employee: "Patricia Moore",
    employeeId: "EMP-008",
    company: "Ministry of Foreign Affairs",
    promotionTitle: "Senior Diplomat",
    date: "2023-12-05",
    previousPosition: "Diplomat",
    details: "Promoted after successful international assignments.",
  },
  {
    id: "prom-009",
    employee: "Thomas Anderson",
    employeeId: "EMP-009",
    company: "Ministry of Science and Technology",
    promotionTitle: "Head of Innovation",
    date: "2024-01-20",
    previousPosition: "Innovation Specialist",
    details: "Promoted based on technological innovations and patents.",
  },
  {
    id: "prom-010",
    employee: "Jennifer White",
    employeeId: "EMP-010",
    company: "Ministry of Information",
    promotionTitle: "Chief Communications Officer",
    date: "2024-02-10",
    previousPosition: "Communications Manager",
    details: "Promoted after successful public information campaigns.",
  },
]

export default function ClientWrapper() {
  const [promotions, setPromotions] = useState(mockPromotions)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Function to add a new promotion
  const handleAddPromotion = (newPromotion: any) => {
    const promotionWithId = {
      ...newPromotion,
      id: `prom-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
    }
    setPromotions([promotionWithId, ...promotions])
    toast({
      title: "Promotion Added",
      description: `${newPromotion.employee} has been promoted to ${newPromotion.promotionTitle}`,
      variant: "success",
    })
  }

  // Function to delete a promotion
  const handleDeletePromotion = (id: string) => {
    setPromotions(promotions.filter((promotion) => promotion.id !== id))
    toast({
      title: "Promotion Deleted",
      description: "The promotion record has been deleted successfully",
      variant: "success",
    })
  }

  // Function to handle search
  const handleSearch = (searchParams: any) => {
    // In a real app, this would call an API with search params
    // For now, we'll just filter the mock data
    if (!Object.values(searchParams).some((value) => value)) {
      setPromotions(mockPromotions)
      return
    }

    const filtered = mockPromotions.filter((promotion) => {
      return Object.entries(searchParams).every(([key, value]) => {
        if (!value) return true

        if (key === "dateFrom" && value) {
          return new Date(promotion.date) >= new Date(value as string)
        }

        if (key === "dateTo" && value) {
          return new Date(promotion.date) <= new Date(value as string)
        }

        if (key in promotion) {
          return promotion[key as keyof typeof promotion]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        }

        return true
      })
    })

    setPromotions(filtered)
  }

  return (
    <PromotionContent
      promotions={promotions}
      isLoading={isLoading}
      onAddPromotion={handleAddPromotion}
      onDeletePromotion={handleDeletePromotion}
      onSearch={handleSearch}
    />
  )
}
