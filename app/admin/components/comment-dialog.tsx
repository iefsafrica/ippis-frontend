"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"

interface CommentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (comment: string) => Promise<void>
  title: string
  description: string
  type: "approve" | "reject"
  entityName: string
}

export function CommentDialog({ isOpen, onClose, onSubmit, title, description, type, entityName }: CommentDialogProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (type === "reject" && !comment.trim()) {
      setError("Please provide a reason for rejection")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(comment)
      setComment("")
      onClose()
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "approve" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder={`Enter ${type === "approve" ? "additional notes (optional)" : "reason for rejection"}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px]"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="bg-red-600 text-white">
            Decline
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {type === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
