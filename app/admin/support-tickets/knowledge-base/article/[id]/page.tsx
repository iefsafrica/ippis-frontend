import { ChevronLeft, Clock, Eye, Tag, Bookmark, Share2, ThumbsUp, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export const metadata = {
  title: "Article - IPPIS Knowledge Base",
  description: "Detailed knowledge base article",
}

export default function ArticlePage({ params }) {
  // In a real implementation, you would fetch the article data based on the ID
  const articleId = params.id

  // Sample article data
  const article = {
    id: articleId,
    title: "How to Verify Employee Documents",
    content: `
      <h2>Introduction</h2>
      <p>Document verification is a critical step in the employee registration process. This guide will walk you through the proper procedures for verifying employee documents in the IPPIS system.</p>
      
      <h2>Document Types</h2>
      <p>The IPPIS system requires verification of the following document types:</p>
      <ul>
        <li>Appointment Letter</li>
        <li>Educational Certificates</li>
        <li>Promotion Letters</li>
        <li>Identification Documents</li>
      </ul>
      
      <h2>Verification Process</h2>
      <p>Follow these steps to verify employee documents:</p>
      <ol>
        <li>Navigate to the Documents section in the admin dashboard</li>
        <li>Select the employee record that needs verification</li>
        <li>Review each document carefully for authenticity</li>
        <li>Check for official stamps, signatures, and watermarks</li>
        <li>Compare information with employee records in the database</li>
        <li>Mark the document as verified or rejected with appropriate comments</li>
      </ol>
      
      <h2>Common Issues</h2>
      <p>Be aware of these common issues during document verification:</p>
      <ul>
        <li>Illegible scans or photos</li>
        <li>Missing pages or information</li>
        <li>Inconsistent information across documents</li>
        <li>Expired certificates or credentials</li>
      </ul>
      
      <h2>Handling Rejections</h2>
      <p>When rejecting a document, always provide clear reasons and instructions for resubmission. This helps the employee understand what needs to be corrected.</p>
      
      <h2>Best Practices</h2>
      <p>To ensure efficient document verification:</p>
      <ul>
        <li>Establish a consistent verification schedule</li>
        <li>Document all verification decisions</li>
        <li>Maintain a verification checklist for each document type</li>
        <li>Regularly update verification guidelines based on policy changes</li>
      </ul>
    `,
    author: "Admin Support Team",
    category: "Document Management",
    tags: ["verification", "documents", "approval", "guidelines"],
    views: 1245,
    lastUpdated: "2023-09-15",
    createdAt: "2023-08-10",
    helpfulCount: 87,
    relatedArticles: [
      { id: 6, title: "Handling Document Rejection Appeals" },
      { id: 12, title: "Document Storage and Retention Policies" },
      { id: 18, title: "Recognizing Fraudulent Documents" },
    ],
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/admin/support-tickets/knowledge-base">
          <Button variant="ghost" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back to Knowledge Base
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {article.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{article.helpfulCount} found this helpful</span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />

            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Was this article helpful?</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ThumbsUp className="h-4 w-4" /> Yes
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      No
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Printer className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Related Articles</h3>
              <ul className="space-y-3">
                {article.relatedArticles.map((related) => (
                  <li key={related.id}>
                    <Link
                      href={`/admin/support-tickets/knowledge-base/article/${related.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/admin/support-tickets/knowledge-base?category=registration"
                    className="text-sm hover:underline"
                  >
                    Registration Process
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/support-tickets/knowledge-base?category=documents"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Document Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/support-tickets/knowledge-base?category=database"
                    className="text-sm hover:underline"
                  >
                    Database Operations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/support-tickets/knowledge-base?category=security"
                    className="text-sm hover:underline"
                  >
                    Security & Access
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/support-tickets/knowledge-base?category=general"
                    className="text-sm hover:underline"
                  >
                    General FAQs
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Need More Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button className="w-full">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
